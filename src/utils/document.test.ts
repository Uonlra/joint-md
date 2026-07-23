import { describe, expect, it } from 'vitest'
import type { SourceFile } from '../types'
import { buildToc, makeDocument, sourceAnchorId } from './document'

const source = (name: string, content: string, id = name): SourceFile => ({
  id,
  name,
  content,
})

describe('Merged Document join', () => {
  it('yields an empty Merged Document when the File Queue is empty', () => {
    expect(makeDocument([], 'plain')).toEqual({ markdown: '', segments: [] })
    expect(makeDocument([], 'rule')).toEqual({ markdown: '', segments: [] })
    expect(makeDocument([], 'filename-heading')).toEqual({ markdown: '', segments: [] })
  })

  it('joins Source Files with blank lines in Plain Join Mode', () => {
    const queue = [source('a.md', 'alpha', 'a'), source('b.md', 'beta', 'b')]
    expect(makeDocument(queue, 'plain')).toEqual({
      markdown: 'alpha\n\nbeta',
      segments: [
        { id: 'a', body: 'alpha' },
        { id: 'b', body: 'beta' },
      ],
    })
  })

  it('joins Source Files with a horizontal rule in Rule Join Mode', () => {
    const queue = [source('a.md', 'alpha', 'a'), source('b.md', 'beta', 'b')]
    expect(makeDocument(queue, 'rule')).toEqual({
      markdown: 'alpha\n\n---\n\nbeta',
      segments: [
        { id: 'a', body: 'alpha' },
        { id: 'b', body: 'beta' },
      ],
    })
  })

  it('prefixes each Source File with a Filename Heading H1', () => {
    const queue = [
      source('chapter-one.md', 'body one', '1'),
      source('two.markdown', 'body two', '2'),
    ]
    expect(makeDocument(queue, 'filename-heading')).toEqual({
      markdown: '# chapter-one\n\nbody one\n\n# two\n\nbody two',
      segments: [
        { id: '1', body: '# chapter-one\n\nbody one' },
        { id: '2', body: '# two\n\nbody two' },
      ],
    })
  })

  it('includes every duplicate File Queue entry in the Merged Document', () => {
    const queue = [source('same.md', 'body', '1'), source('same.md', 'body', '2')]
    expect(makeDocument(queue, 'plain')).toEqual({
      markdown: 'body\n\nbody',
      segments: [
        { id: '1', body: 'body' },
        { id: '2', body: 'body' },
      ],
    })
    expect(makeDocument(queue, 'rule').markdown).toBe('body\n\n---\n\nbody')
  })

  it('derives only from File Queue order and Join Mode (no merge job)', () => {
    const queue = [source('second.md', 'B', 's'), source('first.md', 'A', 'f')]
    expect(makeDocument(queue, 'plain').markdown).toBe('B\n\nA')
  })

  it('maps each segment to a stable source anchor id', () => {
    expect(sourceAnchorId('abc')).toBe('source-abc')
  })
})

describe('Table of Contents derivation', () => {
  it('yields no TOC entries for an empty Merged Document', () => {
    expect(buildToc('')).toEqual([])
  })

  it('extracts H1–H3 headings from the Merged Document with sequential jump ids', () => {
    const markdown = ['# One', '## Two', '### Three', '#### Four', 'body'].join('\n')
    expect(buildToc(markdown)).toEqual([
      { id: 'section-0', level: 1, title: 'One' },
      { id: 'section-1', level: 2, title: 'Two' },
      { id: 'section-2', level: 3, title: 'Three' },
    ])
  })

  it('includes Filename Heading titles from the joined Merged Document', () => {
    const merged = makeDocument(
      [source('intro.md', 'hello'), source('detail.md', '## Nested')],
      'filename-heading',
    ).markdown
    expect(buildToc(merged)).toEqual([
      { id: 'section-0', level: 1, title: 'intro' },
      { id: 'section-1', level: 1, title: 'detail' },
      { id: 'section-2', level: 2, title: 'Nested' },
    ])
  })

  it('strips markdown emphasis markers from TOC titles', () => {
    expect(buildToc('# **Bold** and *italic* and `code`')).toEqual([
      { id: 'section-0', level: 1, title: 'Bold and italic and code' },
    ])
  })
})
