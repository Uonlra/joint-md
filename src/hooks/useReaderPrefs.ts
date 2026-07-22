import { useEffect, useState } from 'react'

export function useReaderPrefs() {
  const [readerMode, setReaderMode] = useState(false)
  const [tocOpen, setTocOpen] = useState(false)
  const [fontSize, setFontSize] = useState(() => Number(localStorage.getItem('joint-md-font-size')) || 16)
  const [softPaper, setSoftPaper] = useState(() => localStorage.getItem('joint-md-soft-paper') === 'true')

  useEffect(() => {
    localStorage.setItem('joint-md-font-size', String(fontSize))
  }, [fontSize])

  useEffect(() => {
    localStorage.setItem('joint-md-soft-paper', String(softPaper))
  }, [softPaper])

  return {
    readerMode,
    setReaderMode,
    tocOpen,
    setTocOpen,
    fontSize,
    setFontSize,
    softPaper,
    setSoftPaper,
  }
}
