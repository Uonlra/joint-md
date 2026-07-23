import { describe, expect, it } from 'vitest'
import {
  keyFromMergedDocument,
  persistReadingProgress,
  restoreReadingProgress,
  type ProgressStore,
} from './readingProgress'

const memoryStore = (): ProgressStore & { data: Map<string, string> } => {
  const data = new Map<string, string>()
  return {
    data,
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => {
      data.set(key, value)
    },
  }
}

describe('Reading Progress', () => {
  it('fingerprints Merged Document content into a stable Browser Memory key', () => {
    const key = keyFromMergedDocument('# Alpha\n\n## Beta')
    expect(key).toMatch(/^joint-md-progress-/)
    expect(keyFromMergedDocument('# Alpha\n\n## Beta')).toBe(key)
    expect(keyFromMergedDocument('# Alpha\n\n---\n\n## Beta')).not.toBe(key)
  })

  it('persists scroll position under the progress key', () => {
    const store = memoryStore()
    const key = keyFromMergedDocument('doc')
    persistReadingProgress(key, 420, store)
    expect(store.data.get(key)).toBe('420')
  })

  it('restores scroll position onto the preview element', () => {
    const store = memoryStore()
    const key = keyFromMergedDocument('doc')
    store.setItem(key, '180')
    const element = { scrollTop: 0 }
    restoreReadingProgress(key, element as HTMLElement, store)
    expect(element.scrollTop).toBe(180)
  })

  it('does not move scroll when no progress is stored', () => {
    const store = memoryStore()
    const element = { scrollTop: 12 }
    restoreReadingProgress(keyFromMergedDocument('empty'), element as HTMLElement, store)
    expect(element.scrollTop).toBe(12)
  })
})
