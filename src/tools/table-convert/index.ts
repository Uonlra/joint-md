import type { ToolDefinition } from '../types'
import { parseMarkdownTables } from '../shared/tables'
import { csvToMarkdownTable, markdownTablesToCsv } from './convert'

export const tableConvertTool: ToolDefinition = {
  id: 'table-convert',
  name: '表格转换',
  description: 'Markdown 表格 ↔ CSV 双向转换，自动识别输入方向',
  category: 'convert',
  run: (input) => {
    const isMarkdown = parseMarkdownTables(input).length > 0
    if (isMarkdown) {
      const csv = markdownTablesToCsv(input)
      return {
        title: 'Markdown 表格 → CSV',
        summary: `已转换 ${parseMarkdownTables(input).length} 个表格`,
        sections: [],
        data: { kind: 'code', language: 'csv', content: csv },
        downloads: [{ fileName: 'tables.csv', content: csv, mime: 'text/csv;charset=utf-8' }],
      }
    }

    const markdown = csvToMarkdownTable(input)
    return {
      title: 'CSV → Markdown 表格',
      summary: markdown ? '已生成 Markdown 表格' : '未识别到有效的 CSV 数据',
      sections: [],
      data: { kind: 'code', language: 'markdown', content: markdown },
      downloads: [
        { fileName: 'table.md', content: markdown, mime: 'text/markdown;charset=utf-8' },
      ],
    }
  },
}
