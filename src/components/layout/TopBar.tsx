import { BookOpen, PanelLeftOpen } from 'lucide-react'

type TopBarProps = {
  readerMode: boolean
  onToggleReaderMode: () => void
}

export function TopBar({ readerMode, onToggleReaderMode }: TopBarProps) {
  return (
    <header className="topbar">
      <div className="brand">
        <span className="brand-mark" aria-hidden="true">
          md
        </span>
        <span>Joint MD</span>
      </div>
      <div className="top-actions">
        <span className="local-state">
          <i aria-hidden="true" />
          本地处理
        </span>
        <button className="reader-toggle" type="button" onClick={onToggleReaderMode}>
          {readerMode ? <PanelLeftOpen size={16} /> : <BookOpen size={16} />}
          {readerMode ? '返回工作台' : '阅读模式'}
        </button>
      </div>
    </header>
  )
}
