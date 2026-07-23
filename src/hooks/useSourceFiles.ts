import { useState } from 'react'
import type { SourceFile } from '../types'
import { acceptSourceFiles, isAcceptedSourceFileName } from '../utils/sourceFiles'

export function useSourceFiles() {
  const [files, setFiles] = useState<SourceFile[]>([])
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [notice, setNotice] = useState('')

  const addFiles = async (incoming: FileList | File[]) => {
    const candidates = await Promise.all(
      Array.from(incoming).map(async (file) => ({
        name: file.name,
        content: isAcceptedSourceFileName(file.name) ? await file.text() : '',
      })),
    )
    const result = acceptSourceFiles(candidates)
    if (result.files.length) {
      setFiles((current) => [...current, ...result.files])
    }
    setNotice(result.notice)
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
