export type ParsedTable = {
  headers: string[]
  rows: string[][]
}

export const splitMarkdownCells = (line: string) =>
  line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cell.trim())

const isSeparatorRow = (line: string) => /^\s*\|?[\s:\-|]+\|?\s*$/.test(line) && /-/.test(line)

/** Parse GFM-style tables out of a Markdown document. */
export const parseMarkdownTables = (markdown: string): ParsedTable[] => {
  const lines = markdown.split(/\r?\n/)
  const tables: ParsedTable[] = []

  for (let index = 0; index < lines.length; index += 1) {
    if (!lines[index].includes('|') || !isSeparatorRow(lines[index + 1] ?? '')) continue
    const headers = splitMarkdownCells(lines[index])
    const rows: string[][] = []
    let cursor = index + 2
    while (cursor < lines.length && lines[cursor].includes('|')) {
      rows.push(splitMarkdownCells(lines[cursor]))
      cursor += 1
    }
    tables.push({ headers, rows })
    index = cursor - 1
  }

  return tables
}

export const csvEscape = (value: string) =>
  /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value

export const parseCsv = (csv: string): string[][] => {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let inQuotes = false

  for (let index = 0; index < csv.length; index += 1) {
    const char = csv[index]
    if (inQuotes) {
      if (char === '"') {
        if (csv[index + 1] === '"') {
          cell += '"'
          index += 1
        } else {
          inQuotes = false
        }
      } else {
        cell += char
      }
      continue
    }

    if (char === '"') {
      inQuotes = true
    } else if (char === ',') {
      row.push(cell)
      cell = ''
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && csv[index + 1] === '\n') index += 1
      row.push(cell)
      rows.push(row)
      row = []
      cell = ''
    } else {
      cell += char
    }
  }

  if (cell !== '' || row.length > 0) {
    row.push(cell)
    rows.push(row)
  }

  return rows.filter((cells) => cells.some((value) => value.trim() !== ''))
}
