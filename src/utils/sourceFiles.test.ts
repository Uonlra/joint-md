import { describe, expect, it } from 'vitest'
import { acceptSourceFiles, isAcceptedSourceFileName } from './sourceFiles'

describe('Source File acceptance', () => {
  it('accepts .md and .markdown names into the File Queue whitelist', () => {
    expect(isAcceptedSourceFileName('notes.md')).toBe(true)
    expect(isAcceptedSourceFileName('chapter.MARKDOWN')).toBe(true)
  })

  it('rejects non-whitelist extensions', () => {
    expect(isAcceptedSourceFileName('notes.txt')).toBe(false)
    expect(isAcceptedSourceFileName('notes.mdx')).toBe(false)
    expect(isAcceptedSourceFileName('readme')).toBe(false)
  })

  it('returns only accepted Source Files and a success notice', () => {
    const result = acceptSourceFiles(
      [
        { name: 'a.md', content: 'alpha' },
        { name: 'b.txt', content: 'ignored' },
        { name: 'c.markdown', content: 'gamma' },
      ],
      () => 'id-fixed',
    )

    expect(result.files).toEqual([
      { id: 'id-fixed', name: 'a.md', content: 'alpha' },
      { id: 'id-fixed', name: 'c.markdown', content: 'gamma' },
    ])
    expect(result.notice).toBe('已添加 2 个文件。')
  })

  it('rejects a batch with no accepted Source Files and sets a notice', () => {
    const result = acceptSourceFiles([{ name: 'a.txt', content: 'nope' }], () => 'x')

    expect(result.files).toEqual([])
    expect(result.notice).toBe('请选择 .md 或 .markdown 文件。')
  })

  it('allows duplicate names and contents as separate File Queue entries', () => {
    const ids = ['1', '2']
    const result = acceptSourceFiles(
      [
        { name: 'same.md', content: 'body' },
        { name: 'same.md', content: 'body' },
      ],
      () => ids.shift()!,
    )

    expect(result.files).toHaveLength(2)
    expect(result.files[0]).toEqual({ id: '1', name: 'same.md', content: 'body' })
    expect(result.files[1]).toEqual({ id: '2', name: 'same.md', content: 'body' })
    expect(result.notice).toBe('已添加 2 个文件。')
  })
})
