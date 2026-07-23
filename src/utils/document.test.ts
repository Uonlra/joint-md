import { describe, expect, it } from 'vitest'
import type { SourceFile } from '../types'
import { makeDocument } from './document'

const source = (name: string, content: string, id = name): SourceFile => ({
  id,
  name,
  content,
})

describe('Merged Document join', () => {
  it('yields an empty Merged Document when the File Queue is empty', () => {
    expect(makeDocument([], 'plain')).toBe('')
    expect(makeDocument([], 'rule')).toBe('')
    expect(makeDocument([], 'filename-heading')).toBe('')
  })

  it('joins Source Files with blank lines in Plain Join Mode', () => {
    const queue = [source('a.md', 'alpha'), source('b.md', 'beta')]
    expect(makeDocument(queue, 'plain')).toBe('alpha\n\nbeta')
  })

  it('joins Source Files with a horizontal rule in Rule Join Mode', () => {
    const queue = [source('a.md', 'alpha'), source('b.md', 'beta')]
    expect(makeDocument(queue, 'rule')).toBe('alpha\n\n---\n\nbeta')
  })

  it('prefixes each Source File with a Filename Heading H1', () => {
    const queue = [source('chapter-one.md', 'body one'), source('two.markdown', 'body two')]
    expect(makeDocument(queue, 'filename-heading')).toBe(
      '# chapter-one\n\nbody one\n\n# two\n\nbody two',
    )
  })

  it('includes every duplicate File Queue entry in the Merged Document', () => {
    const queue = [
      source('same.md', 'body', '1'),
      source('same.md', 'body', '2'),
    ]
    expect(makeDocument(queue, 'plain')).toBe('body\n\nbody')
    expect(makeDocument(queue, 'rule')).toBe('body\n\n---\n\nbody')
  })

  it('derives only from File Queue order and Join Mode (no merge job)', () => {
    const queue = [source('second.md', 'B'), source('first.md', 'A')]
    expect(makeDocument(queue, 'plain')).toBe('B\n\nA')
  })
})
