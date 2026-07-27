import { unzipSync } from 'fflate'
import type { TableOfContentsItem } from '../types'

export type EpubSection = {
  id: string
  title: string
  content: string
  html: string
}

export type ParsedEpubDocument = {
  title: string
  sections: EpubSection[]
  toc: TableOfContentsItem[]
}

export type EpubExcerpt = {
  title: string
  html: string
  toc: TableOfContentsItem[]
}

export type EpubDebugLogger = {
  log: (message: string, details?: unknown) => void
  warn: (message: string, details?: unknown) => void
  error: (message: string, details?: unknown) => void
}

export const createEpubDebugLogger = (enabled: boolean): EpubDebugLogger => ({
  log: (message, details) => {
    if (!enabled) return
    console.log(`[EPUB] ${message}`, details ?? '')
  },
  warn: (message, details) => {
    if (!enabled) return
    console.warn(`[EPUB] ${message}`, details ?? '')
  },
  error: (message, details) => {
    if (!enabled) return
    console.error(`[EPUB] ${message}`, details ?? '')
  },
})

const textDecoder = new TextDecoder()

const decode = (bytes: Uint8Array | undefined) => (bytes ? textDecoder.decode(bytes) : '')

const stripTags = (value: string) =>
  value
    .replace(/<\/?(?:[^>]+)>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim()

export const resolvePath = (basePath: string, relativePath: string) => {
  if (/^(?:[a-z]+:)?\/\//i.test(relativePath) || relativePath.startsWith('data:')) {
    return relativePath
  }
  const cleaned = relativePath.split('#')[0].split('?')[0]
  const baseParts = normalizeZipPath(basePath).split('/').filter(Boolean)
  baseParts.pop()
  for (const part of cleaned.split('/')) {
    if (!part || part === '.') continue
    if (part === '..') {
      baseParts.pop()
      continue
    }
    baseParts.push(part)
  }
  return baseParts.join('/')
}

const normalizeZipPath = (path: string) =>
  path.replace(/\\/g, '/').replace(/^\.\//, '').replace(/^\/+/, '')

const findZipEntry = (files: Record<string, Uint8Array>, path: string) => {
  const target = normalizeZipPath(path)
  if (files[target]) return files[target]
  const matched = Object.keys(files).find((key) => normalizeZipPath(key).toLowerCase() === target.toLowerCase())
  return matched ? files[matched] : undefined
}

const readZipText = (files: Record<string, Uint8Array>, path: string) => {
  const content = decode(findZipEntry(files, path))
  if (!content) throw new Error(`Missing EPUB entry: ${path}`)
  return content
}

const parseAttributes = (tag: string) => {
  const attributes: Record<string, string> = {}
  for (const match of tag.matchAll(/([\w:-]+)=(['"])(.*?)\2/g)) {
    attributes[match[1]] = match[3]
  }
  return attributes
}

const parseContainer = (xml: string) => {
  const match = xml.match(/full-path=(['"])(.*?)\1/i)
  return match?.[2] ?? 'content.opf'
}

const parseMetadataTitle = (opf: string, fallback: string) => {
  const title = opf.match(/<dc:title[^>]*>([\s\S]*?)<\/dc:title>/i)?.[1]
  return stripTags(title ?? fallback)
}

const parseManifest = (opf: string) => {
  const manifest = new Map<string, string>()
  for (const match of opf.matchAll(/<item\b([^>]*?)\/?>(?:\s*<\/item>)?/gi)) {
    const attributes = parseAttributes(match[1])
    if (attributes.id && attributes.href) manifest.set(attributes.id, attributes.href)
  }
  return manifest
}

const parseSpine = (opf: string) =>
  Array.from(opf.matchAll(/<itemref\b([^>]*?)\/?>(?:\s*<\/itemref>)?/gi))
    .map((match) => {
      const attributes = parseAttributes(match[1])
      return attributes.idref ?? ''
    })
    .filter(Boolean)

const parseNav = (html: string) => {
  const navMatch = html.match(/<nav[^>]*epub:type=["']toc["'][^>]*>([\s\S]*?)<\/nav>/i)
  if (!navMatch) return []

  return Array.from(navMatch[1].matchAll(/<a[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)).map(
    (match, index) => ({
      id: `epub-toc-${index}`,
      level: 1,
      title: stripTags(match[2]),
    }),
  )
}

const parseNcx = (xml: string) =>
  Array.from(xml.matchAll(/<navPoint[\s\S]*?<text>([\s\S]*?)<\/text>[\s\S]*?<\/navPoint>/gi)).map(
    (match, index) => ({
      id: `epub-toc-${index}`,
      level: 1,
      title: stripTags(match[1]),
    }),
  )

const extractBodyText = (html: string) => {
  const withoutScripts = html.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ')
  return stripTags(withoutScripts)
}

export const EPUB_SECTION_SEPARATOR = '\n<!--joint-md-epub-section-->\n'

const mimeFromPath = (path: string) => {
  if (/\.png$/i.test(path)) return 'image/png'
  if (/\.jpe?g$/i.test(path)) return 'image/jpeg'
  if (/\.gif$/i.test(path)) return 'image/gif'
  if (/\.webp$/i.test(path)) return 'image/webp'
  if (/\.svg$/i.test(path)) return 'image/svg+xml'
  if (/\.css$/i.test(path)) return 'text/css'
  if (/\.woff2$/i.test(path)) return 'font/woff2'
  if (/\.woff$/i.test(path)) return 'font/woff'
  if (/\.ttf$/i.test(path)) return 'font/ttf'
  if (/\.otf$/i.test(path)) return 'font/otf'
  return 'application/octet-stream'
}

const bytesToBase64 = (bytes: Uint8Array) => {
  let binary = ''
  const chunkSize = 0x8000
  for (let index = 0; index < bytes.length; index += chunkSize) {
    const chunk = bytes.subarray(index, index + chunkSize)
    binary += String.fromCharCode(...chunk)
  }
  return btoa(binary)
}

const assetDataUrl = (
  files: Record<string, Uint8Array>,
  assetPath: string,
  cache: Map<string, string>,
) => {
  const normalized = normalizeZipPath(assetPath)
  const cached = cache.get(normalized)
  if (cached) return cached

  const bytes = findZipEntry(files, normalized)
  if (!bytes) return null

  const dataUrl = `data:${mimeFromPath(normalized)};base64,${bytesToBase64(bytes)}`
  cache.set(normalized, dataUrl)
  return dataUrl
}

const rewriteCssUrls = (
  css: string,
  basePath: string,
  files: Record<string, Uint8Array>,
  cache: Map<string, string>,
) =>
  css.replace(/url\((['"]?)([^)'"]+)\1\)/gi, (full, _quote: string, rawUrl: string) => {
    const url = rawUrl.trim()
    if (!url || url.startsWith('data:') || /^(?:[a-z]+:)?\/\//i.test(url)) return full
    const resolved = resolvePath(basePath, url)
    const dataUrl = assetDataUrl(files, resolved, cache)
    return dataUrl ? `url("${dataUrl}")` : full
  })

const collectChapterStyles = (
  chapterHtml: string,
  chapterPath: string,
  files: Record<string, Uint8Array>,
  cache: Map<string, string>,
) => {
  const styles: string[] = []

  for (const match of chapterHtml.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)) {
    styles.push(rewriteCssUrls(match[1], chapterPath, files, cache))
  }

  for (const match of chapterHtml.matchAll(/<link\b[^>]*>/gi)) {
    const tag = match[0]
    if (!/rel=["']stylesheet["']/i.test(tag)) continue
    const href = tag.match(/href=["']([^"']+)["']/i)?.[1]
    if (!href || /^(?:[a-z]+:)?\/\//i.test(href) || href.startsWith('data:')) continue
    const cssPath = resolvePath(chapterPath, href)
    const css = decode(findZipEntry(files, cssPath))
    if (css) styles.push(rewriteCssUrls(css, cssPath, files, cache))
  }

  return styles.filter((style) => style.trim().length > 0)
}

const rewriteHtmlAssets = (
  html: string,
  chapterPath: string,
  files: Record<string, Uint8Array>,
  cache: Map<string, string>,
) =>
  html
    .replace(/\s(src|xlink:href)=(['"])([^'"]+)\2/gi, (full, name: string, quote: string, rawUrl: string) => {
      if (!rawUrl || rawUrl.startsWith('data:') || /^(?:[a-z]+:)?\/\//i.test(rawUrl) || rawUrl.startsWith('#')) {
        return full
      }
      const resolved = resolvePath(chapterPath, rawUrl)
      const dataUrl = assetDataUrl(files, resolved, cache)
      if (!dataUrl) return full
      return ` ${name}=${quote}${dataUrl}${quote}`
    })
    .replace(/\sstyle=(['"])([\s\S]*?)\1/gi, (_full, quote: string, styleValue: string) => {
      const rewritten = rewriteCssUrls(styleValue, chapterPath, files, cache)
      return ` style=${quote}${rewritten}${quote}`
    })

const extractBodyHtml = (
  chapterHtml: string,
  chapterPath: string,
  files: Record<string, Uint8Array>,
  cache: Map<string, string>,
) => {
  const body = chapterHtml.match(/<body[^>]*>([\s\S]*)<\/body>/i)?.[1] ?? chapterHtml
  const cleaned = body
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .trim()
  const withAssets = rewriteHtmlAssets(cleaned, chapterPath, files, cache)
  const styles = collectChapterStyles(chapterHtml, chapterPath, files, cache)
  if (!styles.length) return withAssets
  return `<style data-joint-md-epub-css="true">${styles.join('\n')}</style>\n${withAssets}`
}

export const joinEpubSections = (sections: EpubSection[]) =>
  sections.map((section) => section.html).join(EPUB_SECTION_SEPARATOR)

export const splitEpubSections = (content: string) =>
  content.split(EPUB_SECTION_SEPARATOR).filter((section) => section.trim().length > 0)

export const isAcceptedEpubName = (name: string) => /\.epub$/i.test(name)

export const parseEpubDocument = async (
  file: File,
  logger: EpubDebugLogger = createEpubDebugLogger(false),
): Promise<ParsedEpubDocument> => {
  try {
    logger.log('start parse', { name: file.name, size: file.size, type: file.type })
    const files = unzipSync(new Uint8Array(await file.arrayBuffer()))
    logger.log('zip entries', Object.keys(files).length)
    const containerXml = readZipText(files, 'META-INF/container.xml')
    logger.log('container.xml parsed')
    const opfPath = parseContainer(containerXml)
    logger.log('opf path', opfPath)
    const opf = readZipText(files, opfPath)
    const title = parseMetadataTitle(opf, file.name.replace(/\.epub$/i, ''))
    const manifest = parseManifest(opf)
    const spine = parseSpine(opf)
    logger.log('manifest/spine counts', { manifest: manifest.size, spine: spine.length })
    const opfBase = opfPath
    const navPath = Array.from(manifest.entries()).find(
      ([, href]) => /nav\.xhtml$/i.test(href) || /toc\.xhtml$/i.test(href),
    )?.[1]
    const ncxPath = Array.from(manifest.entries()).find(([, href]) => /\.ncx$/i.test(href))?.[1]
    const assetCache = new Map<string, string>()

    const sections = spine
      .map((itemId, index) => {
        const href = manifest.get(itemId)
        if (!href) return null
        const chapterPath = resolvePath(opfBase, href)
        const chapterHtml = readZipText(files, chapterPath)
        const chapterTitle = stripTags(
          chapterHtml.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] ?? `Section ${index + 1}`,
        )
        return {
          id: `epub-section-${index}`,
          title: chapterTitle || `Section ${index + 1}`,
          content: extractBodyText(chapterHtml),
          html: extractBodyHtml(chapterHtml, chapterPath, files, assetCache),
        }
      })
      .filter((section): section is EpubSection => Boolean(section))

    if (!sections.length) {
      throw new Error('No readable EPUB sections were found.')
    }

    logger.log('sections parsed', {
      sections: sections.length,
      assets: assetCache.size,
    })

    const navToc =
      (navPath && parseNav(readZipText(files, resolvePath(opfBase, navPath)))) ||
      (ncxPath && parseNcx(readZipText(files, resolvePath(opfBase, ncxPath)))) ||
      []

    const toc =
      navToc.length > 0
        ? navToc.map((item, index) => ({
            ...item,
            id: sections[Math.min(index, sections.length - 1)]?.id ?? item.id,
          }))
        : sections.map((section) => ({ id: section.id, level: 1, title: section.title }))

    return { title, sections, toc }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown EPUB parse error'
    logger.error('parse failed', message)
    throw new Error(`Failed to parse EPUB: ${message}`)
  }
}

export const toEpubExcerpt = (document: ParsedEpubDocument): EpubExcerpt => ({
  title: document.title,
  html: document.sections.map((section) => section.html).join('\n'),
  toc: document.toc,
})
