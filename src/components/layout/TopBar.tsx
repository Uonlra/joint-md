import { BookOpen, PanelLeftOpen } from 'lucide-react'

type TopBarProps = {
  readerMode: boolean
  onToggleReaderMode: () => void
}

export function TopBar({ readerMode, onToggleReaderMode }: TopBarProps) {
  return (
    <header className="topbar">
      <div className="brand">
        <span className="brand-mark">J</span>
        <span>Joint MD</span>
      </div>
      <div className="top-actions">
        <span className="local-state">
          <i />
          本地处理
        </span>
        <button className="reader-toggle" type="button" onClick={onToggleReaderMode}>
          {readerMode ? <PanelLeftOpen size={17} /> : <BookOpen size={17} />}
          {readerMode ? '返回合并' : '阅读模式'}
        </button>
      </div>
    </header>
  )
}
