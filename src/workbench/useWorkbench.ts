import { useEffect, useMemo, useRef, useState } from 'react'
import type { JoinMode, SourceFile, WorkbenchMode } from '../types'
import { sourceAnchorId } from '../utils/document'
import {
  acceptSourceFiles,
  isAcceptedSourceFileName,
  kindFromFileName,
  kindFromQueue,
  maxSizeForKind,
  NOTICE_MIXED_IMPORT,
  NOTICE_QUEUE_KIND_MISMATCH,
  NOTICE_UNSUPPORTED,
  oversizedNotice,
  type DocumentKind,
  type IncomingDocument,
} from '../utils/sourceFiles'
import { createEpubDebugLogger, joinEpubSections, parseEpubDocument } from '../utils/epub'
import { deriveEpubDocument, epubSectionAnchorId } from './deriveEpubDocument'
import { deriveMergedDocument } from './deriveMergedDocument'
import { exportMarkdown as runExportMarkdown, printToPdf as runPrintToPdf } from './exportDocument'
import { persistReadingProgress, scheduleRestoreReadingProgress } from './readingProgress'

const alertValidation = (message: string) => {
  window.alert(message)
}

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

  const mode: WorkbenchMode = useMemo(() => {
    const kind = kindFromQueue(files)
    if (!kind) return files.length ? 'markdown' : 'empty'
    return kind
  }, [files])

  const derivedMarkdown = useMemo(() => deriveMergedDocument(files, joinMode), [files, joinMode])
  const derivedEpub = useMemo(() => deriveEpubDocument(files), [files])

  const activeToc = mode === 'epub' ? derivedEpub.toc : derivedMarkdown.toc
  const progressKey = mode === 'epub' ? derivedEpub.progressKey : derivedMarkdown.progressKey
  const previewTitle = mode === 'epub' ? derivedEpub.title || exportName : exportName
  const contentLength =
    mode === 'epub'
      ? derivedEpub.sections.reduce((sum, section) => sum + section.html.length, 0)
      : derivedMarkdown.markdown.length

  useEffect(() => {
    localStorage.setItem('joint-md-font-size', String(fontSize))
  }, [fontSize])

  useEffect(() => {
    localStorage.setItem('joint-md-soft-paper', String(softPaper))
  }, [softPaper])

  useEffect(
    () => scheduleRestoreReadingProgress(progressKey, () => previewRef.current),
    [progressKey],
  )

  useEffect(() => {
    if (mode === 'epub') setTocOpen(false)
  }, [mode])

  const failImport = (message: string) => {
    setImportStatus('error')
    setNotice(message)
    alertValidation(message)
  }

  const addFiles = async (incoming: FileList | File[]) => {
    try {
      if (!incoming.length) return

      setImportStatus('loading')
      setNotice('正在导入文件...')

      const items = Array.from(incoming)
      const kinds = new Set(
        items.map((file) => kindFromFileName(file.name)).filter((kind): kind is DocumentKind => Boolean(kind)),
      )
      const hasUnsupported = items.some((file) => !kindFromFileName(file.name))

      if (hasUnsupported || kinds.size === 0) {
        failImport(NOTICE_UNSUPPORTED)
        return
      }

      if (kinds.size > 1) {
        failImport(NOTICE_MIXED_IMPORT)
        return
      }

      const incomingKind = [...kinds][0]
      const currentKind = kindFromQueue(files)
      if (currentKind && currentKind !== incomingKind) {
        failImport(NOTICE_QUEUE_KIND_MISMATCH)
        return
      }

      const maxSize = maxSizeForKind(incomingKind)
      const oversized = items.find((file) => file.size > maxSize)
      if (oversized) {
        failImport(oversizedNotice(incomingKind))
        return
      }

      if (incomingKind === 'epub') {
        const parsed = await Promise.all(
          items.map(async (file) => {
            epubLogger.log('dispatch epub file', { name: file.name, size: file.size, type: file.type })
            const document = await parseEpubDocument(file, epubLogger)
            const sourceId = crypto.randomUUID()
            const idMap = new Map<string, string>()
            const sections = document.sections.map((section, index) => {
              const stableId = epubSectionAnchorId(sourceId, index)
              idMap.set(section.id, stableId)
              const html = section.html.split(section.id).join(stableId)
              return {
                id: stableId,
                title: section.title,
                html,
                path: section.path,
              }
            })
            const toc = document.toc.map((item) => {
              let id = item.id
              for (const [from, to] of idMap) {
                if (id === from || id.startsWith(`${from}__frag__`)) {
                  id = id.split(from).join(to)
                  break
                }
              }
              if (!sections.some((section) => section.id === id || id.startsWith(`${section.id}__frag__`))) {
                const byPath = sections.find((section) => section.path && item.path && section.path === item.path)
                id = byPath?.id ?? sections[0]?.id ?? id
              }
              return {
                id,
                level: item.level,
                title: item.title,
              }
            })
            return {
              id: sourceId,
              name: `${document.title}.epub`,
              content: joinEpubSections(
                sections.map((section) => ({
                  id: section.id,
                  title: section.title,
                  content: '',
                  html: section.html,
                  path: section.path,
                })),
              ),
              kind: 'epub' as const,
              epubSections: sections.map(({ id, title, html }) => ({ id, title, html })),
              epubToc: toc,
            }
          }),
        )

        setFiles((current) => [...current, ...parsed])
        if (!exportName || exportName === 'merged-document') {
          setExportName(parsed[0]?.name.replace(/\.epub$/i, '') || 'epub-document')
        }
        setNotice(`已添加 ${parsed.length} 个 EPUB 文件。`)
        setImportStatus('success')
        return
      }

      const candidates: IncomingDocument[] = await Promise.all(
        items.map(async (file) => ({
          name: file.name,
          content: isAcceptedSourceFileName(file.name) ? await file.text() : '',
          kind: 'markdown',
        })),
      )
      const result = acceptSourceFiles(candidates)
      if (result.files.length) {
        setFiles((current) => [
          ...current,
          ...result.files.map((file) => ({ ...file, kind: 'markdown' as const })),
        ])
        setNotice(result.notice)
        setImportStatus('success')
        return
      }

      failImport(result.notice)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown import error'
      const noticeMessage = `EPUB 解析失败：${message}`
      failImport(noticeMessage)
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

  const scrollWithinPreview = (id: string) => {
    const container = previewRef.current
    const target = document.getElementById(id)
    if (!target) return
    if (!container || !container.contains(target)) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }
    const containerRect = container.getBoundingClientRect()
    const targetRect = target.getBoundingClientRect()
    const nextTop = targetRect.top - containerRect.top + container.scrollTop - 8
    container.scrollTo({ top: Math.max(0, nextTop), behavior: 'smooth' })
  }

  const scrollToSection = (id: string) => {
    scrollWithinPreview(id)
    setTocOpen(false)
  }

  const scrollToSourceFile = (id: string) => {
    if (mode === 'epub') {
      const firstSection = derivedEpub.sections.find((section) => section.sourceFileId === id)
      if (firstSection) {
        scrollWithinPreview(firstSection.id)
        return
      }
    }
    scrollWithinPreview(sourceAnchorId(id))
  }

  const exportMarkdown = () => {
    if (mode === 'epub') {
      failImport('当前是 EPUB 阅读模式，不能导出为 Markdown。')
      return
    }
    const { notice: nextNotice } = runExportMarkdown(derivedMarkdown.markdown, exportName)
    if (nextNotice) setNotice(nextNotice)
  }

  const printToPdf = () => {
    const { notice: nextNotice } = runPrintToPdf(previewRef.current?.innerHTML, exportName)
    if (nextNotice) setNotice(nextNotice)
  }

  const queue = {
    files,
    mode,
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
    mode,
    exportName: previewTitle,
    fileCount: files.length,
    markdown: mode === 'markdown' ? derivedMarkdown.markdown : '',
    segments: mode === 'markdown' ? derivedMarkdown.segments : [],
    epubSections: mode === 'epub' ? derivedEpub.sections : [],
    joinModeRule: mode === 'markdown' && joinMode === 'rule',
    toc: activeToc,
    tocOpen,
    fontSize,
    softPaper,
    notice,
    importStatus,
    contentLength,
    progressKey,
    previewRef,
    onToggleToc: () => {
      if (mode === 'epub') return
      setTocOpen((open) => !open)
    },
    onCloseToc: () => setTocOpen(false),
    onSelectSection: scrollToSection,
    onDecreaseFont: () => setFontSize((size) => size - 1),
    onIncreaseFont: () => setFontSize((size) => size + 1),
    onToggleSoftPaper: () => setSoftPaper((enabled) => !enabled),
    onEnterReaderMode: () => setReaderMode(true),
    onExportMarkdown: exportMarkdown,
    onPrintToPdf: printToPdf,
    onPersistProgress: (scrollTop: number) => persistReadingProgress(progressKey, scrollTop),
  }

  return {
    readerMode,
    softPaper,
    toggleReaderMode: () => setReaderMode((enabled) => !enabled),
    queue,
    preview,
  }
}
