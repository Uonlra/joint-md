import { X } from 'lucide-react'
import type { TableOfContentsItem } from '../../types'

type TocPanelProps = {
  toc: TableOfContentsItem[]
  onClose: () => void
  onSelect: (id: string) => void
}

export function TocPanel({ toc, onClose, onSelect }: TocPanelProps) {
  return (
    <nav className="toc-panel" aria-label="文章目录">
      <div>
        <strong>目录</strong>
        <button className="tool-button" type="button" title="关闭目录" aria-label="关闭目录" onClick={onClose}>
          <X size={16} />
        </button>
      </div>
      {toc.map((item) => (
        <button
          type="button"
          key={item.id}
          className={`toc-item level-${item.level}`}
          onClick={() => onSelect(item.id)}
        >
          {item.title}
        </button>
      ))}
    </nav>
  )
}
