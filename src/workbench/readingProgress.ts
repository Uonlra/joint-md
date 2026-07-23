export const persistReadingProgress = (progressKey: string, scrollTop: number) => {
  localStorage.setItem(progressKey, String(scrollTop))
}

export const restoreReadingProgress = (progressKey: string, element: HTMLElement | null) => {
  const savedPosition = Number(localStorage.getItem(progressKey))
  if (savedPosition && element) element.scrollTop = savedPosition
}
