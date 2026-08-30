import { AppShell } from '../../components/layout/AppShell'
import { TopBar } from '../../components/layout/TopBar'
import { ControlPanel } from '../../components/files/ControlPanel'
import { PreviewPanel } from '../../components/preview/PreviewPanel'
import { useWorkbench } from '../../workbench/useWorkbench'
import ToolsPage from '../ToolsPage/ToolsPage'

export default function MergePage() {
  const {
    readerMode,
    softPaper,
    toolsOpen,
    toolsInitialInput,
    toggleReaderMode,
    toggleTools,
    queue,
    preview,
  } = useWorkbench()

  return (
    <AppShell readerMode={readerMode} softPaper={softPaper}>
      <TopBar
        readerMode={readerMode}
        toolsOpen={toolsOpen}
        onToggleReaderMode={toggleReaderMode}
        onToggleTools={toggleTools}
      />
      {toolsOpen ? (
        <ToolsPage initialInput={toolsInitialInput} onClose={toggleTools} />
      ) : (
        <section className="workspace">
          <ControlPanel
            files={queue.files}
            mode={queue.mode}
            outputName={queue.exportName}
            joinMode={queue.joinMode}
            onAddFiles={queue.onAddFiles}
            onDragStart={queue.onDragStart}
            onDragEnd={queue.onDragEnd}
            onDropAt={queue.onDropAt}
            onMove={queue.onMove}
            onRemove={queue.onRemove}
            onSelectFile={queue.onSelectFile}
            onOutputNameChange={queue.onExportNameChange}
            onJoinModeChange={queue.onJoinModeChange}
          />
          <PreviewPanel
            readerMode={preview.readerMode}
            mode={preview.mode}
            outputName={preview.exportName}
            fileCount={preview.fileCount}
            contentLength={preview.contentLength}
            markdown={preview.markdown}
            segments={preview.segments}
            epubSections={preview.epubSections}
            joinModeRule={preview.joinModeRule}
            toc={preview.toc}
            tocOpen={preview.tocOpen}
            fontSize={preview.fontSize}
            softPaper={preview.softPaper}
            notice={preview.notice}
            importStatus={preview.importStatus}
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
      )}
    </AppShell>
  )
}
