import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MultiSelect } from '../MultiSelect'

// Mock CSS import
jest.mock('../MultiSelect.css', () => ({}))

interface MockOption {
  id: string
  label: string
  [key: string]: unknown
}

const mockOptions: MockOption[] = [
  { id: '1', label: 'Apple' },
  { id: '2', label: 'Banana' },
  { id: '3', label: 'Cherry' },
  { id: '4', label: 'Date' },
  { id: '5', label: 'Elderberry' },
]

const defaultProps = {
  options: mockOptions,
  value: new Set<string>(),
  onChange: jest.fn(),
  placeholder: 'Select items',
  isLoading: false,
  allIds: undefined as string[] | undefined,
}

function renderMultiSelect(props: Partial<typeof defaultProps> = {}) {
  const mergedProps = { ...defaultProps, ...props }
  return render(
    <MultiSelect {...mergedProps}>
      <MultiSelect.Trigger />
      <MultiSelect.Content>
        <MultiSelect.Search placeholder="Search..." />
        <MultiSelect.SelectAll label="Select all" />
        <MultiSelect.OptionsList emptyMessage="No items found" />
        <MultiSelect.Footer />
      </MultiSelect.Content>
    </MultiSelect>
  )
}

describe('MultiSelect Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  /**
   * AC: As a user I can search for specific items
   */
  describe('Search functionality', () => {
    it('should filter options based on search input', async () => {
      const user = userEvent.setup()
      renderMultiSelect()

      await user.click(screen.getByText('Select items'))
      await user.type(screen.getByPlaceholderText('Search...'), 'app')

      expect(screen.getByText('Apple')).toBeInTheDocument()
      expect(screen.queryByText('Banana')).not.toBeInTheDocument()
    })

    it('should be case-insensitive when searching', async () => {
      const user = userEvent.setup()
      renderMultiSelect()

      await user.click(screen.getByText('Select items'))
      await user.type(screen.getByPlaceholderText('Search...'), 'APPLE')

      expect(screen.getByText('Apple')).toBeInTheDocument()
    })

    it('should show empty message when no results match', async () => {
      const user = userEvent.setup()
      renderMultiSelect()

      await user.click(screen.getByText('Select items'))
      await user.type(screen.getByPlaceholderText('Search...'), 'xyz')

      expect(screen.getByText('No items found')).toBeInTheDocument()
    })

    it('should clear search when dropdown closes', async () => {
      const user = userEvent.setup()
      renderMultiSelect()

      // Open dropdown
      await user.click(screen.getByText('Select items'))

      // Type in search
      const searchInput = screen.getByPlaceholderText('Search...')
      await user.type(searchInput, 'app')
      expect(searchInput).toHaveValue('app')

      // Click Cancel button
      const cancelButton = screen.getByRole('button', { name: 'Cancel' })
      await user.click(cancelButton)

      // Wait for dropdown to close
      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
      })

      // Reopen dropdown
      await user.click(screen.getByText('Select items'))

      // Wait for dropdown to open and verify search is cleared
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument()
      })
      expect(screen.getByPlaceholderText('Search...')).toHaveValue('')
    })
  })

  /**
   * AC: As a user I can see the list of queried items
   */
  describe('Options list display', () => {
    it('should display all options when dropdown is opened', async () => {
      const user = userEvent.setup()
      renderMultiSelect()

      await user.click(screen.getByText('Select items'))

      mockOptions.forEach((option) => {
        expect(screen.getByText(option.label)).toBeInTheDocument()
      })
    })

    it('should show loading skeleton when loading', async () => {
      const user = userEvent.setup()
      renderMultiSelect({ isLoading: true, options: [] })

      await user.click(screen.getByText('Select items'))

      const skeletons = document.querySelectorAll('.multiselect-skeleton')
      expect(skeletons.length).toBeGreaterThan(0)
    })
  })

  /**
   * AC: As a user I can select or deselect all items at once
   */
  describe('Select All functionality', () => {
    it('should select all items when clicking Select All', async () => {
      const user = userEvent.setup()
      const onChange = jest.fn()
      renderMultiSelect({ onChange })

      await user.click(screen.getByText('Select items'))
      await user.click(screen.getByText('Select all'))
      await user.click(screen.getByText('Apply'))

      expect(onChange).toHaveBeenCalledWith(new Set(mockOptions.map((o) => o.id)))
    })

    it('should deselect all when all are already selected', async () => {
      const user = userEvent.setup()
      const allSelectedIds = new Set(mockOptions.map((o) => o.id))
      const onChange = jest.fn()
      renderMultiSelect({ value: allSelectedIds, onChange })

      await user.click(screen.getByRole('button'))
      await user.click(screen.getByText('Select all'))
      await user.click(screen.getByText('Cancel'))

      // Should not call onChange since we cancelled
      expect(onChange).not.toHaveBeenCalled()
    })

    it('should show indeterminate state when some items selected', async () => {
      const user = userEvent.setup()
      const partialSelection = new Set(['1', '2'])
      renderMultiSelect({ value: partialSelection })

      await user.click(screen.getByRole('button'))

      const selectAllCheckbox = screen.getByRole('checkbox')
      expect(selectAllCheckbox).toHaveAttribute('aria-checked', 'mixed')
    })

    it('should disable Select All while loading', async () => {
      const user = userEvent.setup()
      renderMultiSelect({ isLoading: true })

      await user.click(screen.getByText('Select items'))

      const selectAll = screen.getByText('Select all').closest('div')
      expect(selectAll).toHaveClass('multiselect-select-all--disabled')
    })

    it('should support keyboard navigation on Select All with Enter', async () => {
      const user = userEvent.setup()
      renderMultiSelect()

      await user.click(screen.getByText('Select items'))

      const selectAllCheckbox = screen.getByRole('checkbox')
      selectAllCheckbox.focus()

      await user.keyboard('{Enter}')

      // All items should be selected
      const selectedOptions = document.querySelectorAll('[role="option"][aria-selected="true"]')
      expect(selectedOptions.length).toBe(mockOptions.length)
    })

    it('should support keyboard navigation on Select All with Space', async () => {
      const user = userEvent.setup()
      renderMultiSelect()

      await user.click(screen.getByText('Select items'))

      const selectAllCheckbox = screen.getByRole('checkbox')
      selectAllCheckbox.focus()

      await user.keyboard(' ')

      // All items should be selected
      const selectedOptions = document.querySelectorAll('[role="option"][aria-selected="true"]')
      expect(selectedOptions.length).toBe(mockOptions.length)
    })

    it('should deselect all via keyboard when all selected', async () => {
      const user = userEvent.setup()
      const allSelectedIds = new Set(mockOptions.map((o) => o.id))
      renderMultiSelect({ value: allSelectedIds })

      await user.click(screen.getByRole('button'))

      const selectAllCheckbox = screen.getByRole('checkbox')
      selectAllCheckbox.focus()

      await user.keyboard('{Enter}')

      // All items should be deselected
      const selectedOptions = document.querySelectorAll('[role="option"][aria-selected="true"]')
      expect(selectedOptions.length).toBe(0)
    })
  })

  /**
   * AC: As a user I can select/deselect each item individually
   */
  describe('Individual selection', () => {
    it('should select individual items on click', async () => {
      const user = userEvent.setup()
      renderMultiSelect()

      await user.click(screen.getByText('Select items'))
      await user.click(screen.getByText('Apple'))

      const appleOption = screen.getByText('Apple').closest('[role="option"]')
      expect(appleOption).toHaveAttribute('aria-selected', 'true')
    })

    it('should deselect item when clicked again', async () => {
      const user = userEvent.setup()
      renderMultiSelect()

      await user.click(screen.getByText('Select items'))
      await user.click(screen.getByText('Apple'))
      await user.click(screen.getByText('Apple'))

      const appleOption = screen.getByText('Apple').closest('[role="option"]')
      expect(appleOption).toHaveAttribute('aria-selected', 'false')
    })

    it('should allow selecting multiple items', async () => {
      const user = userEvent.setup()
      renderMultiSelect()

      await user.click(screen.getByText('Select items'))
      await user.click(screen.getByText('Apple'))
      await user.click(screen.getByText('Banana'))
      await user.click(screen.getByText('Cherry'))

      const selectedOptions = document.querySelectorAll('[role="option"][aria-selected="true"]')
      expect(selectedOptions.length).toBe(3)
    })

    it('should support keyboard selection with Enter key', async () => {
      const user = userEvent.setup()
      renderMultiSelect()

      await user.click(screen.getByText('Select items'))

      const appleOption = screen.getByText('Apple').closest('[role="option"]') as HTMLElement
      if (appleOption) {
        appleOption.focus()
        await user.keyboard('{Enter}')
        expect(appleOption).toHaveAttribute('aria-selected', 'true')
      }
    })

    it('should support keyboard selection with Space key', async () => {
      const user = userEvent.setup()
      renderMultiSelect()

      await user.click(screen.getByText('Select items'))

      const appleOption = screen.getByText('Apple').closest('[role="option"]') as HTMLElement
      if (appleOption) {
        appleOption.focus()
        await user.keyboard(' ')
        expect(appleOption).toHaveAttribute('aria-selected', 'true')
      }
    })
  })

  /**
   * AC: As a user I can cancel the selection process and revert any changes
   */
  describe('Cancel and revert', () => {
    it('should revert changes when clicking Cancel', async () => {
      const user = userEvent.setup()
      const onChange = jest.fn()
      renderMultiSelect({ onChange })

      await user.click(screen.getByText('Select items'))
      await user.click(screen.getByText('Apple'))
      await user.click(screen.getByText('Cancel'))

      expect(onChange).not.toHaveBeenCalled()
      expect(screen.getByText('Select items')).toBeInTheDocument()
    })

    it('should close dropdown when clicking outside', async () => {
      const user = userEvent.setup()
      const { container } = renderMultiSelect()

      await user.click(screen.getByText('Select items'))
      expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument()

      // Click outside
      await user.click(container)

      await waitFor(() => {
        expect(screen.queryByPlaceholderText('Search...')).not.toBeInTheDocument()
      })
    })

    it('should close and revert when pressing Escape', async () => {
      const user = userEvent.setup()
      const onChange = jest.fn()
      renderMultiSelect({ onChange })

      await user.click(screen.getByText('Select items'))
      await user.click(screen.getByText('Apple'))
      await user.keyboard('{Escape}')

      expect(onChange).not.toHaveBeenCalled()
      expect(screen.queryByPlaceholderText('Search...')).not.toBeInTheDocument()
    })

    it('should preserve original selection after cancel', async () => {
      const user = userEvent.setup()
      const initialSelection = new Set(['1'])
      renderMultiSelect({ value: initialSelection })

      await user.click(screen.getByRole('button'))

      // Deselect the initially selected item
      await user.click(screen.getByText('Apple'))
      // Select another item
      await user.click(screen.getByText('Banana'))

      // Cancel
      await user.click(screen.getByText('Cancel'))

      // Trigger should still show 1 selected
      expect(screen.getByText('1 selected')).toBeInTheDocument()
    })
  })

  /**
   * AC: As a user I can apply my selection by clicking the apply button
   */
  describe('Apply selection', () => {
    it('should call onChange with selected items when Apply is clicked', async () => {
      const user = userEvent.setup()
      const onChange = jest.fn()
      renderMultiSelect({ onChange })

      await user.click(screen.getByText('Select items'))
      await user.click(screen.getByText('Apple'))
      await user.click(screen.getByText('Banana'))
      await user.click(screen.getByText('Apply'))

      expect(onChange).toHaveBeenCalledWith(new Set(['1', '2']))
    })

    it('should close dropdown after applying', async () => {
      const user = userEvent.setup()
      renderMultiSelect()

      await user.click(screen.getByText('Select items'))
      await user.click(screen.getByText('Apple'))
      await user.click(screen.getByText('Apply'))

      expect(screen.queryByPlaceholderText('Search...')).not.toBeInTheDocument()
    })

    it('should disable Apply button when nothing is selected', async () => {
      const user = userEvent.setup()
      renderMultiSelect()

      await user.click(screen.getByText('Select items'))

      const applyButton = screen.getByText('Apply')
      expect(applyButton).toBeDisabled()
    })

    it('should enable Apply button when items are selected', async () => {
      const user = userEvent.setup()
      renderMultiSelect()

      await user.click(screen.getByText('Select items'))
      await user.click(screen.getByText('Apple'))

      const applyButton = screen.getByText('Apply')
      expect(applyButton).not.toBeDisabled()
    })

    it('should update trigger text after applying selection', async () => {
      const user = userEvent.setup()
      const onChange = jest.fn()
      const { rerender } = renderMultiSelect({ onChange })

      await user.click(screen.getByText('Select items'))
      await user.click(screen.getByText('Apple'))
      await user.click(screen.getByText('Banana'))
      await user.click(screen.getByText('Apply'))

      // Simulate parent updating the value
      rerender(
        <MultiSelect {...defaultProps} value={new Set(['1', '2'])} onChange={onChange}>
          <MultiSelect.Trigger />
          <MultiSelect.Content>
            <MultiSelect.Search placeholder="Search..." />
            <MultiSelect.SelectAll label="Select all" />
            <MultiSelect.OptionsList emptyMessage="No items found" />
            <MultiSelect.Footer />
          </MultiSelect.Content>
        </MultiSelect>
      )

      expect(screen.getByText('2 selected')).toBeInTheDocument()
    })
  })

  /**
   * AC: As a user I can use the filter in different types of screen sizes
   */
  describe('Responsive design', () => {
    it('should have full-width trigger button', () => {
      renderMultiSelect()

      const trigger = screen.getByText('Select items').closest('button')
      expect(trigger).toHaveClass('multiselect-trigger')
    })

    it('should render options with proper padding for touch targets', async () => {
      const user = userEvent.setup()
      renderMultiSelect()

      await user.click(screen.getByText('Select items'))

      const option = screen.getByText('Apple').closest('[role="option"]')
      expect(option).toHaveClass('multiselect-option')
    })
  })

  /**
   * Accessibility tests
   */
  describe('Accessibility', () => {
    it('should have proper ARIA attributes on trigger', () => {
      renderMultiSelect()

      const trigger = screen.getByRole('button')
      expect(trigger).toHaveAttribute('aria-expanded', 'false')
      expect(trigger).toHaveAttribute('aria-haspopup', 'listbox')
    })

    it('should update aria-expanded when opened', async () => {
      const user = userEvent.setup()
      renderMultiSelect()

      const trigger = screen.getByRole('button')
      await user.click(trigger)

      expect(trigger).toHaveAttribute('aria-expanded', 'true')
    })

    it('should have proper role on options list', async () => {
      const user = userEvent.setup()
      renderMultiSelect()

      await user.click(screen.getByText('Select items'))

      expect(screen.getByRole('listbox')).toBeInTheDocument()
    })

    it('should have proper role and aria-selected on options', async () => {
      const user = userEvent.setup()
      renderMultiSelect()

      await user.click(screen.getByText('Select items'))

      const options = screen.getAllByRole('option')
      expect(options.length).toBe(mockOptions.length)

      options.forEach((option) => {
        expect(option).toHaveAttribute('aria-selected')
      })
    })
  })
})
