import type { RefObject } from 'react'
import type { TableOfContentsItem, WorkbenchMode } from '../../types'
import type { DocumentSegment } from '../../utils/document'
import type { EpubPreviewSection } from '../../workbench/deriveEpubDocument'
import { ExportBar } from './ExportBar'
import { MarkdownPreview } from './MarkdownPreview'
import { PreviewHeader } from './PreviewHeader'
import { TocPanel } from './TocPanel'

type PreviewPanelProps = {
  readerMode: boolean
  mode: WorkbenchMode
  outputName: string
  fileCount: number
  contentLength: number
  markdown: string
  segments: DocumentSegment[]
  epubSections?: EpubPreviewSection[]
  joinModeRule: boolean
  toc: TableOfContentsItem[]
  tocOpen: boolean
  fontSize: number
  softPaper: boolean
  notice: string
  importStatus?: 'idle' | 'loading' | 'error' | 'success'
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
  mode,
  outputName,
  fileCount,
  contentLength,
  markdown,
  segments,
  epubSections,
  joinModeRule,
  toc,
  tocOpen,
  fontSize,
  softPaper,
  notice,
  importStatus,
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
        mode={mode}
        outputName={outputName}
        fileCount={fileCount}
        contentLength={contentLength}
        tocCount={toc.length}
        fontSize={fontSize}
        softPaper={softPaper}
        onToggleToc={onToggleToc}
        onDecreaseFont={onDecreaseFont}
        onIncreaseFont={onIncreaseFont}
        onToggleSoftPaper={onToggleSoftPaper}
        onEnterReaderMode={onEnterReaderMode}
      />
      {tocOpen && (
        <TocPanel
          toc={toc}
          label={mode === 'epub' ? 'EPUB 目录' : '文章目录'}
          onClose={onCloseToc}
          onSelect={onSelectSection}
        />
      )}
      <MarkdownPreview
        markdown={markdown}
        segments={segments}
        epubSections={epubSections}
        joinModeRule={joinModeRule}
        toc={toc}
        fontSize={fontSize}
        previewRef={previewRef}
        onPersistProgress={onPersistProgress}
      />
      <ExportBar
        notice={notice}
        importStatus={importStatus}
        hasMarkdown={mode === 'markdown' && Boolean(markdown)}
        canPrint={mode === 'markdown' ? Boolean(markdown) : Boolean(epubSections?.length)}
        exportDisabledReason={mode === 'epub' ? 'EPUB 模式不支持导出 Markdown' : undefined}
        onExportMarkdown={onExportMarkdown}
        onPrintPdf={onPrintPdf}
      />
    </section>
  )
}
