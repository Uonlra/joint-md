import type { ReactNode, RefObject, UIEvent } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { FileOutput } from 'lucide-react'
import type { TableOfContentsItem } from '../../types'
import { sourceAnchorId, type DocumentSegment } from '../../utils/document'
import { headingIdFor } from '../../utils/markdown'
import type { EpubPreviewSection } from '../../workbench/deriveEpubDocument'

type MarkdownPreviewProps = {
  markdown: string
  segments: DocumentSegment[]
  joinModeRule: boolean
  toc: TableOfContentsItem[]
  fontSize: number
  epubSections?: EpubPreviewSection[]
  previewRef: RefObject<HTMLDivElement | null>
  onPersistProgress: (scrollTop: number) => void
}

export function MarkdownPreview({
  markdown,
  segments,
  joinModeRule,
  toc,
  fontSize,
  epubSections,
  previewRef,
  onPersistProgress,
}: MarkdownPreviewProps) {
  const headingComponents = {
    h1: ({ children }: { children?: ReactNode }) => <h1 id={headingIdFor(toc, children)}>{children}</h1>,
    h2: ({ children }: { children?: ReactNode }) => <h2 id={headingIdFor(toc, children)}>{children}</h2>,
    h3: ({ children }: { children?: ReactNode }) => <h3 id={headingIdFor(toc, children)}>{children}</h3>,
  }

  const onScroll = (event: UIEvent<HTMLDivElement>) => {
    onPersistProgress(event.currentTarget.scrollTop)
  }

  const hasEpub = Boolean(epubSections?.length)
  const hasMarkdown = Boolean(markdown)

  return (
    <div
      ref={previewRef}
      className={`preview-content ${hasEpub || hasMarkdown ? '' : 'is-empty'}`}
      style={{ fontSize: `${fontSize}px` }}
      onScroll={onScroll}
    >
      {hasEpub ? (
        epubSections!.map((section) => (
          <section key={section.id} className="source-segment epub-segment" id={section.id}>
            <article className="epub-body" dangerouslySetInnerHTML={{ __html: section.html }} />
          </section>
        ))
      ) : hasMarkdown ? (
        segments.map((segment, index) => (
          <div key={segment.id}>
            {index > 0 && joinModeRule ? <hr /> : null}
            {index > 0 && !joinModeRule ? <div className="source-gap" aria-hidden="true" /> : null}
            <section
              className="source-segment"
              id={sourceAnchorId(segment.id)}
              data-source-file={segment.id}
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={headingComponents}>
                {segment.body}
              </ReactMarkdown>
            </section>
          </div>
        ))
      ) : (
        <div>
          <FileOutput size={34} />
          <p>Merged Document 将显示在这里</p>
          <p className="empty-hint">从左侧加入 Source File 开始</p>
        </div>
      )}
    </div>
  )
}
