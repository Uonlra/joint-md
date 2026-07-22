import { useRef, useState, type ChangeEvent, type DragEvent } from 'react'
import { FilePlus2 } from 'lucide-react'

type DropZoneProps = {
  onAddFiles: (files: FileList | File[]) => void | Promise<void>
}

export function DropZone({ onAddFiles }: DropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

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
      <FilePlus2 size={26} />
      <strong>拖入 Markdown 文件</strong>
      <span>支持一次性导入多个 .md / .markdown 文件</span>
      <button className="secondary-button" type="button" onClick={() => inputRef.current?.click()}>
        选择文件
      </button>
      <input
        ref={inputRef}
        type="file"
        accept=".md,.markdown,text/markdown,text/plain"
        multiple
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          if (event.target.files) void onAddFiles(event.target.files)
          event.target.value = ''
        }}
      />
    </div>
  )
}
