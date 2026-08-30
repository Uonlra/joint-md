import type { ToolDefinition } from '../types'
import { analyzeMarkdown } from './analyze'

export const markdownAnalyzeTool: ToolDefinition = {
  id: 'markdown-analyze',
  name: 'Markdown 结构化分析',
  description: '提取标题树、表格、代码块、链接清单，并给出字数与结构统计',
  category: 'analyze',
  run: (input) => {
    const analysis = analyzeMarkdown(input)
    return {
      title: 'Markdown 分析报告',
      summary: `${analysis.stats.words.toLocaleString()} 词 · ${analysis.stats.headings} 个标题 · ${analysis.stats.tables} 个表格 · ${analysis.stats.codeBlocks} 个代码块`,
      sections: [
        { title: '统计', rows: [] },
        {
          title: '结构',
          rows: [
            { label: '字符数', value: analysis.stats.chars.toLocaleString() },
            { label: '词数', value: analysis.stats.words.toLocaleString() },
            { label: '行数', value: analysis.stats.lines.toLocaleString() },
            { label: '标题', value: String(analysis.stats.headings) },
            { label: '表格', value: String(analysis.stats.tables) },
            { label: '代码块', value: String(analysis.stats.codeBlocks) },
            { label: '链接', value: String(analysis.stats.links) },
          ],
        },
      ],
      data: analysis,
      downloads: [
        {
          fileName: 'markdown-analysis.json',
          content: JSON.stringify(analysis, null, 2),
          mime: 'application/json',
        },
      ],
    }
  },
}
