import type { JoinMode, SourceFile, TableOfContentsItem } from '../types'
import { buildToc, makeDocument } from '../utils/document'
import { keyFromMergedDocument } from './readingProgress'

export type DerivedMergedDocument = {
  markdown: string
  toc: TableOfContentsItem[]
  progressKey: string
}

export const deriveMergedDocument = (
  files: SourceFile[],
  joinMode: JoinMode,
): DerivedMergedDocument => {
  const markdown = makeDocument(files, joinMode)
  return {
    markdown,
    toc: buildToc(markdown),
    progressKey: keyFromMergedDocument(markdown),
  }
}
