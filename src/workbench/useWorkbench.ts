import { useEffect, useMemo, useRef, useState } from 'react'
import type { JoinMode, SourceFile } from '../types'
import { downloadFile } from '../utils/download'
import { printPdf } from '../utils/print'
import { acceptSourceFiles, isAcceptedSourceFileName } from '../utils/sourceFiles'
import { deriveMergedDocument } from './deriveMergedDocument'
import { persistReadingProgress, restoreReadingProgress } from './readingProgress'

export function useWorkbench() {
  const [files, setFiles] = useState<SourceFile[]>([])
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [notice, setNotice] = useState('')
  const [joinMode, setJoinMode] = useState<JoinMode>('rule')
  const [exportName, setExportName] = useState('merged-document')
  const [readerMode, setReaderMode] = useState(false)
  const [tocOpen, setTocOpen] = useState(false)
  const [fontSize, setFontSize] = useState(() => Number(localStorage.getItem('joint-md-font-size')) || 16)
  const [softPaper, setSoftPaper] = useState(() => localStorage.getItem('joint-md-soft-paper') === 'true')
  const previewRef = useRef<HTMLDivElement>(null)

  const derived = useMemo(() => deriveMergedDocument(files, joinMode), [files, joinMode])

  useEffect(() => {
    localStorage.setItem('joint-md-font-size', String(fontSize))
  }, [fontSize])

  useEffect(() => {
    localStorage.setItem('joint-md-soft-paper', String(softPaper))
  }, [softPaper])

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      restoreReadingProgress(derived.progressKey, previewRef.current)
    })
    return () => cancelAnimationFrame(frame)
  }, [derived.progressKey])

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

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setTocOpen(false)
  }

  const exportMarkdown = () => {
    downloadFile(
      derived.markdown,
      `${exportName || 'merged-document'}.md`,
      'text/markdown;charset=utf-8',
    )
  }

  const printToPdf = () => {
    const content = previewRef.current?.innerHTML
    if (!content) return
    const error = printPdf(content, exportName || 'merged-document')
    if (error) {
      setNotice(error)
      return
    }
    setNotice('已打开打印窗口，请在目标中选择“另存为 PDF”。')
  }

  const queue = {
    files,
    joinMode,
    exportName,
    onAddFiles: addFiles,
    onDragStart: setDraggedId,
    onDragEnd: () => setDraggedId(null),
    onDropAt: dropAt,
    onMove: moveFile,
    onRemove: removeFile,
    onExportNameChange: setExportName,
    onJoinModeChange: setJoinMode,
  }

  const preview = {
    readerMode,
    exportName,
    fileCount: files.length,
    markdown: derived.markdown,
    toc: derived.toc,
    tocOpen,
    fontSize,
    softPaper,
    notice,
    progressKey: derived.progressKey,
    previewRef,
    onToggleToc: () => setTocOpen((open) => !open),
    onCloseToc: () => setTocOpen(false),
    onSelectSection: scrollToSection,
    onDecreaseFont: () => setFontSize((size) => size - 1),
    onIncreaseFont: () => setFontSize((size) => size + 1),
    onToggleSoftPaper: () => setSoftPaper((enabled) => !enabled),
    onEnterReaderMode: () => setReaderMode(true),
    onExportMarkdown: exportMarkdown,
    onPrintToPdf: printToPdf,
    onPersistProgress: (scrollTop: number) => persistReadingProgress(derived.progressKey, scrollTop),
  }

  return {
    readerMode,
    softPaper,
    toggleReaderMode: () => setReaderMode((enabled) => !enabled),
    queue,
    preview,
  }
}
