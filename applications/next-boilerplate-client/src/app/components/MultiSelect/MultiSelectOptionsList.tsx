import { useMemo } from 'react'
import { useMultiSelectContext } from './MultiSelectContext'
import { MultiSelectOption } from './MultiSelectOption'

export interface MultiSelectOptionsListProps {
  className?: string
  emptyMessage?: string
  noOptionsMessage?: string
}

export function MultiSelectOptionsList({
  className = '',
  emptyMessage = 'No results found',
  noOptionsMessage = 'No options available',
}: MultiSelectOptionsListProps) {
  const { options, searchTerm, isLoading } = useMultiSelectContext()

  // Filter options based on search term
  const filteredOptions = useMemo(() => {
    if (!searchTerm) return options
    const lowerSearch = searchTerm.toLowerCase()
    return options.filter((opt) => opt.label.toLowerCase().includes(lowerSearch))
  }, [options, searchTerm])

  // Loading skeleton
  if (isLoading && options.length === 0) {
    return (
      <div className={`multiselect-options ${className}`}>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="multiselect-skeleton animate-pulse">
            <div className="multiselect-skeleton__checkbox" />
            <div className="multiselect-skeleton__text" />
          </div>
        ))}
      </div>
    )
  }

  // No options available
  if (options.length === 0 && !isLoading) {
    return (
      <div className={`multiselect-options ${className}`}>
        <div className="multiselect-options__empty">{noOptionsMessage}</div>
      </div>
    )
  }

  // No search results
  if (filteredOptions.length === 0 && searchTerm) {
    return (
      <div className={`multiselect-options ${className}`}>
        <div className="multiselect-options__empty">{emptyMessage}</div>
      </div>
    )
  }

  return (
    <div className={`multiselect-options ${className}`} role="listbox" aria-multiselectable="true">
      <ul className="multiselect-options__list">
        {filteredOptions.map((option) => (
          <MultiSelectOption key={option.id} option={option} />
        ))}
      </ul>
    </div>
  )
}
