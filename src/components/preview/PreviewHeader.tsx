import { ListTree, Minus, PanelLeftClose, Plus, SunMedium } from 'lucide-react'

type PreviewHeaderProps = {
  readerMode: boolean
  outputName: string
  fileCount: number
  markdownLength: number
  tocCount: number
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
  outputName,
  fileCount,
  markdownLength,
  tocCount,
  fontSize,
  softPaper,
  onToggleToc,
  onDecreaseFont,
  onIncreaseFont,
  onToggleSoftPaper,
  onEnterReaderMode,
}: PreviewHeaderProps) {
  return (
    <div className="preview-header">
      <div>
        <p>{readerMode ? '阅读模式' : '实时预览'}</p>
        <h2>{outputName || 'merged-document'}.md</h2>
      </div>
      <div className="preview-tools">
        <span>
          {fileCount ? `${fileCount} 个文件 · ${markdownLength.toLocaleString()} 个字符` : '等待文件'}
        </span>
        <button
          className="tool-button"
          type="button"
          title="目录"
          aria-label="目录"
          disabled={!tocCount}
          onClick={onToggleToc}
        >
          <ListTree size={17} />
        </button>
        <button
          className="tool-button"
          type="button"
          title="减小字号"
          aria-label="减小字号"
          disabled={fontSize <= 14}
          onClick={onDecreaseFont}
        >
          <Minus size={17} />
        </button>
        <span className="font-size">A</span>
        <button
          className="tool-button"
          type="button"
          title="增大字号"
          aria-label="增大字号"
          disabled={fontSize >= 20}
          onClick={onIncreaseFont}
        >
          <Plus size={17} />
        </button>
        <button
          className={`tool-button ${softPaper ? 'selected' : ''}`}
          type="button"
          title="护眼纸张色"
          aria-label="护眼纸张色"
          onClick={onToggleSoftPaper}
        >
          <SunMedium size={17} />
        </button>
        {!readerMode && (
          <button
            className="tool-button reader-icon"
            type="button"
            title="进入阅读模式"
            aria-label="进入阅读模式"
            onClick={onEnterReaderMode}
          >
            <PanelLeftClose size={17} />
          </button>
        )}
      </div>
    </div>
  )
}
