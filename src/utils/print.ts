export const printPdf = (content: string, title: string): string | null => {
  const printWindow = window.open('', '_blank', 'noopener,noreferrer')
  if (!printWindow) return '浏览器阻止了打印窗口，请允许弹出窗口后重试。'
  printWindow.document.write(
    `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><title>${title}</title><style>@page{size:A4;margin:20mm 18mm}body{color:#2c2c34;font-family:Georgia,"Noto Serif SC","Microsoft YaHei",serif;font-size:11pt;line-height:1.75}h1,h2,h3,h4{color:#050038;font-family:Arial,"Microsoft YaHei",sans-serif;break-after:avoid}h1{font-size:22pt}h2{font-size:17pt;margin-top:22pt}h3{font-size:14pt;margin-top:18pt}p{margin:0 0 10pt}pre{padding:10pt;white-space:pre-wrap;background:#f7f8fa;border-radius:4pt;font-size:8.5pt}code{font-family:Consolas,monospace;background:#f7f8fa;padding:1pt 3pt}pre code{background:transparent;padding:0}blockquote{margin:10pt 0;padding-left:12pt;border-left:3pt solid #4262ff;color:#555a6a}table{width:100%;border-collapse:collapse;margin:10pt 0;font-size:9.5pt}th,td{border:1px solid #e0e2e8;padding:5pt;text-align:left}th{background:#f7f8fa}img{max-width:100%}hr{border:0;border-top:1px solid #c7cad5;margin:18pt 0}</style></head><body>${content}</body></html>`,
  )
  printWindow.document.close()
  printWindow.addEventListener('load', () => printWindow.print(), { once: true })
  return null
}
