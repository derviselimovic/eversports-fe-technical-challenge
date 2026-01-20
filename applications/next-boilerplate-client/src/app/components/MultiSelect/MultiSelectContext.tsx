import { createContext, useContext } from 'react'
import type { MultiSelectContextValue } from './types'

export const MultiSelectContext = createContext<MultiSelectContextValue | null>(null)

export function useMultiSelectContext() {
  const context = useContext(MultiSelectContext)
  if (!context) {
    throw new Error('MultiSelect components must be used within a MultiSelect')
  }
  return context
}
