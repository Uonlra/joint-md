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

const resolvePath = (basePath: string, relativePath: string) => {
  const baseParts = basePath.split('/').filter(Boolean)
  baseParts.pop()
  for (const part of relativePath.split('/')) {
    if (!part || part === '.') continue
    if (part === '..') {
      baseParts.pop()
      continue
    }
    baseParts.push(part)
  }
  return baseParts.join('/')
}

const readZipText = (files: Record<string, Uint8Array>, path: string) => {
  const content = decode(files[path])
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
  Array.from(opf.matchAll(/<itemref\b([^>]*?)\/?>(?:\s*<\/itemref>)?/gi)).map((match) => {
    const attributes = parseAttributes(match[1])
    return attributes.idref ?? ''
  }).filter(Boolean)

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

const extractBodyHtml = (html: string) => {
  const body = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1]
  return (body ?? html)
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .trim()
}

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
    const navPath = Array.from(manifest.entries()).find(([, href]) => /nav\.xhtml$/i.test(href) || /toc\.xhtml$/i.test(href))?.[1]
    const ncxPath = Array.from(manifest.entries()).find(([, href]) => /\.ncx$/i.test(href))?.[1]

    const sections = spine
      .map((itemId, index) => {
        const href = manifest.get(itemId)
        if (!href) return null
        const chapterPath = resolvePath(opfBase, href)
        const chapterHtml = readZipText(files, chapterPath)
        const chapterTitle = stripTags(chapterHtml.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] ?? `Section ${index + 1}`)
        return {
          id: `epub-section-${index}`,
          title: chapterTitle || `Section ${index + 1}`,
          content: extractBodyText(chapterHtml),
          html: extractBodyHtml(chapterHtml),
        }
      })
      .filter((section): section is EpubSection => Boolean(section))

    if (!sections.length) {
      throw new Error('No readable EPUB sections were found.')
    }

    logger.log('sections parsed', { sections: sections.length, toc: sections.length })

    const toc =
      (navPath && parseNav(readZipText(files, resolvePath(opfBase, navPath)))) ||
      (ncxPath && parseNcx(readZipText(files, resolvePath(opfBase, ncxPath)))) ||
      sections.map((section) => ({ id: section.id, level: 1, title: section.title }))

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
