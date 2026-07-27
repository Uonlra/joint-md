import type { SourceFile } from '../types'

export type DocumentKind = 'markdown' | 'epub'

export type IncomingSource = {
  name: string
  content: string
}

export type IncomingDocument = IncomingSource & {
  kind: DocumentKind
}

export type AcceptSourceFilesResult = {
  files: SourceFile[]
  notice: string
}

export const isAcceptedSourceFileName = (name: string) => /\.(md|markdown)$/i.test(name)
export const isAcceptedDocumentName = (name: string) => /\.(md|markdown|epub)$/i.test(name)

export const MAX_MARKDOWN_FILE_SIZE = 5 * 1024 * 1024
export const MAX_EPUB_FILE_SIZE = 50 * 1024 * 1024

export const NOTICE_UNSUPPORTED =
  '请选择 .md、.markdown 或 .epub 文件。'
export const NOTICE_MIXED_IMPORT =
  '请一次只导入 Markdown 文件或 EPUB 文件，不能混合导入。'
export const NOTICE_QUEUE_KIND_MISMATCH =
  '工作队列中不能同时存在 Markdown 与 EPUB 文件。请先清空队列，再导入同一种类型。'

const formatSize = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(0)} MB`

export const kindFromFileName = (name: string): DocumentKind | null => {
  if (/\.epub$/i.test(name)) return 'epub'
  if (/\.(md|markdown)$/i.test(name)) return 'markdown'
  return null
}

export const kindFromQueue = (
  files: Array<{ name: string; kind?: DocumentKind }>,
): DocumentKind | null => {
  const kinds = new Set(
    files
      .map((file) => file.kind ?? kindFromFileName(file.name))
      .filter((kind): kind is DocumentKind => Boolean(kind)),
  )
  if (kinds.size === 0) return null
  if (kinds.size > 1) return null
  return [...kinds][0]
}

export const maxSizeForKind = (kind: DocumentKind) =>
  kind === 'epub' ? MAX_EPUB_FILE_SIZE : MAX_MARKDOWN_FILE_SIZE

export const oversizedNotice = (kind: DocumentKind) =>
  `单个 ${kind === 'epub' ? 'EPUB' : 'Markdown'} 文件最大支持 ${formatSize(maxSizeForKind(kind))}。`

export const acceptSourceFiles = (
  incoming: IncomingDocument[],
  createId: () => string = () => crypto.randomUUID(),
): AcceptSourceFilesResult => {
  const accepted = incoming.filter((file) => isAcceptedDocumentName(file.name))
  if (!accepted.length) {
    return { files: [], notice: NOTICE_UNSUPPORTED }
  }

  const kinds = new Set(accepted.map((file) => file.kind))
  if (kinds.size > 1) {
    return { files: [], notice: NOTICE_MIXED_IMPORT }
  }

  const kind = accepted[0].kind
  const maxSize = maxSizeForKind(kind)
  const oversized = accepted.find((file) => new Blob([file.content]).size > maxSize)
  if (oversized) {
    return {
      files: [],
      notice: oversizedNotice(kind),
    }
  }

  const files = accepted.map((file) => ({
    id: createId(),
    name: file.name,
    content: file.content,
  }))

  return { files, notice: `已添加 ${files.length} 个文件。` }
}
