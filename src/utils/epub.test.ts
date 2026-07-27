import { describe, expect, it } from 'vitest'
import { isAcceptedEpubName } from './epub'

describe('EPUB support', () => {
  it('accepts epub names', () => {
    expect(isAcceptedEpubName('book.epub')).toBe(true)
    expect(isAcceptedEpubName('book.txt')).toBe(false)
  })
})
