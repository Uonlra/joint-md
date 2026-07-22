import { useState } from 'react'
import type { SourceFile } from '../types'

export function useSourceFiles() {
  const [files, setFiles] = useState<SourceFile[]>([])
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [notice, setNotice] = useState('')

  const addFiles = async (incoming: FileList | File[]) => {
    const accepted = Array.from(incoming).filter((file) => /\.(md|markdown)$/i.test(file.name))
    if (!accepted.length) {
      setNotice('请选择 .md 或 .markdown 文件。')
      return
    }
    const entries = await Promise.all(
      accepted.map(async (file) => ({
        id: crypto.randomUUID(),
        name: file.name,
        content: await file.text(),
      })),
    )
    setFiles((current) => [...current, ...entries])
    setNotice(`已添加 ${entries.length} 个文件。`)
  }

  const moveFile = (from: number, to: number) => {
    if (to < 0 || to >= files.length) return
    setFiles((current) => {
      const next = [...current]
      const [moved] = next.splice(from, 1)
      next.splice(to, 0, moved)
      return next
    })
  }

  const dropAt = (target: string) => {
    if (!draggedId || target === draggedId) return
    setFiles((current) => {
      const next = [...current]
      const from = next.findIndex((file) => file.id === draggedId)
      const to = next.findIndex((file) => file.id === target)
      const [moved] = next.splice(from, 1)
      next.splice(to, 0, moved)
      return next
    })
    setDraggedId(null)
  }

  const removeFile = (id: string) => {
    setFiles((current) => current.filter((item) => item.id !== id))
  }

  return {
    files,
    draggedId,
    notice,
    setNotice,
    setDraggedId,
    addFiles,
    moveFile,
    dropAt,
    removeFile,
  }
}
