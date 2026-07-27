import { zipSync, strToU8 } from 'fflate'
import { writeFileSync } from 'node:fs'
import path from 'node:path'

const files = {
  mimetype: strToU8('application/epub+zip'),
  'META-INF/container.xml': strToU8(
    `<?xml version="1.0"?><container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>`,
  ),
  'OEBPS/content.opf': strToU8(
    `<?xml version="1.0"?><package><metadata><dc:title xmlns:dc="http://purl.org/dc/elements/1.1/">Sample Book</dc:title></metadata><manifest><item id="c1" href="chapter1.xhtml" media-type="application/xhtml+xml"/><item id="c2" href="chapter2.xhtml" media-type="application/xhtml+xml"/></manifest><spine><itemref idref="c1"/><itemref idref="c2"/></spine></package>`,
  ),
  'OEBPS/chapter1.xhtml': strToU8(
    `<html xmlns="http://www.w3.org/1999/xhtml"><body><h1>Praise</h1><blockquote><p><em>Effective TypeScript</em> explores TypeScript.</p></blockquote><figure data-type="cover"><img src="assets/cover.png"/></figure></body></html>`,
  ),
  'OEBPS/chapter2.xhtml': strToU8(
    `<html xmlns="http://www.w3.org/1999/xhtml"><body><h1>Chapter Two</h1><p>Second paragraph with <strong>bold</strong>.</p></body></html>`,
  ),
}

const out = path.resolve('scripts/sample.epub')
writeFileSync(out, zipSync(files))
console.log(out)
