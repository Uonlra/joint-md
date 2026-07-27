import { useRef, useState, type ChangeEvent, type DragEvent } from 'react'
import { FilePlus2 } from 'lucide-react'

type DropZoneProps = {
  onAddFiles: (files: FileList | File[]) => void | Promise<void>
}

export function DropZone({ onAddFiles }: DropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const inputId = 'joint-md-file-input'

  return (
    <div
      className={`drop-zone ${isDragging ? 'active' : ''}`}
      onDragEnter={(event) => {
        event.preventDefault()
        setIsDragging(true)
      }}
      onDragOver={(event) => event.preventDefault()}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(event: DragEvent<HTMLDivElement>) => {
        event.preventDefault()
        setIsDragging(false)
        void onAddFiles(event.dataTransfer.files)
      }}
    >
      <FilePlus2 size={24} />
      <span>拖入 .md 或 .epub 文件</span>
      <span>导入内容都只能是相同格式</span>
      <span>Markdown 5 MB / EPUB 50 MB</span>
      <label className="secondary-button" htmlFor={inputId} role="button" tabIndex={0}>
        选择文件
      </label>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept=".md,.markdown,.epub,text/markdown,text/plain,application/epub+zip"
        multiple
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          if (event.target.files) void onAddFiles(event.target.files)
          event.target.value = ''
        }}
      />
    </div>
  )
}
