import { ArrowDown, ArrowUp, GripVertical, Trash2 } from 'lucide-react'
import type { SourceFile } from '../../types'

type FileRowProps = {
  file: SourceFile
  index: number
  total: number
  onDragStart: () => void
  onDragEnd: () => void
  onDrop: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  onRemove: () => void
  onSelect: () => void
}

export function FileRow({
  file,
  index,
  total,
  onDragStart,
  onDragEnd,
  onDrop,
  onMoveUp,
  onMoveDown,
  onRemove,
  onSelect,
}: FileRowProps) {
  return (
    <article
      className="file-row"
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={(event) => event.preventDefault()}
      onDrop={onDrop}
    >
      <GripVertical className="drag-handle" size={17} />
      <span className="file-index">{String(index + 1).padStart(2, '0')}</span>
      <button
        type="button"
        className="file-name"
        title={`定位到 ${file.name}`}
        onClick={onSelect}
      >
        {file.name}
      </button>
      <div className="row-actions">
        <button
          className="icon-button"
          type="button"
          title="上移"
          aria-label={`上移 ${file.name}`}
          disabled={index === 0}
          onClick={onMoveUp}
        >
          <ArrowUp size={15} />
        </button>
        <button
          className="icon-button"
          type="button"
          title="下移"
          aria-label={`下移 ${file.name}`}
          disabled={index === total - 1}
          onClick={onMoveDown}
        >
          <ArrowDown size={15} />
        </button>
        <button
          className="icon-button danger"
          type="button"
          title="移除"
          aria-label={`移除 ${file.name}`}
          onClick={onRemove}
        >
          <Trash2 size={15} />
        </button>
      </div>
    </article>
  )
}
