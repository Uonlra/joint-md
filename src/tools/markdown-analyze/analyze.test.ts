import { describe, expect, it } from 'vitest'
import { analyzeMarkdown } from './analyze'

const sample = [
  '# 第一章',
  '这是开头。',
  '## 第一节',
  '内容是 `code` 和 [链接](https://example.com) 以及 [锚点](#section)。',
  '## 第二节',
  '### 小节',
  '',
  '| 名称 | 数量 |',
  '| --- | --- |',
  '| 苹果 | 3 |',
  '| 香蕉 | 5 |',
  '',
  '```ts',
  'const a = 1',
  '```',
  '',
  '![图片](image.png)',
].join('\n')

describe('Markdown 结构化分析', () => {
  it('构建嵌套标题树', () => {
    const { headingTree } = analyzeMarkdown(sample)
    expect(headingTree).toEqual([
      {
        level: 1,
        title: '第一章',
        children: [
          { level: 2, title: '第一节', children: [] },
          { level: 2, title: '第二节', children: [{ level: 3, title: '小节', children: [] }] },
        ],
      },
    ])
  })

  it('统计字符、标题、表格、代码块与链接数量', () => {
    const { stats } = analyzeMarkdown(sample)
    expect(stats.headings).toBe(4)
    expect(stats.tables).toBe(1)
    expect(stats.codeBlocks).toBe(1)
    expect(stats.links).toBe(2)
    expect(stats.words).toBeGreaterThan(0)
    expect(stats.chars).toBeGreaterThan(stats.words)
  })

  it('解析表格结构与行数据', () => {
    const { tables } = analyzeMarkdown(sample)
    expect(tables[0].headers).toEqual(['名称', '数量'])
    expect(tables[0].rows).toEqual([
      ['苹果', '3'],
      ['香蕉', '5'],
    ])
  })

  it('解析代码块语言与行数', () => {
    const { codeBlocks } = analyzeMarkdown(sample)
    expect(codeBlocks[0]).toEqual({ language: 'ts', lines: 1, chars: 11 })
  })

  it('区分链接类型且排除图片', () => {
    const { links } = analyzeMarkdown(sample)
    expect(links).toEqual([
      { text: '链接', url: 'https://example.com', kind: 'http' },
      { text: '锚点', url: '#section', kind: 'anchor' },
    ])
  })

  it('处理空输入', () => {
    const { stats, headingTree, tables, links } = analyzeMarkdown('')
    expect(stats).toMatchObject({ headings: 0, tables: 0, codeBlocks: 0, links: 0 })
    expect(headingTree).toEqual([])
    expect(tables).toEqual([])
    expect(links).toEqual([])
  })
})
