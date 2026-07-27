import type { JoinMode, SourceFile, WorkbenchMode } from '../../types'
import { DropZone } from './DropZone'
import { FileList } from './FileList'
import { JoinSettings } from './JoinSettings'

type ControlPanelProps = {
  files: SourceFile[]
  mode: WorkbenchMode
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
  mode,
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
          <p>{mode === 'epub' ? 'EPUB Queue' : 'File Queue'}</p>
          <h1>{mode === 'epub' ? 'EPUB 阅读队列' : '源文件队列'}</h1>
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
      {mode !== 'epub' ? (
        <JoinSettings
          outputName={outputName}
          joinMode={joinMode}
          onOutputNameChange={onOutputNameChange}
          onJoinModeChange={onJoinModeChange}
        />
      ) : (
        <div className="settings">
          <div className="settings-title">EPUB 阅读模式</div>
          <p className="empty-list">目录与阅读进度按 EPUB 章节独立管理，不参与 Markdown 合并规则。</p>
        </div>
      )}
    </aside>
  )
}
