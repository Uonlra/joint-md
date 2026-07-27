import { useEffect, useMemo, useRef, useState } from 'react'
import type { JoinMode, SourceFile } from '../types'
import { sourceAnchorId } from '../utils/document'
import { acceptSourceFiles, isAcceptedSourceFileName, type IncomingDocument } from '../utils/sourceFiles'
import { createEpubDebugLogger, parseEpubDocument } from '../utils/epub'
import { deriveMergedDocument } from './deriveMergedDocument'
import { exportMarkdown as runExportMarkdown, printToPdf as runPrintToPdf } from './exportDocument'
import { persistReadingProgress, scheduleRestoreReadingProgress } from './readingProgress'

export function useWorkbench() {
  const [files, setFiles] = useState<SourceFile[]>([])
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [notice, setNotice] = useState('')
  const [importStatus, setImportStatus] = useState<'idle' | 'loading' | 'error' | 'success'>('idle')
  const [joinMode, setJoinMode] = useState<JoinMode>('rule')
  const [exportName, setExportName] = useState('merged-document')
  const [readerMode, setReaderMode] = useState(false)
  const [tocOpen, setTocOpen] = useState(false)
  const [fontSize, setFontSize] = useState(() => Number(localStorage.getItem('joint-md-font-size')) || 16)
  const [softPaper, setSoftPaper] = useState(() => localStorage.getItem('joint-md-soft-paper') === 'true')
  const previewRef = useRef<HTMLDivElement>(null)
  const epubDebugEnabled = localStorage.getItem('joint-md-debug-epub') === '1'
  const epubLogger = createEpubDebugLogger(epubDebugEnabled)

  const derived = useMemo(() => deriveMergedDocument(files, joinMode), [files, joinMode])

  useEffect(() => {
    localStorage.setItem('joint-md-font-size', String(fontSize))
  }, [fontSize])

  useEffect(() => {
    localStorage.setItem('joint-md-soft-paper', String(softPaper))
  }, [softPaper])

  useEffect(
    () => scheduleRestoreReadingProgress(derived.progressKey, () => previewRef.current),
    [derived.progressKey],
  )

  const addFiles = async (incoming: FileList | File[]) => {
    try {
      if (!incoming.length) return

      setImportStatus('loading')
      setNotice('正在导入文件...')

      const items = Array.from(incoming)
      const hasEpub = items.some((file) => /\.epub$/i.test(file.name))
      const hasMarkdown = items.some((file) => /\.(md|markdown)$/i.test(file.name))
      if (hasEpub && hasMarkdown) {
        setImportStatus('error')
        setNotice('请一次只导入 Markdown 文件或 EPUB 文件，不能混合导入。')
        return
      }

      if (hasEpub) {
        const parsed = await Promise.all(
          items.map(async (file) => {
            epubLogger.log('dispatch epub file', { name: file.name, size: file.size, type: file.type })
            const document = await parseEpubDocument(file, epubLogger)
            return {
              id: crypto.randomUUID(),
              name: `${document.title}.epub`,
              content: document.sections.map((section) => section.html).join('\n'),
            }
          }),
        )

        setFiles((current) => [...current, ...parsed])
        setNotice(`已添加 ${parsed.length} 个 EPUB 文件。`)
        setImportStatus('success')
        return
      }

      if (hasMarkdown) {
        const candidates: IncomingDocument[] = await Promise.all(
          items.map(async (file) => ({
            name: file.name,
            content: isAcceptedSourceFileName(file.name) ? await file.text() : '',
            kind: 'markdown',
          })),
        )
        const result = acceptSourceFiles(candidates)
        if (result.files.length) {
          setFiles((current) => [...current, ...result.files])
        }
        setNotice(result.notice)
        setImportStatus(result.files.length ? 'success' : 'error')
        return
      }

      setImportStatus('error')
      setNotice('请选择 .md、.markdown 或 .epub 文件。')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown import error'
      setImportStatus('error')
      setNotice(`EPUB 解析失败：${message}`)
      epubLogger.error('import failed', message)
    }
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

  const scrollToSourceFile = (id: string) => {
    document.getElementById(sourceAnchorId(id))?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const exportMarkdown = () => {
    const { notice: nextNotice } = runExportMarkdown(derived.markdown, exportName)
    if (nextNotice) setNotice(nextNotice)
  }

  const printToPdf = () => {
    const { notice: nextNotice } = runPrintToPdf(previewRef.current?.innerHTML, exportName)
    if (nextNotice) setNotice(nextNotice)
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
    onSelectFile: scrollToSourceFile,
    onExportNameChange: setExportName,
    onJoinModeChange: setJoinMode,
  }

  const preview = {
    readerMode,
    exportName,
    fileCount: files.length,
    markdown: derived.markdown,
    segments: derived.segments,
    joinModeRule: joinMode === 'rule',
    toc: derived.toc,
    tocOpen,
    fontSize,
    softPaper,
    notice,
    importStatus,
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
