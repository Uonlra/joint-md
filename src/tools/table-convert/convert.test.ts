import { describe, expect, it } from 'vitest'
import { csvToMarkdownTable, markdownTablesToCsv } from './convert'

describe('表格转换', () => {
  it('Markdown 表格转 CSV', () => {
    const markdown = [
      '| 名称 | 数量 |',
      '| --- | --- |',
      '| 苹果 | 3 |',
      '| 香蕉 | 5 |',
    ].join('\n')
    expect(markdownTablesToCsv(markdown)).toBe('名称,数量\n苹果,3\n香蕉,5')
  })

  it('多表格转 CSV 用空行分隔', () => {
    const markdown = ['| a |', '| - |', '| 1 |', '', '| b |', '| - |', '| 2 |'].join('\n')
    expect(markdownTablesToCsv(markdown)).toBe('a\n1\n\nb\n2')
  })

  it('CSV 转 Markdown 表格', () => {
    expect(csvToMarkdownTable('a,b\n1,2')).toBe('| a | b |\n| --- | --- |\n| 1 | 2 |')
  })

  it('处理带逗号和引号的 CSV 单元格', () => {
    const csv = 'a,b\n"hello, world","say ""hi"""'
    expect(csvToMarkdownTable(csv)).toBe(
      '| a | b |\n| --- | --- |\n| hello, world | say "hi" |',
    )
  })

  it('Markdown 表格转 CSV 时正确转义特殊字符', () => {
    const markdown = ['| 文本 |', '| - |', '| 带,逗号 |'].join('\n')
    expect(markdownTablesToCsv(markdown)).toBe('文本\n"带,逗号"')
  })

  it('空 CSV 返回空字符串', () => {
    expect(csvToMarkdownTable('')).toBe('')
    expect(csvToMarkdownTable('\n\n')).toBe('')
  })
})
