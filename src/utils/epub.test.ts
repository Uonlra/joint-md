import { describe, expect, it } from 'vitest'
import {
  createEpubDebugLogger,
  isAcceptedEpubName,
  joinEpubSections,
  parseEpubDocument,
  splitEpubSections,
  toEpubExcerpt,
} from './epub'

describe('EPUB support', () => {
  it('accepts epub names', () => {
    expect(isAcceptedEpubName('book.epub')).toBe(true)
    expect(isAcceptedEpubName('book.txt')).toBe(false)
  })

  it('maps parsed EPUB data to a preview excerpt', () => {
    expect(
      toEpubExcerpt({
        title: 'Book',
        sections: [{ id: 's1', title: 'Intro', content: 'Body', html: '<p>Body</p>' }],
        toc: [{ id: 'x', level: 1, title: 'Intro' }],
      }),
    ).toEqual({
      title: 'Book',
      html: '<p>Body</p>',
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

  it('joins and splits EPUB chapter HTML without collapsing tags', () => {
    const joined = joinEpubSections([
      { id: '1', title: 'A', content: 'A', html: '<h1>Praise</h1><p><em>Effective</em></p>' },
      { id: '2', title: 'B', content: 'B', html: '<p>Second</p>' },
    ])
    expect(joined).toContain('<em>Effective</em>')
    expect(splitEpubSections(joined)).toEqual([
      '<h1>Praise</h1><p><em>Effective</em></p>',
      '<p>Second</p>',
    ])
  })

  it('keeps real EPUB chapter HTML tags for preview rendering', async () => {
    const { zipSync, strToU8 } = await import('fflate')
    const bytes = zipSync({
      mimetype: strToU8('application/epub+zip'),
      'META-INF/container.xml': strToU8(
        `<?xml version="1.0"?><container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>`,
      ),
      'OEBPS/content.opf': strToU8(
        `<?xml version="1.0"?><package><metadata><dc:title xmlns:dc="http://purl.org/dc/elements/1.1/">Sample Book</dc:title></metadata><manifest><item id="c1" href="chapter1.xhtml" media-type="application/xhtml+xml"/></manifest><spine><itemref idref="c1"/></spine></package>`,
      ),
      'OEBPS/chapter1.xhtml': strToU8(
        `<html xmlns="http://www.w3.org/1999/xhtml"><body><h1>Praise</h1><blockquote><p><em>Effective TypeScript</em> explores TypeScript.</p></blockquote><figure data-type="cover"><img src="assets/cover.png"/></figure></body></html>`,
      ),
    })
    const file = new File([bytes], 'sample.epub', { type: 'application/epub+zip' })
    const parsed = await parseEpubDocument(file)
    expect(parsed.sections[0].html).toContain('<em>Effective TypeScript</em>')
    expect(parsed.sections[0].html).toContain('<figure data-type="cover">')
    expect(parsed.sections[0].html).not.toMatch(/^&lt;/)
  })
})
