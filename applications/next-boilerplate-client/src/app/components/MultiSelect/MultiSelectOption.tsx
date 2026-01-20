import { useMultiSelectContext } from './MultiSelectContext'
import './MultiSelect.css'
import type { BaseOption } from './types'

interface MultiSelectOptionProps {
  option: BaseOption
}

export function MultiSelectOption({ option }: MultiSelectOptionProps) {
  const { pendingValue, toggleOption } = useMultiSelectContext()

  const isSelected = pendingValue.has(option.id)

  const handleClick = () => {
    toggleOption(option.id)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      toggleOption(option.id)
    }
  }

  return (
    <li
      className={`multiselect-option ${isSelected ? 'multiselect-option--selected' : ''}`}
      role="option"
      aria-selected={isSelected}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div className={`multiselect-checkbox ${isSelected ? 'multiselect-checkbox--checked' : ''}`}>
        {isSelected && (
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
      </div>
      <span className="multiselect-option__label">{option.label}</span>
    </li>
  )
}
