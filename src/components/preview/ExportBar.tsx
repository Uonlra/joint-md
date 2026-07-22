import { Download, Printer } from 'lucide-react'

type ExportBarProps = {
  notice: string
  hasMarkdown: boolean
  onExportMarkdown: () => void
  onPrintPdf: () => void
}

export function ExportBar({ notice, hasMarkdown, onExportMarkdown, onPrintPdf }: ExportBarProps) {
  return (
    <footer className="export-bar">
      <span role="status">{notice}</span>
      <div>
        <button className="secondary-button" type="button" disabled={!hasMarkdown} onClick={onExportMarkdown}>
          <Download size={17} />
          导出 Markdown
        </button>
        <button className="primary-button" type="button" disabled={!hasMarkdown} onClick={onPrintPdf}>
          <Printer size={17} />
          打印为 PDF
        </button>
      </div>
    </footer>
  )
}
