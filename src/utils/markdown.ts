import type { ReactNode } from 'react'
import type { TableOfContentsItem } from '../types'

export const textFromChildren = (children: ReactNode): string =>
  Array.isArray(children)
    ? children.map(textFromChildren).join('')
    : typeof children === 'string' || typeof children === 'number'
      ? String(children)
      : ''

export const safeTitle = (value: string) => value.replace(/[`*_~[\]]/g, '').trim()

export const headingIdFor = (toc: TableOfContentsItem[], children: ReactNode) =>
  toc.find((item) => item.title === textFromChildren(children).trim())?.id
