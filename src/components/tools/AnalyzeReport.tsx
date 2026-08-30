import type { MarkdownAnalysis } from '../../tools/markdown-analyze/analyze'
import { downloadFile } from '../../utils/download'

type AnalyzeReportProps = {
  analysis: MarkdownAnalysis
}

function HeadingTree({ nodes }: { nodes: MarkdownAnalysis['headingTree'] }) {
  if (!nodes.length) return <p className="report-empty">没有标题</p>
  return (
    <ul className="heading-tree">
      {nodes.map((node) => (
        <li key={`${node.level}-${node.title}`} className={`tree-node level-${node.level}`}>
          {node.title}
          {node.children.length > 0 && <HeadingTree nodes={node.children} />}
        </li>
      ))}
    </ul>
  )
}

export function AnalyzeReport({ analysis }: AnalyzeReportProps) {
  const { stats, headingTree, tables, codeBlocks, links } = analysis

  return (
    <div className="analyze-report">
      <section className="report-section">
        <h3>统计</h3>
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-value">{stats.words.toLocaleString()}</span>
            <span className="stat-label">词数</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats.chars.toLocaleString()}</span>
            <span className="stat-label">字符</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats.lines.toLocaleString()}</span>
            <span className="stat-label">行</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats.headings}</span>
            <span className="stat-label">标题</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats.tables}</span>
            <span className="stat-label">表格</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats.codeBlocks}</span>
            <span className="stat-label">代码块</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats.links}</span>
            <span className="stat-label">链接</span>
          </div>
        </div>
      </section>

      <section className="report-section">
        <h3>标题树</h3>
        <HeadingTree nodes={headingTree} />
      </section>

      {tables.length > 0 && (
        <section className="report-section">
          <h3>表格（{tables.length}）</h3>
          {tables.map((table, index) => (
            <div key={index} className="report-table-wrap">
              <table>
                <thead>
                  <tr>
                    {table.headers.map((header, headerIndex) => (
                      <th key={headerIndex}>{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {table.rows.slice(0, 5).map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {row.map((cell, cellIndex) => (
                        <td key={cellIndex}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {table.rows.length > 5 && <p className="report-note">仅显示前 5 行</p>}
            </div>
          ))}
        </section>
      )}

      {codeBlocks.length > 0 && (
        <section className="report-section">
          <h3>代码块（{codeBlocks.length}）</h3>
          <ul className="report-list">
            {codeBlocks.map((block, index) => (
              <li key={index}>
                <code>{block.language}</code>
                <span>
                  {block.lines} 行 · {block.chars} 字符
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {links.length > 0 && (
        <section className="report-section">
          <h3>链接（{links.length}）</h3>
          <ul className="report-list">
            {links.map((link, index) => (
              <li key={index}>
                <span className="link-kind" data-kind={link.kind}>
                  {link.kind}
                </span>
                <span className="link-text">{link.text}</span>
                <code>{link.url}</code>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="report-actions">
        <button
          className="secondary-button"
          type="button"
          onClick={() =>
            downloadFile(
              'markdown-analysis.json',
              JSON.stringify(analysis, null, 2),
              'application/json',
            )
          }
        >
          下载 JSON 报告
        </button>
      </div>
    </div>
  )
}
