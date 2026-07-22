import { Settings2 } from 'lucide-react'
import type { JoinMode } from '../../types'

type JoinSettingsProps = {
  outputName: string
  joinMode: JoinMode
  onOutputNameChange: (value: string) => void
  onJoinModeChange: (mode: JoinMode) => void
}

export function JoinSettings({
  outputName,
  joinMode,
  onOutputNameChange,
  onJoinModeChange,
}: JoinSettingsProps) {
  return (
    <div className="settings">
      <div className="settings-title">
        <Settings2 size={17} />
        合并设置
      </div>
      <label htmlFor="name">导出文件名</label>
      <input id="name" value={outputName} onChange={(event) => onOutputNameChange(event.target.value)} />
      <fieldset>
        <legend>文件设置</legend>
        <label>
          <input
            type="radio"
            name="join"
            checked={joinMode === 'plain'}
            onChange={() => onJoinModeChange('plain')}
          />
          留出空行
        </label>
        <label>
          <input
            type="radio"
            name="join"
            checked={joinMode === 'line'}
            onChange={() => onJoinModeChange('line')}
          />
          插入分隔线
        </label>
        <label>
          <input
            type="radio"
            name="join"
            checked={joinMode === 'heading'}
            onChange={() => onJoinModeChange('heading')}
          />
          加上文件标题
        </label>
      </fieldset>
    </div>
  )
}
