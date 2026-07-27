import type { SourceFile } from '../types'

export type IncomingSource = {
  name: string
  content: string
}

export type IncomingDocument = IncomingSource & {
  kind: 'markdown' | 'epub'
}

export type AcceptSourceFilesResult = {
  files: SourceFile[]
  notice: string
}

export const isAcceptedSourceFileName = (name: string) => /\.(md|markdown)$/i.test(name)
export const isAcceptedDocumentName = (name: string) => /\.(md|markdown|epub)$/i.test(name)

export const MAX_MARKDOWN_FILE_SIZE = 5 * 1024 * 1024
export const MAX_EPUB_FILE_SIZE = 50 * 1024 * 1024

const formatSize = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(0)} MB`

export const acceptSourceFiles = (
  incoming: IncomingDocument[],
  createId: () => string = () => crypto.randomUUID(),
): AcceptSourceFilesResult => {
  const accepted = incoming.filter((file) => isAcceptedDocumentName(file.name))
  if (!accepted.length) {
    return { files: [], notice: '请选择 .md、.markdown 或 .epub 文件。' }
  }

  const kinds = new Set(accepted.map((file) => file.kind))
  if (kinds.size > 1) {
    return { files: [], notice: '请一次只导入 Markdown 文件或 EPUB 文件，不能混合导入。' }
  }

  const kind = accepted[0].kind
  const maxSize = kind === 'epub' ? MAX_EPUB_FILE_SIZE : MAX_MARKDOWN_FILE_SIZE
  const oversized = accepted.find((file) => new Blob([file.content]).size > maxSize)
  if (oversized) {
    return {
      files: [],
      notice: `单个 ${kind === 'epub' ? 'EPUB' : 'Markdown'} 文件最大支持 ${formatSize(maxSize)}。`,
    }
  }

  const files = accepted.map((file) => ({
    id: createId(),
    name: file.name,
    content: file.content,
  }))

  return { files, notice: `已添加 ${files.length} 个文件。` }
}
