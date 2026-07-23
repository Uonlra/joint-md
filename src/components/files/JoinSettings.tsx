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
        导出与拼接
      </div>
      <label htmlFor="name">导出名</label>
      <input id="name" value={outputName} onChange={(event) => onOutputNameChange(event.target.value)} />
      <fieldset>
        <legend>Join Mode</legend>
        <label>
          <input
            type="radio"
            name="join"
            checked={joinMode === 'plain'}
            onChange={() => onJoinModeChange('plain')}
          />
          Plain（空行）
        </label>
        <label>
          <input
            type="radio"
            name="join"
            checked={joinMode === 'rule'}
            onChange={() => onJoinModeChange('rule')}
          />
          Rule（分隔线）
        </label>
        <label>
          <input
            type="radio"
            name="join"
            checked={joinMode === 'filename-heading'}
            onChange={() => onJoinModeChange('filename-heading')}
          />
          Filename Heading（文件名标题）
        </label>
      </fieldset>
    </div>
  )
}
