import type { JoinMode, SourceFile, TableOfContentsItem } from '../types'
import { safeTitle } from './markdown'

export type DocumentSegment = {
  id: string
  body: string
}

export type BuiltDocument = {
  markdown: string
  segments: DocumentSegment[]
}

export const sourceAnchorId = (sourceFileId: string) => `source-${sourceFileId}`

const segmentBody = (file: SourceFile, mode: JoinMode) => {
  const content = file.content.trim()
  if (!content) return ''
  return mode === 'filename-heading'
    ? `# ${file.name.replace(/\.(md|markdown)$/i, '')}\n\n${content}`
    : content
}

export const makeDocument = (files: SourceFile[], mode: JoinMode): BuiltDocument => {
  const segments = files
    .map((file) => ({ id: file.id, body: segmentBody(file, mode) }))
    .filter((segment) => Boolean(segment.body))

  const markdown = segments
    .map((segment) => segment.body)
    .join(mode === 'rule' ? '\n\n---\n\n' : '\n\n')

  return { markdown, segments }
}

export const buildToc = (markdown: string): TableOfContentsItem[] =>
  Array.from(markdown.matchAll(/^(#{1,3})\s+(.+)$/gm)).map((match, index) => ({
    id: `section-${index}`,
    level: match[1].length,
    title: safeTitle(match[2]),
  }))
