import { useState } from 'react'
import { ArrowLeft, Play } from 'lucide-react'
import { getTool, toolRegistry } from '../../tools/registry'
import type { ToolId, ToolResult } from '../../tools/types'
import type { MarkdownAnalysis } from '../../tools/markdown-analyze/analyze'
import { AnalyzeReport } from '../../components/tools/AnalyzeReport'
import { ConvertReport } from '../../components/tools/ConvertReport'
import { ToolSelector } from '../../components/tools/ToolSelector'

type ToolsPageProps = {
  initialInput: string
  onClose: () => void
}

export default function ToolsPage({ initialInput, onClose }: ToolsPageProps) {
  const [selected, setSelected] = useState<ToolId>(toolRegistry[0].id)
  const [input, setInput] = useState(initialInput)
  const [result, setResult] = useState<ToolResult | null>(null)
  const [notice, setNotice] = useState('')

  const run = () => {
    const tool = getTool(selected)
    if (!tool) return
    try {
      setResult(tool.run(input))
      setNotice('')
    } catch (error) {
      const message = error instanceof Error ? error.message : '工具运行失败'
      setNotice(`工具运行失败：${message}`)
      setResult(null)
    }
  }

  const resultView = (() => {
    if (!result) return null
    if (selected === 'markdown-analyze') {
      return <AnalyzeReport analysis={result.data as MarkdownAnalysis} />
    }
    if (selected === 'table-convert') {
      return (
        <ConvertReport
          data={result.data as { kind: 'code'; language: string; content: string }}
          downloads={result.downloads}
        />
      )
    }
    return null
  })()

  return (
    <section className="tools-page">
      <header className="tools-header">
        <button className="secondary-button" type="button" onClick={onClose}>
          <ArrowLeft size={15} />
          返回工作台
        </button>
        <div>
          <p>Tool Collection</p>
          <h1>Markdown 工具集</h1>
        </div>
      </header>

      <ToolSelector selected={selected} onSelect={setSelected} />

      <div className="tools-body">
        <div className="tools-input">
          <div className="tools-input-head">
            <strong>输入</strong>
            <button className="primary-button" type="button" onClick={run}>
              <Play size={15} />
              运行
            </button>
          </div>
          <textarea
            value={input}
            placeholder="粘贴 Markdown 内容，或回到工作台导入文件后再次打开（自动带入合并文档）"
            onChange={(event) => setInput(event.target.value)}
          />
        </div>

        <div className="tools-output">
          <div className="tools-output-head">
            <strong>{result ? result.title : '结果'}</strong>
            {result && <span className="tools-summary">{result.summary}</span>}
          </div>
          {notice ? <p className="tools-notice">{notice}</p> : null}
          {result ? (
            resultView
          ) : (
            <div className="tools-empty">
              <p>选择工具并点击「运行」</p>
              <span>输入框默认为当前文件队列的合并文档</span>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
