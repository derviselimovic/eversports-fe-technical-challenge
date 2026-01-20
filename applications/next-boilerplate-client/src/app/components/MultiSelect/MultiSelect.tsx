import type { BaseOption, MultiSelectContextValue, MultiSelectProps } from './types'
import { MultiSelectContext } from './MultiSelectContext'
import { MultiSelectTrigger } from './MultiSelectTrigger'
import { MultiSelectContent } from './MultiSelectContent'
import { MultiSelectSearch } from './MultiSelectSearch'
import { MultiSelectSelectAll } from './MultiSelectSelectAll'
import { MultiSelectOptionsList } from './MultiSelectOptionsList'
import { MultiSelectFooter } from './MultiSelectFooter'
import './MultiSelect.css'
import React, { useCallback, useEffect, useMemo, useReducer, useRef } from 'react'

/**
 * MultiSelect State and Action Types
 */
type MultiSelectState = {
  isOpen: boolean
  searchTerm: string
  pendingValue: Set<string>
}

type MultiSelectAction =
  | { type: 'OPEN'; payload: Set<string> }
  | { type: 'CLOSE' }
  | { type: 'SET_SEARCH'; payload: string }
  | { type: 'TOGGLE_OPTION'; payload: string }
  | { type: 'SELECT_ALL'; payload: string[] }
  | { type: 'DESELECT_ALL' }
  | { type: 'SYNC_VALUE'; payload: Set<string> }

// MultiSelect state reducer
function multiSelectReducer(state: MultiSelectState, action: MultiSelectAction): MultiSelectState {
  switch (action.type) {
    case 'OPEN':
      return {
        isOpen: true,
        pendingValue: new Set(action.payload),
        searchTerm: '',
      }
    case 'CLOSE':
      return {
        ...state,
        isOpen: false,
        searchTerm: '',
      }
    case 'SET_SEARCH':
      return {
        ...state,
        searchTerm: action.payload,
      }
    case 'TOGGLE_OPTION': {
      const newPending = new Set(state.pendingValue)
      if (newPending.has(action.payload)) {
        newPending.delete(action.payload)
      } else {
        newPending.add(action.payload)
      }
      return {
        ...state,
        pendingValue: newPending,
      }
    }
    case 'SELECT_ALL':
      return {
        ...state,
        pendingValue: new Set(action.payload),
      }
    case 'DESELECT_ALL':
      return {
        ...state,
        pendingValue: new Set(),
      }
    case 'SYNC_VALUE':
      return {
        ...state,
        pendingValue: new Set(action.payload),
      }
    default:
      return state
  }
}

function MultiSelectRoot<T extends Record<string, unknown>>({
  options: rawOptions,
  value,
  onChange,
  idKey = 'id' as keyof T,
  labelKey = 'label' as keyof T,
  placeholder = 'Select items',
  className = '',
  children,
  selectedLabel,
  onOpen,
  isLoading,
}: MultiSelectProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null)

  const [state, dispatch] = useReducer(multiSelectReducer, {
    isOpen: false,
    searchTerm: '',
    pendingValue: new Set(value),
  })

  // Normalize options to BaseOption format
  const options: BaseOption[] = useMemo(
    () =>
      rawOptions.map((opt) => ({
        id: String(opt[idKey]),
        label: String(opt[labelKey]),
      })),
    [rawOptions, idKey, labelKey]
  )

  // Filter options based on search term
  const filteredOptions = useMemo(() => {
    if (!state.searchTerm.trim()) return options
    const searchLower = state.searchTerm.toLowerCase()
    return options.filter((opt) => opt.label.toLowerCase().includes(searchLower))
  }, [options, state.searchTerm])

  // Open dropdown and call onOpen callback
  const toggle = useCallback(() => {
    if (!state.isOpen) {
      dispatch({ type: 'OPEN', payload: value })
      onOpen?.()
    } else {
      dispatch({ type: 'CLOSE' })
    }
  }, [state.isOpen, value, onOpen])

  // Close dropdown
  const close = useCallback(() => {
    dispatch({ type: 'CLOSE' })
  }, [])

  // Handle search term change
  const setSearchTerm = useCallback((term: string) => {
    dispatch({ type: 'SET_SEARCH', payload: term })
  }, [])

  // Toggle individual option
  const toggleOption = useCallback((id: string) => {
    dispatch({ type: 'TOGGLE_OPTION', payload: id })
  }, [])

  // Select all options
  const selectAll = useCallback(() => {
    const idsToSelect = options.map((opt) => opt.id)
    dispatch({ type: 'SELECT_ALL', payload: idsToSelect })
  }, [options])

  // Deselect all options
  const deselectAll = useCallback(() => {
    dispatch({ type: 'DESELECT_ALL' })
  }, [])

  // Apply selection - commit pending value to parent
  const apply = useCallback(() => {
    onChange(state.pendingValue)
    dispatch({ type: 'CLOSE' })
  }, [onChange, state.pendingValue])

  // Cancel - discard pending changes
  const cancel = useCallback(() => {
    dispatch({ type: 'CLOSE' })
  }, [])

  // Click outside handler
  useEffect(() => {
    if (!state.isOpen) return

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        cancel()
      }
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        cancel()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [state.isOpen, cancel])

  // Construct context value
  const contextValue = useMemo(
    () => ({
      isOpen: state.isOpen,
      searchTerm: state.searchTerm,
      pendingValue: state.pendingValue,
      committedValue: value,
      options,
      filteredOptions,
      toggle,
      close,
      setSearchTerm,
      toggleOption,
      selectAll,
      deselectAll,
      apply,
      cancel,
      placeholder,
      selectedLabel,
      isLoading,
      idKey,
      labelKey,
    }),
    [
      state.isOpen,
      state.searchTerm,
      state.pendingValue,
      value,
      options,
      filteredOptions,
      toggle,
      close,
      setSearchTerm,
      toggleOption,
      selectAll,
      deselectAll,
      apply,
      cancel,
      placeholder,
      selectedLabel,
      isLoading,
      idKey,
      labelKey,
    ]
  )

  return (
    <MultiSelectContext.Provider value={contextValue}>
      <div ref={containerRef} className={`multiselect ${className}`}>
        {children}
      </div>
    </MultiSelectContext.Provider>
  )
}

// Compound component assembly
export const MultiSelect = Object.assign(MultiSelectRoot, {
  Trigger: MultiSelectTrigger,
  Content: MultiSelectContent,
  Search: MultiSelectSearch,
  SelectAll: MultiSelectSelectAll,
  OptionsList: MultiSelectOptionsList,
  Footer: MultiSelectFooter,
})
