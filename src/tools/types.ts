export type ToolId = 'markdown-analyze' | 'table-convert'

export type ToolCategory = 'analyze' | 'convert'

export type ReportRow = { label: string; value: string }

export type ReportSection = { title: string; rows: ReportRow[] }

export type DownloadOption = {
  fileName: string
  content: string
  mime: string
}

export type ToolResult = {
  title: string
  summary: string
  sections: ReportSection[]
  data: unknown
  downloads: DownloadOption[]
}

export type ToolDefinition = {
  id: ToolId
  name: string
  description: string
  category: ToolCategory
  run: (input: string) => ToolResult
}
