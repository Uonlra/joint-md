import type { TableOfContentsItem } from '../types'

export type EpubSection = {
  id: string
  title: string
  content: string
}

export type ParsedEpubDocument = {
  title: string
  sections: EpubSection[]
  toc: TableOfContentsItem[]
  markdown: string
}

const textFromXml = (xml: string) => xml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()

export const isAcceptedEpubName = (name: string) => /\.epub$/i.test(name)

export const parseEpubDocument = async (file: File): Promise<ParsedEpubDocument> => {
  const buffer = await file.arrayBuffer()
  const view = new Uint8Array(buffer)
  const text = new TextDecoder().decode(view)

  const navMatches = Array.from(text.matchAll(/<nav[^>]*epub:type=["']toc["'][^>]*>([\s\S]*?)<\/nav>/gi))
  const toc = navMatches.flatMap((match, navIndex) =>
    Array.from(match[1].matchAll(/<a[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)).map(
      (itemMatch, itemIndex) => ({
        id: `epub-toc-${navIndex}-${itemIndex}`,
        level: 1,
        title: textFromXml(itemMatch[2]),
      }),
    ),
  )

  const sectionMatches = Array.from(text.matchAll(/<h([1-3])[^>]*>([\s\S]*?)<\/h\1>/gi))
  const sections = sectionMatches.map((match, index) => ({
    id: `epub-section-${index}`,
    title: textFromXml(match[2]) || `Section ${index + 1}`,
    content: textFromXml(match[0]),
  }))

  const markdown = sections
    .map((section) => `# ${section.title}\n\n${section.content}`)
    .join('\n\n')

  return {
    title: file.name.replace(/\.epub$/i, ''),
    sections,
    toc: toc.length ? toc : sections.map((section) => ({ id: section.id, level: 1, title: section.title })),
    markdown,
  }
}
