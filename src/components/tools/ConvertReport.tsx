import { useState } from 'react'
import { Copy, Download } from 'lucide-react'
import { downloadFile } from '../../utils/download'

type ConvertData = {
  kind: 'code'
  language: string
  content: string
}

type ConvertReportProps = {
  data: ConvertData
  downloads: Array<{ fileName: string; content: string; mime: string }>
}

export function ConvertReport({ data, downloads }: ConvertReportProps) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    await navigator.clipboard.writeText(data.content)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="convert-report">
      <div className="convert-toolbar">
        <button className="secondary-button" type="button" onClick={copy}>
          <Copy size={15} />
          {copied ? '已复制' : '复制结果'}
        </button>
        {downloads.map((download) => (
          <button
            key={download.fileName}
            className="secondary-button"
            type="button"
            onClick={() => downloadFile(download.content, download.fileName, download.mime)}
          >
            <Download size={15} />
            下载 {download.fileName}
          </button>
        ))}
      </div>
      <pre className="convert-output">
        <code>{data.content || '（无输出）'}</code>
      </pre>
    </div>
  )
}
