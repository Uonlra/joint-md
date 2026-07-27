import type { SourceFile, TableOfContentsItem } from '../types'
import { sourceAnchorId } from '../utils/document'
import { splitEpubSections } from '../utils/epub'
import { keyFromEpubDocument } from './readingProgress'

export type EpubPreviewSection = {
  id: string
  title: string
  html: string
  sourceFileId: string
}

export type DerivedEpubDocument = {
  title: string
  sections: EpubPreviewSection[]
  html: string[]
  toc: TableOfContentsItem[]
  progressKey: string
}

const titleFromSectionHtml = (html: string, fallback: string) => {
  const heading = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1]
  if (!heading) return fallback
  return heading.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() || fallback
}

export const epubSectionAnchorId = (sourceFileId: string, sectionIndex: number) =>
  sourceAnchorId(`epub-${sourceFileId}-${sectionIndex}`)

export const deriveEpubDocument = (files: SourceFile[]): DerivedEpubDocument => {
  const epubFiles = files.filter((file) => file.kind === 'epub' || /\.epub$/i.test(file.name))
  const sections: EpubPreviewSection[] = []

  for (const file of epubFiles) {
    const stored = file.epubSections
    if (stored?.length) {
      stored.forEach((section, index) => {
        sections.push({
          id: section.id || epubSectionAnchorId(file.id, index),
          title: section.title || `Section ${index + 1}`,
          html: section.html,
          sourceFileId: file.id,
        })
      })
      continue
    }

    splitEpubSections(file.content).forEach((html, index) => {
      sections.push({
        id: epubSectionAnchorId(file.id, index),
        title: titleFromSectionHtml(html, `Section ${index + 1}`),
        html,
        sourceFileId: file.id,
      })
    })
  }

  const tocFromFiles = epubFiles.flatMap((file) => file.epubToc ?? [])
  const toc =
    tocFromFiles.length > 0
      ? tocFromFiles
      : sections.map((section) => ({
          id: section.id,
          level: 1,
          title: section.title,
        }))

  const fingerprint = sections.map((section) => `${section.id}:${section.html.length}:${section.title}`).join('|')
  const title = epubFiles[0]?.name.replace(/\.epub$/i, '') || 'epub-document'

  return {
    title,
    sections,
    html: sections.map((section) => section.html),
    toc,
    progressKey: keyFromEpubDocument(fingerprint),
  }
}
