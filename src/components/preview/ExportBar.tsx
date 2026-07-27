import { Download, Printer } from 'lucide-react'

type ExportBarProps = {
  notice: string
  importStatus?: 'idle' | 'loading' | 'error' | 'success'
  hasMarkdown: boolean
  onExportMarkdown: () => void
  onPrintPdf: () => void
}

export function ExportBar({ notice, importStatus, hasMarkdown, onExportMarkdown, onPrintPdf }: ExportBarProps) {
  return (
    <footer className="export-bar">
      <span role="status">
        {notice || (importStatus === 'loading' ? '正在导入文件...' : '导出不会上传文件')}
      </span>
      <div>
        <button className="secondary-button" type="button" disabled={!hasMarkdown} onClick={onExportMarkdown}>
          <Download size={16} />
          Export Markdown
        </button>
        <button className="primary-button" type="button" disabled={!hasMarkdown} onClick={onPrintPdf}>
          <Printer size={16} />
          Print to PDF
        </button>
      </div>
    </footer>
  )
}
