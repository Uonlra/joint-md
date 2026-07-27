import { describe, expect, it } from 'vitest'
import type { SourceFile } from '../types'
import { deriveEpubDocument, epubSectionAnchorId } from './deriveEpubDocument'

describe('EPUB document derivation', () => {
  it('builds chapter TOC and progress key from stored EPUB sections', () => {
    const files: SourceFile[] = [
      {
        id: 'book-1',
        name: 'Effective.epub',
        kind: 'epub',
        content: '',
        epubSections: [
          { id: epubSectionAnchorId('book-1', 0), title: 'Praise', html: '<h1>Praise</h1><p>One</p>' },
          { id: epubSectionAnchorId('book-1', 1), title: 'Intro', html: '<h1>Intro</h1><p>Two</p>' },
        ],
        epubToc: [
          { id: epubSectionAnchorId('book-1', 0), level: 1, title: 'Praise' },
          { id: epubSectionAnchorId('book-1', 1), level: 1, title: 'Intro' },
        ],
      },
    ]

    const derived = deriveEpubDocument(files)
    expect(derived.sections).toHaveLength(2)
    expect(derived.toc).toEqual([
      { id: epubSectionAnchorId('book-1', 0), level: 1, title: 'Praise' },
      { id: epubSectionAnchorId('book-1', 1), level: 1, title: 'Intro' },
    ])
    expect(derived.progressKey).toMatch(/^joint-md-epub-progress-/)
    expect(derived.html[0]).toContain('<h1>Praise</h1>')
  })

  it('does not mix markdown files into the EPUB document model', () => {
    const files: SourceFile[] = [
      { id: 'md', name: 'a.md', kind: 'markdown', content: '# Alpha' },
      {
        id: 'book',
        name: 'b.epub',
        kind: 'epub',
        content: '',
        epubSections: [{ id: 's1', title: 'Only', html: '<p>Epub</p>' }],
      },
    ]
    const derived = deriveEpubDocument(files)
    expect(derived.sections).toHaveLength(1)
    expect(derived.sections[0].title).toBe('Only')
  })
})
