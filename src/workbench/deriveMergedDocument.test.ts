import { describe, expect, it } from 'vitest'
import type { SourceFile } from '../types'
import { deriveMergedDocument } from './deriveMergedDocument'

const source = (name: string, content: string, id = name): SourceFile => ({
  id,
  name,
  content,
})

describe('Workbench Merged Document derivation', () => {
  it('updates the Merged Document when File Queue or Join Mode changes', () => {
    const queue = [source('a.md', '# Alpha'), source('b.md', '## Beta')]

    const plain = deriveMergedDocument(queue, 'plain')
    expect(plain.markdown).toBe('# Alpha\n\n## Beta')
    expect(plain.toc).toEqual([
      { id: 'section-0', level: 1, title: 'Alpha' },
      { id: 'section-1', level: 2, title: 'Beta' },
    ])
    expect(plain.progressKey).toMatch(/^joint-md-progress-/)

    const ruled = deriveMergedDocument(queue, 'rule')
    expect(ruled.markdown).toBe('# Alpha\n\n---\n\n## Beta')
    expect(ruled.progressKey).not.toBe(plain.progressKey)

    const reordered = deriveMergedDocument([queue[1], queue[0]], 'plain')
    expect(reordered.markdown).toBe('## Beta\n\n# Alpha')
    expect(reordered.progressKey).not.toBe(plain.progressKey)
  })
})
