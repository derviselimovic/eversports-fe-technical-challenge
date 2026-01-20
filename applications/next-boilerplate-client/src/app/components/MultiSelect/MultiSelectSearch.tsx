import { useMultiSelectContext } from './MultiSelectContext'
import './MultiSelect.css'

interface MultiSelectSearchProps {
  placeholder?: string
  className?: string
}

export function MultiSelectSearch({
  placeholder = 'Search...',
  className = '',
}: MultiSelectSearchProps) {
  const { searchTerm, setSearchTerm, isLoading } = useMultiSelectContext()

  return (
    <div className={`multiselect-search ${className}`}>
      <div className="multiselect-search__wrapper">
        <svg
          className="multiselect-search__icon"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
            clipRule="evenodd"
          />
        </svg>
        <input
          type="text"
          className="multiselect-search__input"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          aria-label="Search options"
          disabled={isLoading}
        />
      </div>
    </div>
  )
}
