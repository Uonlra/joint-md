import { isTauri } from '@tauri-apps/api/core'
import { save } from '@tauri-apps/plugin-dialog'
import { writeTextFile } from '@tauri-apps/plugin-fs'

export const downloadFile = (content: BlobPart, name: string, type: string) => {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const link = document.createElement('a')
  link.href = url
  link.download = name
  link.click()
  URL.revokeObjectURL(url)
}

/** Save Markdown through the native dialog when hosted by Tauri. */
export const saveMarkdownFile = async (content: string, name: string): Promise<void> => {
  if (!isTauri()) {
    downloadFile(content, name, 'text/markdown;charset=utf-8')
    return
  }

  const path = await save({
    defaultPath: name,
    filters: [{ name: 'Markdown', extensions: ['md'] }],
  })

  if (path) await writeTextFile(path, content)
}
