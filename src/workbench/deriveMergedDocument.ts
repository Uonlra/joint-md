import type { JoinMode, SourceFile, TableOfContentsItem } from '../types'
import { buildToc, documentHash, makeDocument } from '../utils/document'

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
    progressKey: documentHash(markdown),
  }
}
