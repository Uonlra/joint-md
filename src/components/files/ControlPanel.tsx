import type { JoinMode, SourceFile } from '../../types'
import { DropZone } from './DropZone'
import { FileList } from './FileList'
import { JoinSettings } from './JoinSettings'

type ControlPanelProps = {
  files: SourceFile[]
  outputName: string
  joinMode: JoinMode
  onAddFiles: (files: FileList | File[]) => void | Promise<void>
  onDragStart: (id: string) => void
  onDragEnd: () => void
  onDropAt: (id: string) => void
  onMove: (from: number, to: number) => void
  onRemove: (id: string) => void
  onSelectFile: (id: string) => void
  onOutputNameChange: (value: string) => void
  onJoinModeChange: (mode: JoinMode) => void
}

export function ControlPanel({
  files,
  outputName,
  joinMode,
  onAddFiles,
  onDragStart,
  onDragEnd,
  onDropAt,
  onMove,
  onRemove,
  onSelectFile,
  onOutputNameChange,
  onJoinModeChange,
}: ControlPanelProps) {
  return (
    <aside className="control-panel">
      <div className="panel-heading">
        <div>
          <p>File Queue</p>
          <h1>源文件队列</h1>
        </div>
        {files.length > 0 && <span className="count">{files.length}</span>}
      </div>
      <DropZone onAddFiles={onAddFiles} />
      <div className="file-list">
        <FileList
          files={files}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          onDropAt={onDropAt}
          onMove={onMove}
          onRemove={onRemove}
          onSelect={onSelectFile}
        />
      </div>
      <JoinSettings
        outputName={outputName}
        joinMode={joinMode}
        onOutputNameChange={onOutputNameChange}
        onJoinModeChange={onJoinModeChange}
      />
    </aside>
  )
}
