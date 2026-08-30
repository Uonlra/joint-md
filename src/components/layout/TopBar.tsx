import { BookOpen, PanelLeftOpen, Wrench } from 'lucide-react'

type TopBarProps = {
  readerMode: boolean
  toolsOpen: boolean
  onToggleReaderMode: () => void
  onToggleTools: () => void
}

export function TopBar({ readerMode, toolsOpen, onToggleReaderMode, onToggleTools }: TopBarProps) {
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
        <button className="reader-toggle" type="button" onClick={onToggleTools}>
          <Wrench size={16} />
          {toolsOpen ? '返回工作台' : '工具集'}
        </button>
        <button className="reader-toggle" type="button" onClick={onToggleReaderMode}>
          {readerMode ? <PanelLeftOpen size={16} /> : <BookOpen size={16} />}
          {readerMode ? '返回工作台' : '阅读模式'}
        </button>
      </div>
    </header>
  )
}
