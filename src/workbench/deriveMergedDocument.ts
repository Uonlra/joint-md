import type { JoinMode, SourceFile, TableOfContentsItem } from '../types'
import { buildToc, makeDocument, type DocumentSegment } from '../utils/document'
import { keyFromMergedDocument } from './readingProgress'

export type DerivedMergedDocument = {
  markdown: string
  segments: DocumentSegment[]
  toc: TableOfContentsItem[]
  progressKey: string
}

export const deriveMergedDocument = (
  files: SourceFile[],
  joinMode: JoinMode,
): DerivedMergedDocument => {
  const { markdown, segments } = makeDocument(files, joinMode)
  return {
    markdown,
    segments,
    toc: buildToc(markdown),
    progressKey: keyFromMergedDocument(markdown),
  }
}
