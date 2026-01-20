import { useMultiSelectContext } from './MultiSelectContext'
import './MultiSelect.css'

interface MultiSelectFooterProps {
  className?: string
}

export function MultiSelectFooter({ className = '' }: MultiSelectFooterProps) {
  const { pendingValue, committedValue, apply, cancel } = useMultiSelectContext()

  // Enable apply if there are pending changes (different from committed)
  const hasChanges =
    pendingValue.size !== committedValue.size ||
    Array.from(pendingValue).some((id) => !committedValue.has(id))

  return (
    <div className={`multiselect-footer ${className}`}>
      <button
        type="button"
        className="multiselect-footer__button multiselect-footer__button--cancel"
        onClick={cancel}
      >
        Cancel
      </button>
      <button
        type="button"
        className="multiselect-footer__button multiselect-footer__button--apply"
        onClick={apply}
        disabled={!hasChanges}
      >
        Apply
      </button>
    </div>
  )
}
