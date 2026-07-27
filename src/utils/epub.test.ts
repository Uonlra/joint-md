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
        sections: [{ id: 's1', title: 'Intro', content: 'Body', html: '<p>Body</p>', path: 'OEBPS/a.xhtml' }],
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
      { id: '1', title: 'A', content: 'A', html: '<h1>Praise</h1><p><em>Effective</em></p>', path: 'a.xhtml' },
      { id: '2', title: 'B', content: 'B', html: '<p>Second</p>', path: 'b.xhtml' },
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

  it('maps nav hrefs to the matching spine chapter instead of TOC index order', async () => {
    const { zipSync, strToU8 } = await import('fflate')
    const bytes = zipSync({
      mimetype: strToU8('application/epub+zip'),
      'META-INF/container.xml': strToU8(
        `<?xml version="1.0"?><container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>`,
      ),
      'OEBPS/content.opf': strToU8(
        `<?xml version="1.0"?><package><metadata><dc:title xmlns:dc="http://purl.org/dc/elements/1.1/">Nav Book</dc:title></metadata><manifest><item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/><item id="c1" href="ch1.xhtml" media-type="application/xhtml+xml"/><item id="c2" href="ch2.xhtml" media-type="application/xhtml+xml"/><item id="c3" href="ch3.xhtml" media-type="application/xhtml+xml"/></manifest><spine><itemref idref="c1"/><itemref idref="c2"/><itemref idref="c3"/></spine></package>`,
      ),
      'OEBPS/nav.xhtml': strToU8(
        `<html xmlns="http://www.w3.org/1999/xhtml"><body><nav epub:type="toc"><ol><li><a href="ch3.xhtml#part-b">Jump Three</a></li><li><a href="ch1.xhtml">Jump One</a></li></ol></nav></body></html>`,
      ),
      'OEBPS/ch1.xhtml': strToU8(`<html xmlns="http://www.w3.org/1999/xhtml"><body><h1>One</h1><p>A</p></body></html>`),
      'OEBPS/ch2.xhtml': strToU8(`<html xmlns="http://www.w3.org/1999/xhtml"><body><h1>Two</h1><p>B</p></body></html>`),
      'OEBPS/ch3.xhtml': strToU8(
        `<html xmlns="http://www.w3.org/1999/xhtml"><body><h1>Three</h1><h2 id="part-b">Part B</h2><p>C</p></body></html>`,
      ),
    })
    const parsed = await parseEpubDocument(new File([bytes], 'nav.epub', { type: 'application/epub+zip' }))
    expect(parsed.toc[0].title).toBe('Jump Three')
    expect(parsed.toc[0].id).toContain(parsed.sections[2].id)
    expect(parsed.toc[0].id).toContain('__frag__')
    expect(parsed.sections[2].html).toContain(parsed.toc[0].id)
    expect(parsed.toc[1].id).toBe(parsed.sections[0].id)
  })

  it('inlines package images and chapter CSS for readable preview', async () => {
    const { zipSync, strToU8 } = await import('fflate')
    const png = Uint8Array.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52, 0x00, 0x00,
      0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xde, 0x00, 0x00, 0x00,
      0x0c, 0x49, 0x44, 0x41, 0x54, 0x08, 0xd7, 0x63, 0xf8, 0xcf, 0xc0, 0x00, 0x00, 0x03, 0x01, 0x01, 0x00, 0x18,
      0xdd, 0x8d, 0xb4, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
    ])
    const bytes = zipSync({
      mimetype: strToU8('application/epub+zip'),
      'META-INF/container.xml': strToU8(
        `<?xml version="1.0"?><container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>`,
      ),
      'OEBPS/content.opf': strToU8(
        `<?xml version="1.0"?><package><metadata><dc:title xmlns:dc="http://purl.org/dc/elements/1.1/">Asset Book</dc:title></metadata><manifest><item id="c1" href="chapter1.xhtml" media-type="application/xhtml+xml"/><item id="css" href="styles/book.css" media-type="text/css"/><item id="img" href="assets/cover.png" media-type="image/png"/></manifest><spine><itemref idref="c1"/></spine></package>`,
      ),
      'OEBPS/styles/book.css': strToU8('h1{color:#123;background:url("../assets/cover.png") no-repeat;}'),
      'OEBPS/assets/cover.png': png,
      'OEBPS/chapter1.xhtml': strToU8(
        `<html xmlns="http://www.w3.org/1999/xhtml"><head><link rel="stylesheet" href="styles/book.css"/><style>.lead{font-weight:700;}</style></head><body><h1>Cover</h1><p class="lead">Hello</p><img src="assets/cover.png" alt="cover"/></body></html>`,
      ),
    })
    const file = new File([bytes], 'assets.epub', { type: 'application/epub+zip' })
    const parsed = await parseEpubDocument(file)
    const html = parsed.sections[0].html
    expect(html).toContain('data:image/png;base64,')
    expect(html).toContain('data-joint-md-epub-css="true"')
    expect(html).toContain('.lead{font-weight:700;}')
    expect(html).toMatch(/h1\{color:#123;background:url\("data:image\/png;base64,/)
    expect(html).not.toContain('src="assets/cover.png"')
  })
})
