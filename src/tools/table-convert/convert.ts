import { csvEscape, parseCsv, parseMarkdownTables } from '../shared/tables'

export const markdownTablesToCsv = (markdown: string) =>
  parseMarkdownTables(markdown)
    .map((table) =>
      [table.headers, ...table.rows]
        .map((row) => row.map(csvEscape).join(','))
        .join('\n'),
    )
    .join('\n\n')

export const csvToMarkdownTable = (csv: string) => {
  const rows = parseCsv(csv)
  if (rows.length === 0) return ''
  const header = rows[0]
  const body = rows.slice(1)
  const renderRow = (cells: string[]) => `| ${cells.join(' | ')} |`
  return [renderRow(header), renderRow(header.map(() => '---')), ...body.map(renderRow)].join('\n')
}
