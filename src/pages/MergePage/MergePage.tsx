import { useMemo, useRef } from 'react'
import { AppShell } from '../../components/layout/AppShell'
import { TopBar } from '../../components/layout/TopBar'
import { ControlPanel } from '../../components/files/ControlPanel'
import { PreviewPanel } from '../../components/preview/PreviewPanel'
import { useJoinSettings } from '../../hooks/useJoinSettings'
import { useReaderPrefs } from '../../hooks/useReaderPrefs'
import { useReadingProgress } from '../../hooks/useReadingProgress'
import { useSourceFiles } from '../../hooks/useSourceFiles'
import { buildToc, documentHash, makeDocument } from '../../utils/document'
import { downloadFile } from '../../utils/download'
import { printPdf } from '../../utils/print'

export default function MergePage() {
  const { files, notice, setNotice, setDraggedId, addFiles, moveFile, dropAt, removeFile } =
    useSourceFiles()
  const { joinMode, setJoinMode, outputName, setOutputName } = useJoinSettings()
  const {
    readerMode,
    setReaderMode,
    tocOpen,
    setTocOpen,
    fontSize,
    setFontSize,
    softPaper,
    setSoftPaper,
  } = useReaderPrefs()
  const previewRef = useRef<HTMLDivElement>(null)

  const markdown = useMemo(() => makeDocument(files, joinMode), [files, joinMode])
  const progressKey = useMemo(() => documentHash(markdown), [markdown])
  const toc = useMemo(() => buildToc(markdown), [markdown])
  useReadingProgress(progressKey, previewRef)

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setTocOpen(false)
  }

  const handlePrintPdf = () => {
    const content = previewRef.current?.innerHTML
    if (!content) return
    const error = printPdf(content, outputName || 'merged-document')
    if (error) {
      setNotice(error)
      return
    }
    setNotice('已打开打印窗口，请在目标中选择“另存为 PDF”。')
  }

  return (
    <AppShell readerMode={readerMode} softPaper={softPaper}>
      <TopBar readerMode={readerMode} onToggleReaderMode={() => setReaderMode((enabled) => !enabled)} />
      <section className="workspace">
        <ControlPanel
          files={files}
          outputName={outputName}
          joinMode={joinMode}
          onAddFiles={addFiles}
          onDragStart={setDraggedId}
          onDragEnd={() => setDraggedId(null)}
          onDropAt={dropAt}
          onMove={moveFile}
          onRemove={removeFile}
          onOutputNameChange={setOutputName}
          onJoinModeChange={setJoinMode}
        />
        <PreviewPanel
          readerMode={readerMode}
          outputName={outputName}
          fileCount={files.length}
          markdown={markdown}
          toc={toc}
          tocOpen={tocOpen}
          fontSize={fontSize}
          softPaper={softPaper}
          notice={notice}
          progressKey={progressKey}
          previewRef={previewRef}
          onToggleToc={() => setTocOpen((open) => !open)}
          onCloseToc={() => setTocOpen(false)}
          onSelectSection={scrollToSection}
          onDecreaseFont={() => setFontSize((size) => size - 1)}
          onIncreaseFont={() => setFontSize((size) => size + 1)}
          onToggleSoftPaper={() => setSoftPaper((enabled) => !enabled)}
          onEnterReaderMode={() => setReaderMode(true)}
          onExportMarkdown={() =>
            downloadFile(markdown, `${outputName || 'merged-document'}.md`, 'text/markdown;charset=utf-8')
          }
          onPrintPdf={handlePrintPdf}
        />
      </section>
    </AppShell>
  )
}
