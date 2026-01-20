import { useMultiSelectContext } from './MultiSelectContext'
import './MultiSelect.css'

interface MultiSelectSelectAllProps {
  label?: string
}

export function MultiSelectSelectAll({ label = 'Select all' }: MultiSelectSelectAllProps) {
  const { pendingValue, options, selectAll, deselectAll, isLoading } = useMultiSelectContext()

  const optionIds = options.map((o) => o.id)
  const allSelected = optionIds.length > 0 && optionIds.every((id) => pendingValue.has(id))
  const someSelected = optionIds.some((id) => pendingValue.has(id))
  const isIndeterminate = someSelected && !allSelected
  const isDisabled = isLoading || options.length === 0

  const handleClick = () => {
    if (isDisabled) return
    if (allSelected) {
      deselectAll()
    } else {
      selectAll()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick()
    }
  }

  return (
    <div
      className={`multiselect-select-all ${isDisabled ? 'multiselect-select-all--disabled' : ''}`}
      role="checkbox"
      aria-checked={allSelected ? 'true' : isIndeterminate ? 'mixed' : 'false'}
      tabIndex={isDisabled ? -1 : 0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <div
        className={`multiselect-checkbox${
          allSelected ? ' multiselect-checkbox--checked' : ''
        }${isIndeterminate ? ' multiselect-checkbox--indeterminate' : ''}`}
      >
        {allSelected && (
          <svg className="multiselect-checkbox__icon" viewBox="0 0 12 12" fill="none">
            <path
              d="M2 6L5 9L10 3"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
        {isIndeterminate && (
          <svg className="multiselect-checkbox__icon" viewBox="0 0 12 12" fill="none">
            <path d="M2 6H10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        )}
      </div>
      <span className="multiselect-select-all__label">{label}</span>
    </div>
  )
}
