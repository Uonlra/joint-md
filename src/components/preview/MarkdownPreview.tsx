import type { ReactNode, RefObject, UIEvent } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { FileOutput } from 'lucide-react'
import type { TableOfContentsItem } from '../../types'
import { headingIdFor } from '../../utils/markdown'

type MarkdownPreviewProps = {
  markdown: string
  toc: TableOfContentsItem[]
  fontSize: number
  progressKey: string
  previewRef: RefObject<HTMLDivElement | null>
}

export function MarkdownPreview({
  markdown,
  toc,
  fontSize,
  progressKey,
  previewRef,
}: MarkdownPreviewProps) {
  const headingComponents = {
    h1: ({ children }: { children?: ReactNode }) => <h1 id={headingIdFor(toc, children)}>{children}</h1>,
    h2: ({ children }: { children?: ReactNode }) => <h2 id={headingIdFor(toc, children)}>{children}</h2>,
    h3: ({ children }: { children?: ReactNode }) => <h3 id={headingIdFor(toc, children)}>{children}</h3>,
  }

  const onScroll = (event: UIEvent<HTMLDivElement>) => {
    localStorage.setItem(progressKey, String(event.currentTarget.scrollTop))
  }

  return (
    <div
      ref={previewRef}
      className={`preview-content ${markdown ? '' : 'is-empty'}`}
      style={{ fontSize: `${fontSize}px` }}
      onScroll={onScroll}
    >
      {markdown ? (
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={headingComponents}>
          {markdown}
        </ReactMarkdown>
      ) : (
        <div>
          <FileOutput size={34} />
          <p>合并后的文档会显示在这里</p>
        </div>
      )}
    </div>
  )
}
