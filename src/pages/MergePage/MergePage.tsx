import { AppShell } from '../../components/layout/AppShell'
import { TopBar } from '../../components/layout/TopBar'
import { ControlPanel } from '../../components/files/ControlPanel'
import { PreviewPanel } from '../../components/preview/PreviewPanel'
import { useWorkbench } from '../../workbench/useWorkbench'

export default function MergePage() {
  const { readerMode, softPaper, toggleReaderMode, queue, preview } = useWorkbench()

  return (
    <AppShell readerMode={readerMode} softPaper={softPaper}>
      <TopBar readerMode={readerMode} onToggleReaderMode={toggleReaderMode} />
      <section className="workspace">
        <ControlPanel
          files={queue.files}
          outputName={queue.exportName}
          joinMode={queue.joinMode}
          onAddFiles={queue.onAddFiles}
          onDragStart={queue.onDragStart}
          onDragEnd={queue.onDragEnd}
          onDropAt={queue.onDropAt}
          onMove={queue.onMove}
          onRemove={queue.onRemove}
          onOutputNameChange={queue.onExportNameChange}
          onJoinModeChange={queue.onJoinModeChange}
        />
        <PreviewPanel
          readerMode={preview.readerMode}
          outputName={preview.exportName}
          fileCount={preview.fileCount}
          markdown={preview.markdown}
          toc={preview.toc}
          tocOpen={preview.tocOpen}
          fontSize={preview.fontSize}
          softPaper={preview.softPaper}
          notice={preview.notice}
          previewRef={preview.previewRef}
          onToggleToc={preview.onToggleToc}
          onCloseToc={preview.onCloseToc}
          onSelectSection={preview.onSelectSection}
          onDecreaseFont={preview.onDecreaseFont}
          onIncreaseFont={preview.onIncreaseFont}
          onToggleSoftPaper={preview.onToggleSoftPaper}
          onEnterReaderMode={preview.onEnterReaderMode}
          onExportMarkdown={preview.onExportMarkdown}
          onPrintPdf={preview.onPrintToPdf}
          onPersistProgress={preview.onPersistProgress}
        />
      </section>
    </AppShell>
  )
}
