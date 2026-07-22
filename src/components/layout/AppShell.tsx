import type { ReactNode } from 'react'

type AppShellProps = {
  readerMode: boolean
  softPaper: boolean
  children: ReactNode
}

export function AppShell({ readerMode, softPaper, children }: AppShellProps) {
  return (
    <main className={`app-shell ${readerMode ? 'reader-mode' : ''} ${softPaper ? 'soft-paper' : ''}`}>
      {children}
    </main>
  )
}
