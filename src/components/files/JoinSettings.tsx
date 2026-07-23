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
      <div className="settings-title">拼接与导出</div>
      <label htmlFor="name">Export Name</label>
      <input
        id="name"
        value={outputName}
        onChange={(event) => onOutputNameChange(event.target.value)}
        autoComplete="off"
        spellCheck={false}
      />
      <fieldset>
        <legend>Join Mode</legend>
        <label>
          <input
            type="radio"
            name="join"
            checked={joinMode === 'plain'}
            onChange={() => onJoinModeChange('plain')}
          />
          Plain — 空行分隔
        </label>
        <label>
          <input
            type="radio"
            name="join"
            checked={joinMode === 'rule'}
            onChange={() => onJoinModeChange('rule')}
          />
          Rule — 水平线分隔
        </label>
        <label>
          <input
            type="radio"
            name="join"
            checked={joinMode === 'filename-heading'}
            onChange={() => onJoinModeChange('filename-heading')}
          />
          Filename Heading — 文件名作标题
        </label>
      </fieldset>
    </div>
  )
}
