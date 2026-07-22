import { useEffect, type RefObject } from 'react'

export function useReadingProgress(progressKey: string, previewRef: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const savedPosition = Number(localStorage.getItem(progressKey))
      if (savedPosition && previewRef.current) previewRef.current.scrollTop = savedPosition
    })
    return () => cancelAnimationFrame(frame)
  }, [progressKey, previewRef])
}
