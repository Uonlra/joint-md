import type { JoinMode, SourceFile, TableOfContentsItem } from '../types'
import { safeTitle } from './markdown'

export const makeDocument = (files: SourceFile[], mode: JoinMode) =>
  files
    .map((file) => {
      const content = file.content.trim()
      return mode === 'filename-heading'
        ? `# ${file.name.replace(/\.(md|markdown)$/i, '')}\n\n${content}`
        : content
    })
    .filter(Boolean)
    .join(mode === 'rule' ? '\n\n---\n\n' : '\n\n')

export const documentHash = (value: string) => {
  let hash = 0
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) | 0
  }
  return `joint-md-progress-${hash}`
}

export const buildToc = (markdown: string): TableOfContentsItem[] =>
  Array.from(markdown.matchAll(/^(#{1,3})\s+(.+)$/gm)).map((match, index) => ({
    id: `section-${index}`,
    level: match[1].length,
    title: safeTitle(match[2]),
  }))
