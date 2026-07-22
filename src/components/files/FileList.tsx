import type { SourceFile } from '../../types'
import { FileRow } from './FileRow'

type FileListProps = {
  files: SourceFile[]
  onDragStart: (id: string) => void
  onDragEnd: () => void
  onDropAt: (id: string) => void
  onMove: (from: number, to: number) => void
  onRemove: (id: string) => void
}

export function FileList({ files, onDragStart, onDragEnd, onDropAt, onMove, onRemove }: FileListProps) {
  if (files.length === 0) {
    return <div className="empty-list">添加文件后，可通过拖动或箭头调整合并顺序。</div>
  }

  return (
    <>
      {files.map((file, index) => (
        <FileRow
          key={file.id}
          file={file}
          index={index}
          total={files.length}
          onDragStart={() => onDragStart(file.id)}
          onDragEnd={onDragEnd}
          onDrop={() => onDropAt(file.id)}
          onMoveUp={() => onMove(index, index - 1)}
          onMoveDown={() => onMove(index, index + 1)}
          onRemove={() => onRemove(file.id)}
        />
      ))}
    </>
  )
}
