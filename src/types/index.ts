export type DocumentKind = 'markdown' | 'epub'

export type SourceFile = {
  id: string
  name: string
  content: string
  kind?: DocumentKind
  epubSections?: Array<{ id: string; title: string; html: string }>
  epubToc?: TableOfContentsItem[]
}

export type JoinMode = 'plain' | 'rule' | 'filename-heading'
export type TableOfContentsItem = { id: string; level: number; title: string }
export type WorkbenchMode = 'markdown' | 'epub' | 'empty'
