import { useState } from 'react'
import type { JoinMode } from '../types'

export function useJoinSettings() {
  const [joinMode, setJoinMode] = useState<JoinMode>('line')
  const [outputName, setOutputName] = useState('merged-document')
  return { joinMode, setJoinMode, outputName, setOutputName }
}
