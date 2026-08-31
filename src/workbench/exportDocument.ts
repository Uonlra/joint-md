import { saveMarkdownFile } from '../utils/download'
import { printPdf } from '../utils/print'

export type DownloadMarkdown = (content: string, fileName: string) => void | Promise<void>
export type OpenPrintToPdf = (html: string, title: string) => string | null

export type ExportOutcome = {
  /** Notice for the Workbench, or null when nothing should be shown. */
  notice: string | null
}

const defaultDownload: DownloadMarkdown = saveMarkdownFile

const defaultPrint: OpenPrintToPdf = (html, title) => printPdf(html, title)

/** Resolve Export Name for download / print title. */
export const resolveExportName = (exportName: string) => exportName.trim() || 'merged-document'

/**
 * Export Markdown: download the Merged Document as `.md`.
 * Returns no notice on success (silent download).
 */
export const exportMarkdown = async (
  markdown: string,
  exportName: string,
  download: DownloadMarkdown = defaultDownload,
): Promise<ExportOutcome> => {
  const base = resolveExportName(exportName)
  try {
    await download(markdown, `${base}.md`)
    return { notice: null }
  } catch (error) {
    const message = error instanceof Error ? error.message : '未知错误'
    return { notice: `Markdown 导出失败：${message}` }
  }
}

/**
 * Print to PDF: open the browser print flow for rendered Merged Document HTML.
 * Respects ADR-0001 — no headless PDF engine.
 */
export const printToPdf = (
  html: string | null | undefined,
  exportName: string,
  openPrint: OpenPrintToPdf = defaultPrint,
): ExportOutcome => {
  if (!html) return { notice: null }

  const title = resolveExportName(exportName)
  const error = openPrint(html, title)
  if (error) return { notice: error }

  return { notice: '已打开打印窗口，请在目标中选择“另存为 PDF”。' }
}
