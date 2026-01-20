import { useMultiSelectContext } from './MultiSelectContext'
import './MultiSelect.css'

export function MultiSelectTrigger() {
  const { isOpen, committedValue, toggle, placeholder, selectedLabel } = useMultiSelectContext()

  const displayText =
    committedValue.size > 0 ? `${committedValue.size} ${selectedLabel || 'selected'}` : placeholder

  return (
    <button
      type="button"
      className={`multiselect-trigger `}
      onClick={toggle}
      aria-haspopup="listbox"
      aria-expanded={isOpen}
    >
      <span
        className={`multiselect-trigger__text ${committedValue.size === 0 ? 'multiselect-trigger__text--placeholder' : ''}`}
      >
        {displayText}
      </span>
      <svg
        className={`multiselect-trigger__icon ${isOpen ? 'multiselect-trigger__icon--open' : ''}`}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
          clipRule="evenodd"
        />
      </svg>
    </button>
  )
}
