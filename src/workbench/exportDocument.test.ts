import { describe, expect, it, vi } from 'vitest'
import { exportMarkdown, printToPdf, resolveExportName } from './exportDocument'

describe('Export Markdown and Print to PDF', () => {
  it('resolves Export Name with a default base when blank', () => {
    expect(resolveExportName('')).toBe('merged-document')
    expect(resolveExportName('   ')).toBe('merged-document')
    expect(resolveExportName('notes')).toBe('notes')
  })

  it('exports Merged Document markdown under the Export Name', () => {
    const download = vi.fn()
    const outcome = exportMarkdown('# Hello', 'chapter', download)

    expect(download).toHaveBeenCalledWith('# Hello', 'chapter.md')
    expect(outcome.notice).toBeNull()
  })

  it('uses the default Export Name when exporting without one', () => {
    const download = vi.fn()
    exportMarkdown('body', '', download)
    expect(download).toHaveBeenCalledWith('body', 'merged-document.md')
  })

  it('does nothing when Print to PDF has no rendered HTML', () => {
    const openPrint = vi.fn()
    expect(printToPdf(null, 'x', openPrint)).toEqual({ notice: null })
    expect(printToPdf('', 'x', openPrint)).toEqual({ notice: null })
    expect(openPrint).not.toHaveBeenCalled()
  })

  it('opens Print to PDF and returns a success notice', () => {
    const openPrint = vi.fn(() => null)
    const outcome = printToPdf('<p>hi</p>', 'report', openPrint)

    expect(openPrint).toHaveBeenCalledWith('<p>hi</p>', 'report')
    expect(outcome.notice).toBe('已打开打印窗口，请在目标中选择“另存为 PDF”。')
  })

  it('surfaces a notice when the print window is blocked', () => {
    const openPrint = vi.fn(() => '浏览器阻止了打印窗口，请允许弹出窗口后重试。')
    const outcome = printToPdf('<p>hi</p>', 'report', openPrint)

    expect(outcome.notice).toBe('浏览器阻止了打印窗口，请允许弹出窗口后重试。')
  })
})
