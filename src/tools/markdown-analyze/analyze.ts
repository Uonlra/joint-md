import { parseMarkdownTables } from '../shared/tables'

export type AnalysisStats = {
  chars: number
  words: number
  lines: number
  headings: number
  tables: number
  codeBlocks: number
  links: number
}

export type HeadingNode = {
  level: number
  title: string
  children: HeadingNode[]
}

export type CodeBlockInfo = {
  language: string
  lines: number
  chars: number
}

export type LinkKind = 'http' | 'anchor' | 'relative' | 'other'

export type LinkInfo = {
  text: string
  url: string
  kind: LinkKind
}

export type MarkdownAnalysis = {
  stats: AnalysisStats
  headingTree: HeadingNode[]
  tables: ReturnType<typeof parseMarkdownTables>
  codeBlocks: CodeBlockInfo[]
  links: LinkInfo[]
}

const stripMarkdown = (value: string) => value.replace(/[`*_~[\]]/g, '').trim()

const linkKindOf = (url: string): LinkKind => {
  if (url.startsWith('#')) return 'anchor'
  if (/^https?:\/\//i.test(url)) return 'http'
  if (/^(\.{0,2}\/|[a-z0-9]+\.)[a-z0-9/._-]*$/i.test(url)) return 'relative'
  return 'other'
}

const countWords = (text: string) => {
  const cjk = (text.match(/[\u4e00-\u9fff\u3400-\u4dbf]/g) || []).length
  const latin = (text.match(/[A-Za-z0-9]+(?:['’-][A-Za-z0-9]+)*/g) || []).length
  return cjk + latin
}

export const analyzeMarkdown = (markdown: string): MarkdownAnalysis => {
  const headingMatches = Array.from(markdown.matchAll(/^(#{1,6})\s+(.+)$/gm))
  const codeBlockMatches = Array.from(markdown.matchAll(/```([\w+-]*)\s*\n([\s\S]*?)```/g))
  const linkMatches = Array.from(
    markdown.matchAll(/!?\[([^\]]*)\]\(([^)\s]+)(?:\s+["'][^"']*["'])?\)/g),
  ).filter((match) => !match[0].startsWith('!['))

  const stack: Array<{ level: number; node: HeadingNode }> = []
  const headingTree: HeadingNode[] = []
  for (const match of headingMatches) {
    const level = match[1].length
    const node: HeadingNode = { level, title: stripMarkdown(match[2]), children: [] }
    while (stack.length > 0 && stack[stack.length - 1].level >= level) stack.pop()
    if (stack.length === 0) {
      headingTree.push(node)
    } else {
      stack[stack.length - 1].node.children.push(node)
    }
    stack.push({ level, node })
  }

  const tables = parseMarkdownTables(markdown)
  const codeBlocks = codeBlockMatches.map((match) => {
    const content = match[2].replace(/\n+$/, '')
    return {
      language: match[1] || 'text',
      lines: content.split('\n').length,
      chars: content.length,
    }
  })
  const links = linkMatches.map((match) => ({
    text: stripMarkdown(match[1]) || match[2],
    url: match[2],
    kind: linkKindOf(match[2]),
  }))

  const contentWithoutWhitespace = markdown.replace(/\s+/g, '')
  return {
    stats: {
      chars: contentWithoutWhitespace.length,
      words: countWords(markdown),
      lines: markdown.split(/\r?\n/).length,
      headings: headingMatches.length,
      tables: tables.length,
      codeBlocks: codeBlocks.length,
      links: links.length,
    },
    headingTree,
    tables,
    codeBlocks,
    links,
  }
}
