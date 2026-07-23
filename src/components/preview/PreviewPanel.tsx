import type { RefObject } from 'react'
import type { TableOfContentsItem } from '../../types'
import type { DocumentSegment } from '../../utils/document'
import { ExportBar } from './ExportBar'
import { MarkdownPreview } from './MarkdownPreview'
import { PreviewHeader } from './PreviewHeader'
import { TocPanel } from './TocPanel'

type PreviewPanelProps = {
  readerMode: boolean
  outputName: string
  fileCount: number
  markdown: string
  segments: DocumentSegment[]
  joinModeRule: boolean
  toc: TableOfContentsItem[]
  tocOpen: boolean
  fontSize: number
  softPaper: boolean
  notice: string
  previewRef: RefObject<HTMLDivElement | null>
  onToggleToc: () => void
  onCloseToc: () => void
  onSelectSection: (id: string) => void
  onDecreaseFont: () => void
  onIncreaseFont: () => void
  onToggleSoftPaper: () => void
  onEnterReaderMode: () => void
  onExportMarkdown: () => void
  onPrintPdf: () => void
  onPersistProgress: (scrollTop: number) => void
}

export function PreviewPanel({
  readerMode,
  outputName,
  fileCount,
  markdown,
  segments,
  joinModeRule,
  toc,
  tocOpen,
  fontSize,
  softPaper,
  notice,
  previewRef,
  onToggleToc,
  onCloseToc,
  onSelectSection,
  onDecreaseFont,
  onIncreaseFont,
  onToggleSoftPaper,
  onEnterReaderMode,
  onExportMarkdown,
  onPrintPdf,
  onPersistProgress,
}: PreviewPanelProps) {
  return (
    <section className="preview-panel">
      <PreviewHeader
        readerMode={readerMode}
        outputName={outputName}
        fileCount={fileCount}
        markdownLength={markdown.length}
        tocCount={toc.length}
        fontSize={fontSize}
        softPaper={softPaper}
        onToggleToc={onToggleToc}
        onDecreaseFont={onDecreaseFont}
        onIncreaseFont={onIncreaseFont}
        onToggleSoftPaper={onToggleSoftPaper}
        onEnterReaderMode={onEnterReaderMode}
      />
      {tocOpen && <TocPanel toc={toc} onClose={onCloseToc} onSelect={onSelectSection} />}
      <MarkdownPreview
        markdown={markdown}
        segments={segments}
        joinModeRule={joinModeRule}
        toc={toc}
        fontSize={fontSize}
        previewRef={previewRef}
        onPersistProgress={onPersistProgress}
      />
      <ExportBar
        notice={notice}
        hasMarkdown={Boolean(markdown)}
        onExportMarkdown={onExportMarkdown}
        onPrintPdf={onPrintPdf}
      />
    </section>
  )
}
