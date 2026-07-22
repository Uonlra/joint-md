import type { RefObject } from 'react'
import type { TableOfContentsItem } from '../../types'
import { ExportBar } from './ExportBar'
import { MarkdownPreview } from './MarkdownPreview'
import { PreviewHeader } from './PreviewHeader'
import { TocPanel } from './TocPanel'

type PreviewPanelProps = {
  readerMode: boolean
  outputName: string
  fileCount: number
  markdown: string
  toc: TableOfContentsItem[]
  tocOpen: boolean
  fontSize: number
  softPaper: boolean
  notice: string
  progressKey: string
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
}

export function PreviewPanel({
  readerMode,
  outputName,
  fileCount,
  markdown,
  toc,
  tocOpen,
  fontSize,
  softPaper,
  notice,
  progressKey,
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
        toc={toc}
        fontSize={fontSize}
        progressKey={progressKey}
        previewRef={previewRef}
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
