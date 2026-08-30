import type { ToolDefinition } from './types'
import { markdownAnalyzeTool } from './markdown-analyze'
import { tableConvertTool } from './table-convert'

export const toolRegistry: ToolDefinition[] = [markdownAnalyzeTool, tableConvertTool]

export const getTool = (id: string) => toolRegistry.find((tool) => tool.id === id)

export type { ToolDefinition, ToolId, ToolResult } from './types'
