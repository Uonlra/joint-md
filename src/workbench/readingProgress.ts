export type ProgressStore = {
  getItem: (key: string) => string | null
  setItem: (key: string, value: string) => void
}

const browserStore: ProgressStore = {
  getItem: (key) => localStorage.getItem(key),
  setItem: (key, value) => localStorage.setItem(key, value),
}

/** Browser Memory key for Reading Progress of one Merged Document fingerprint. */
export const keyFromMergedDocument = (markdown: string) => {
  let hash = 0
  for (let index = 0; index < markdown.length; index += 1) {
    hash = (hash * 31 + markdown.charCodeAt(index)) | 0
  }
  return `joint-md-progress-${hash}`
}

export const persistReadingProgress = (
  progressKey: string,
  scrollTop: number,
  store: ProgressStore = browserStore,
) => {
  store.setItem(progressKey, String(scrollTop))
}

export const restoreReadingProgress = (
  progressKey: string,
  element: HTMLElement | null,
  store: ProgressStore = browserStore,
) => {
  const savedPosition = Number(store.getItem(progressKey))
  if (savedPosition && element) element.scrollTop = savedPosition
}

/** Schedule restore on the next frame; returns a cancel function. */
export const scheduleRestoreReadingProgress = (
  progressKey: string,
  getElement: () => HTMLElement | null,
  store: ProgressStore = browserStore,
) => {
  const frame = requestAnimationFrame(() => {
    restoreReadingProgress(progressKey, getElement(), store)
  })
  return () => cancelAnimationFrame(frame)
}
