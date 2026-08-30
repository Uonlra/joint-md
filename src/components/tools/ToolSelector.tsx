import { toolRegistry } from '../../tools/registry'
import type { ToolId } from '../../tools/types'

type ToolSelectorProps = {
  selected: ToolId
  onSelect: (id: ToolId) => void
}

export function ToolSelector({ selected, onSelect }: ToolSelectorProps) {
  return (
    <div className="tool-selector" role="tablist" aria-label="工具选择">
      {toolRegistry.map((tool) => (
        <button
          key={tool.id}
          type="button"
          role="tab"
          aria-selected={selected === tool.id}
          className={`tool-card ${selected === tool.id ? 'selected' : ''}`}
          onClick={() => onSelect(tool.id)}
        >
          <strong>{tool.name}</strong>
          <span>{tool.description}</span>
        </button>
      ))}
    </div>
  )
}
