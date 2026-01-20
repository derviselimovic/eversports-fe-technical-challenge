/**
 * =============================================================================
 * MULTI-SELECT COMPONENT - TYPE DEFINITIONS
 * =============================================================================
 *
 * DESIGN DECISION: Generic Types
 * We use TypeScript generics to allow the component to work with any data shape.
 * Consumers specify which fields map to 'id' and 'label' via props.
 * This avoids forcing data transformation on the consumer side.
 */

/**
 * Internal normalized option format
 * All options are converted to this shape internally for consistent handling
 */
export interface BaseOption {
  id: string
  label: string
}

/**
 * Props for the root MultiSelect component
 * Generic T allows any object type - we extract id/label via key mapping
 */
export interface MultiSelectProps<T extends Record<string, unknown>> {
  /** Array of options to display */
  options: T[]

  /** Currently applied/committed selection (controlled by parent) */
  value: Set<string>

  /** Callback fired when user clicks Apply - receives new selection */
  onChange: (value: Set<string>) => void

  /**
   * Field name to use as unique identifier
   * @default 'id'
   */
  idKey?: keyof T

  /**
   * Field name to use as display label
   * @default 'label'
   */
  labelKey?: keyof T

  /**
   * Placeholder text shown when nothing is selected
   * @default 'Select items'
   */
  placeholder?: string

  /** Additional CSS classes for the root container */
  className?: string

  /** Child components (Trigger, Content, etc.) */
  children?: React.ReactNode

  /** Optional label for the selected items, shown when items are selected */
  selectedLabel?: string

  /** Optional callback fired when the dropdown is opened */
  onOpen?: () => void

  /** Optional loading state for async options */
  isLoading?: boolean
}

/**
 * Context value shared across all compound components
 * Contains both state and actions for the multi-select
 */
export interface MultiSelectContextValue {
  /** Whether the dropdown is currently open */
  isOpen: boolean

  /** Current search query string */
  searchTerm: string

  /** Pending selection value (not yet committed) */
  pendingValue: Set<string>

  /** Committed selection value (applied and saved) */
  committedValue: Set<string>

  /** All available options (normalized) */
  options: BaseOption[]

  /** Filtered options based on search and other criteria */
  filteredOptions: BaseOption[]

  /** Open dropdown and initialize draft from applied selection */
  toggle: () => void

  /** Close dropdown (used internally) */
  close: () => void

  /** Update the search query */
  setSearchTerm: (term: string) => void

  /** Toggle a single option's selection state in draft */
  toggleOption: (id: string) => void

  /** Commit draft selection to parent and close */
  apply: () => void

  /** Discard draft changes and close */
  cancel: () => void

  /**
   * Field name to use as unique identifier
   * @default 'id'
   */
  idKey: keyof any

  /**
   * Field name to use as display label
   * @default 'label'
   */
  labelKey: keyof any

  /**
   * Placeholder text shown when nothing is selected
   * @default 'Select items'
   */
  placeholder: string

  /** Optional label for the selected items, shown when items are selected */
  selectedLabel?: string

  /** Optional loading state for async options */
  isLoading?: boolean

  /** Select all options (uses allIds if available, otherwise loaded options) */
  selectAll: () => void

  /** Deselect all options */
  deselectAll: () => void

  /** Optional callback fired when the dropdown is opened */
  onOpen?: () => void
}
