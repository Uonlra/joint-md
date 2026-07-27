import { ListTree, Minus, Plus, SunMedium } from 'lucide-react'
import type { WorkbenchMode } from '../../types'

type PreviewHeaderProps = {
  readerMode: boolean
  mode: WorkbenchMode
  outputName: string
  fileCount: number
  contentLength: number
  tocCount: number
  tocEnabled?: boolean
  fontSize: number
  softPaper: boolean
  onToggleToc: () => void
  onDecreaseFont: () => void
  onIncreaseFont: () => void
  onToggleSoftPaper: () => void
  onEnterReaderMode: () => void
}

export function PreviewHeader({
  readerMode,
  mode,
  outputName,
  fileCount,
  contentLength,
  tocCount,
  tocEnabled = true,
  fontSize,
  softPaper,
  onToggleToc,
  onDecreaseFont,
  onIncreaseFont,
  onToggleSoftPaper,
  onEnterReaderMode: _onEnterReaderMode,
}: PreviewHeaderProps) {
  const modeLabel =
    mode === 'epub' ? (readerMode ? 'EPUB Reader' : 'EPUB Document') : readerMode ? 'Reader Mode' : 'Merged Document'
  const titleSuffix = mode === 'epub' ? '.epub' : '.md'
  const tocAvailable = tocEnabled && tocCount > 0
  const tocTitle = tocEnabled ? '目录' : 'EPUB 目录暂未开放'

  return (
    <div className="preview-header">
      <div>
        <p>{modeLabel}</p>
        <h2>
          {outputName || (mode === 'epub' ? 'epub-document' : 'merged-document')}
          {titleSuffix}
        </h2>
      </div>
      <div className="preview-tools">
        <span>
          {fileCount
            ? `${fileCount} files · ${contentLength.toLocaleString()} chars${mode === 'epub' ? ' · EPUB' : ''}`
            : '等待源文件'}
        </span>
        <button
          className={`tool-button toc-button ${tocEnabled ? '' : 'toc-button-disabled'}`.trim()}
          type="button"
          title={tocTitle}
          aria-label={tocTitle}
          aria-disabled={!tocAvailable}
          disabled={!tocAvailable}
          onClick={() => {
            if (!tocAvailable) return
            onToggleToc()
          }}
        >
          <ListTree size={16} />
        </button>
        <button
          className="tool-button"
          type="button"
          title="减小字号"
          aria-label="减小字号"
          disabled={fontSize <= 14}
          onClick={onDecreaseFont}
        >
          <Minus size={16} />
        </button>
        <span className="font-size" aria-hidden="true">
          A
        </span>
        <button
          className="tool-button"
          type="button"
          title="增大字号"
          aria-label="增大字号"
          disabled={fontSize >= 20}
          onClick={onIncreaseFont}
        >
          <Plus size={16} />
        </button>
        <button
          className={`tool-button ${softPaper ? 'selected' : ''}`}
          type="button"
          title="护眼纸张色"
          aria-label="护眼纸张色"
          onClick={onToggleSoftPaper}
        >
          <SunMedium size={16} />
        </button>
      </div>
    </div>
  )
}
