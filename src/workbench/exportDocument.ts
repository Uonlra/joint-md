import { downloadFile } from '../utils/download'
import { printPdf } from '../utils/print'

export type DownloadMarkdown = (content: string, fileName: string) => void
export type OpenPrintToPdf = (html: string, title: string) => string | null

export type ExportOutcome = {
  /** Notice for the Workbench, or null when nothing should be shown. */
  notice: string | null
}

const defaultDownload: DownloadMarkdown = (content, fileName) => {
  downloadFile(content, fileName, 'text/markdown;charset=utf-8')
}

const defaultPrint: OpenPrintToPdf = (html, title) => printPdf(html, title)

/** Resolve Export Name for download / print title. */
export const resolveExportName = (exportName: string) => exportName.trim() || 'merged-document'

/**
 * Export Markdown: download the Merged Document as `.md`.
 * Returns no notice on success (silent download).
 */
export const exportMarkdown = (
  markdown: string,
  exportName: string,
  download: DownloadMarkdown = defaultDownload,
): ExportOutcome => {
  const base = resolveExportName(exportName)
  download(markdown, `${base}.md`)
  return { notice: null }
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
