import type { SourceFile } from '../types'

export type IncomingSource = {
  name: string
  content: string
}

export type AcceptSourceFilesResult = {
  files: SourceFile[]
  notice: string
}

export const isAcceptedSourceFileName = (name: string) => /\.(md|markdown)$/i.test(name)
export const isAcceptedDocumentName = (name: string) => /\.(md|markdown|epub)$/i.test(name)

export const acceptSourceFiles = (
  incoming: IncomingSource[],
  createId: () => string = () => crypto.randomUUID(),
): AcceptSourceFilesResult => {
  const files = incoming
    .filter((file) => isAcceptedDocumentName(file.name))
    .map((file) => ({
      id: createId(),
      name: file.name,
      content: file.content,
    }))

  if (!files.length) {
    return { files: [], notice: '请选择 .md、.markdown 或 .epub 文件。' }
  }

  return { files, notice: `已添加 ${files.length} 个文件。` }
}
