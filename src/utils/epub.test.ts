import { describe, expect, it } from 'vitest'
import { createEpubDebugLogger, isAcceptedEpubName, parseEpubDocument, toEpubExcerpt } from './epub'

describe('EPUB support', () => {
  it('accepts epub names', () => {
    expect(isAcceptedEpubName('book.epub')).toBe(true)
    expect(isAcceptedEpubName('book.txt')).toBe(false)
  })

  it('maps parsed EPUB data to a preview excerpt', () => {
    expect(
      toEpubExcerpt({
        title: 'Book',
        markdown: '# Intro\n\nBody',
        sections: [],
        toc: [{ id: 'x', level: 1, title: 'Intro' }],
      }),
    ).toEqual({
      title: 'Book',
      markdown: '# Intro\n\nBody',
      toc: [{ id: 'x', level: 1, title: 'Intro' }],
    })
  })

  it('throws an explicit parse error for unreadable EPUB input', async () => {
    await expect(parseEpubDocument(new File(['not-epub'], 'broken.epub'))).rejects.toThrow(
      /Failed to parse EPUB/,
    )
  })

  it('creates a no-op logger when debug logging is disabled', () => {
    expect(createEpubDebugLogger(false)).toEqual({
      log: expect.any(Function),
      warn: expect.any(Function),
      error: expect.any(Function),
    })
  })
})
