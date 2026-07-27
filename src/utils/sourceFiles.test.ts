import { describe, expect, it } from 'vitest'
import {
  acceptSourceFiles,
  isAcceptedDocumentName,
  isAcceptedSourceFileName,
  kindFromFileName,
  kindFromQueue,
  NOTICE_MIXED_IMPORT,
  NOTICE_QUEUE_KIND_MISMATCH,
  NOTICE_UNSUPPORTED,
} from './sourceFiles'

describe('Source File acceptance', () => {
  it('accepts .md and .markdown names into the File Queue whitelist', () => {
    expect(isAcceptedSourceFileName('notes.md')).toBe(true)
    expect(isAcceptedSourceFileName('chapter.MARKDOWN')).toBe(true)
  })

  it('accepts EPUB names into the document whitelist', () => {
    expect(isAcceptedDocumentName('book.epub')).toBe(true)
    expect(isAcceptedDocumentName('book.EPUB')).toBe(true)
  })

  it('rejects non-whitelist extensions', () => {
    expect(isAcceptedSourceFileName('notes.txt')).toBe(false)
    expect(isAcceptedSourceFileName('notes.mdx')).toBe(false)
    expect(isAcceptedSourceFileName('readme')).toBe(false)
  })

  it('returns a notice that mentions epub support', () => {
    const result = acceptSourceFiles([{ name: 'a.txt', content: 'nope', kind: 'markdown' }], () => 'x')

    expect(result.files).toEqual([])
    expect(result.notice).toBe(NOTICE_UNSUPPORTED)
  })

  it('rejects mixed markdown and epub imports in one batch', () => {
    const result = acceptSourceFiles(
      [
        { name: 'a.md', content: 'alpha', kind: 'markdown' },
        { name: 'b.epub', content: 'beta', kind: 'epub' },
      ],
      () => 'x',
    )

    expect(result.files).toEqual([])
    expect(result.notice).toBe(NOTICE_MIXED_IMPORT)
  })

  it('detects document kinds from file names and queue state', () => {
    expect(kindFromFileName('a.md')).toBe('markdown')
    expect(kindFromFileName('b.epub')).toBe('epub')
    expect(kindFromFileName('c.txt')).toBeNull()
    expect(kindFromQueue([{ name: 'a.md' }, { name: 'b.markdown' }])).toBe('markdown')
    expect(kindFromQueue([{ name: 'a.epub' }])).toBe('epub')
    expect(kindFromQueue([])).toBeNull()
    expect(NOTICE_QUEUE_KIND_MISMATCH).toContain('工作队列')
  })

  it('rejects oversized markdown imports', () => {
    const result = acceptSourceFiles(
      [{ name: 'big.md', content: 'x'.repeat(5 * 1024 * 1024 + 1), kind: 'markdown' }],
      () => 'x',
    )

    expect(result.files).toEqual([])
    expect(result.notice).toBe('单个 Markdown 文件最大支持 5 MB。')
  })

  it('returns only accepted Source Files and a success notice', () => {
    const result = acceptSourceFiles(
        [
        { name: 'a.md', content: 'alpha', kind: 'markdown' },
        { name: 'b.txt', content: 'ignored', kind: 'markdown' },
        { name: 'c.markdown', content: 'gamma', kind: 'markdown' },
        ],
      () => 'id-fixed',
    )

    expect(result.files).toEqual([
      { id: 'id-fixed', name: 'a.md', content: 'alpha' },
      { id: 'id-fixed', name: 'c.markdown', content: 'gamma' },
    ])
    expect(result.notice).toBe('已添加 2 个文件。')
  })

  it('allows duplicate names and contents as separate File Queue entries', () => {
    const ids = ['1', '2']
    const result = acceptSourceFiles(
      [
        { name: 'same.md', content: 'body', kind: 'markdown' },
        { name: 'same.md', content: 'body', kind: 'markdown' },
      ],
      () => ids.shift()!,
    )

    expect(result.files).toHaveLength(2)
    expect(result.files[0]).toEqual({ id: '1', name: 'same.md', content: 'body' })
    expect(result.files[1]).toEqual({ id: '2', name: 'same.md', content: 'body' })
    expect(result.notice).toBe('已添加 2 个文件。')
  })
})
