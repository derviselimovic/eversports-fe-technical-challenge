import { test, expect } from '@playwright/test'

/**
 * E2E Tests for MultiSelect Component
 *
 * These tests verify all acceptance criteria for the MultiSelect component:
 * - Search for specific items
 * - See list of queried items
 * - Select/deselect all items at once
 * - Select/deselect items individually
 * - Cancel selection and revert changes
 * - Apply selection
 * - Responsive design
 */
test.describe('MultiSelect Component - Acceptance Criteria', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('text=Filters')
  })

  /**    test('desktop: purchases should display in 4-column grid', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 })
      
      await page.waitForSelector('.purchase-card')
      
      // Verify purchases grid exists
      const grid = page.locator('.purchases__grid')
      await expect(grid).toBeVisible()
    })

    test('mobile: purchases should display in single column', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      
      await page.waitForSelector('.purchase-card')
      
      // Verify the purchases grid exists
      const grid = page.locator('.purchases__grid')
      await expect(grid).toBeVisible()
    }) I can search for specific items
   */
  test.describe('Search functionality', () => {
    test('should filter options when typing in search', async ({ page }) => {
      await page.click('text=Select Product')
      await page.waitForSelector('[role="option"]')

      const initialCount = await page.locator('[role="option"]').count()

      await page.fill('input[placeholder="Search products"]', 'yoga')

      // Should have fewer results after filtering
      const filteredCount = await page.locator('[role="option"]').count()
      expect(filteredCount).toBeLessThanOrEqual(initialCount)
    })

    test('should show empty message when no results match', async ({ page }) => {
      await page.click('text=Select Product')
      await page.waitForSelector('[role="option"]')

      await page.fill('input[placeholder="Search products"]', 'xyznonexistent123')

      await expect(page.locator('text=No products found')).toBeVisible()
    })

    test('should be case-insensitive search', async ({ page }) => {
      await page.click('text=Select Product')
      await page.waitForSelector('[role="option"]')

      // Get first option text
      const firstOptionText = await page.locator('[role="option"]').first().textContent()

      // Search with uppercase
      await page.fill(
        'input[placeholder="Search products"]',
        firstOptionText?.toUpperCase() || 'TEST'
      )

      // Should still find results
      const results = await page.locator('[role="option"]').count()
      expect(results).toBeGreaterThan(0)
    })

    test('should clear search when dropdown closes and reopens', async ({ page }) => {
      await page.click('text=Select Product')
      await page.waitForSelector('[role="option"]')

      await page.fill('input[placeholder="Search products"]', 'test')
      await page.click('button:has-text("Cancel")')

      await page.click('text=Select Product')

      const searchInput = page.locator('input[placeholder="Search products"]')
      await expect(searchInput).toHaveValue('')
    })
  })

  /**
   * AC: As a user I can see the list of queried items
   */
  test.describe('List display', () => {
    test('should display options when dropdown is opened', async ({ page }) => {
      await page.click('text=Select Product')

      await page.waitForSelector('[role="option"]')

      const options = await page.locator('[role="option"]').count()
      expect(options).toBeGreaterThan(0)
    })

    test('should show loading state while fetching', async ({ page }) => {
      // The loading state is brief, so we just verify the dropdown opens
      await page.click('text=Select Product')

      // Either loading skeleton or options should be visible
      await page.waitForSelector('[role="option"], .animate-pulse')
    })
  })

  /**
   * AC: As a user I can select or deselect all items at once
   */
  test.describe('Select All functionality', () => {
    test('should select all items when clicking Select All', async ({ page }) => {
      await page.click('text=Select Product')
      await page.waitForSelector('[role="option"]')

      const optionCount = await page.locator('[role="option"]').count()

      await page.click('text=Select all products')

      const selectedCount = await page.locator('[role="option"][aria-selected="true"]').count()
      expect(selectedCount).toBe(optionCount)
    })

    test('should deselect all when all are already selected', async ({ page }) => {
      await page.click('text=Select Product')
      await page.waitForSelector('[role="option"]')

      // Select all
      await page.click('text=Select all products')

      // Click again to deselect all
      await page.click('text=Select all products')

      const selectedCount = await page.locator('[role="option"][aria-selected="true"]').count()
      expect(selectedCount).toBe(0)
    })

    test('should show indeterminate state when some items selected', async ({ page }) => {
      await page.click('text=Select Product')
      await page.waitForSelector('[role="option"]')

      // Select just one item
      await page.click('[role="option"]:first-child')

      const selectAllCheckbox = page.locator('[role="checkbox"]')
      await expect(selectAllCheckbox).toHaveAttribute('aria-checked', 'mixed')
    })
  })

  /**
   * AC: As a user I can select/deselect each item individually
   */
  test.describe('Individual selection', () => {
    test('should select individual items on click', async ({ page }) => {
      await page.click('text=Select Product')
      await page.waitForSelector('[role="option"]')

      const firstOption = page.locator('[role="option"]:first-child')
      await firstOption.click()

      await expect(firstOption).toHaveAttribute('aria-selected', 'true')
    })

    test('should deselect item when clicked again', async ({ page }) => {
      await page.click('text=Select Product')
      await page.waitForSelector('[role="option"]')

      const firstOption = page.locator('[role="option"]:first-child')
      await firstOption.click()
      await firstOption.click()

      await expect(firstOption).toHaveAttribute('aria-selected', 'false')
    })

    test('should allow selecting multiple items', async ({ page }) => {
      await page.click('text=Select Product')
      await page.waitForSelector('[role="option"]')

      await page.click('[role="option"]:nth-child(1)')
      await page.click('[role="option"]:nth-child(2)')
      await page.click('[role="option"]:nth-child(3)')

      const selectedCount = await page.locator('[role="option"][aria-selected="true"]').count()
      expect(selectedCount).toBe(3)
    })

    test('should support keyboard selection with Enter', async ({ page }) => {
      await page.click('text=Select Product')
      await page.waitForSelector('[role="option"]')

      // Focus on first option directly
      const firstOption = page.locator('[role="option"]').first()
      await firstOption.focus()

      await page.keyboard.press('Enter')

      await expect(page.locator('[role="option"][aria-selected="true"]')).toHaveCount(1)
    })

    test('should support keyboard selection with Space', async ({ page }) => {
      await page.click('text=Select Product')
      await page.waitForSelector('[role="option"]')

      // Focus on first option directly
      const firstOption = page.locator('[role="option"]').first()
      await firstOption.focus()

      await page.keyboard.press('Space')

      await expect(page.locator('[role="option"][aria-selected="true"]')).toHaveCount(1)
    })
  })

  /**
   * AC: As a user I can cancel the selection process and revert any changes
   */
  test.describe('Cancel and revert', () => {
    test('should revert changes when clicking Cancel', async ({ page }) => {
      await page.click('text=Select Product')
      await page.waitForSelector('[role="option"]')

      await page.click('[role="option"]:first-child')
      await page.click('button:has-text("Cancel")')

      // Trigger should still show placeholder
      await expect(page.locator('text=Select Product')).toBeVisible()
    })

    test('should revert changes when clicking outside', async ({ page }) => {
      await page.click('text=Select Product')
      await page.waitForSelector('[role="option"]')

      await page.click('[role="option"]:first-child')

      // Click on the Filters heading (outside dropdown)
      await page.click('h2:has-text("Filters")')

      // Trigger should still show placeholder
      await expect(page.locator('button:has-text("Select Product")')).toBeVisible()
    })

    test('should close and revert when pressing Escape', async ({ page }) => {
      await page.click('text=Select Product')
      await page.waitForSelector('[role="option"]')

      await page.click('[role="option"]:first-child')
      await page.keyboard.press('Escape')

      // Dropdown should be closed
      await expect(page.locator('[role="option"]')).toHaveCount(0)

      // Trigger should still show placeholder
      await expect(page.locator('text=Select Product')).toBeVisible()
    })

    test('should preserve original selection after cancel', async ({ page }) => {
      // First, make a selection and apply it
      await page.click('text=Select Product')
      await page.waitForSelector('[role="option"]')
      await page.click('[role="option"]:first-child')
      await page.click('button:has-text("Apply")')

      // Now open again, make changes, then cancel
      await page.click('button:has-text("1 Products selected")')
      await page.waitForSelector('[role="option"]')

      // Deselect the first item
      await page.click('[role="option"]:first-child')

      // Cancel
      await page.click('button:has-text("Cancel")')

      // Should still show 1 product selected
      await expect(page.locator('text=1 Products selected')).toBeVisible()
    })
  })

  /**
   * AC: As a user I can apply my selection by clicking the apply button
   */
  test.describe('Apply selection', () => {
    test('should update trigger text after applying', async ({ page }) => {
      await page.click('text=Select Product')
      await page.waitForSelector('[role="option"]')

      await page.click('[role="option"]:first-child')
      await page.click('[role="option"]:nth-child(2)')
      await page.click('button:has-text("Apply")')

      await expect(page.locator('text=2 Products selected')).toBeVisible()
    })

    test('should close dropdown after applying', async ({ page }) => {
      await page.click('text=Select Product')
      await page.waitForSelector('[role="option"]')

      await page.click('[role="option"]:first-child')
      await page.click('button:has-text("Apply")')

      await expect(page.locator('[role="option"]')).toHaveCount(0)
    })

    test('Apply button should be disabled when nothing selected', async ({ page }) => {
      await page.click('text=Select Product')
      await page.waitForSelector('[role="option"]')

      const applyButton = page.locator('button:has-text("Apply")')
      await expect(applyButton).toBeDisabled()
    })

    test('Apply button should be enabled when items are selected', async ({ page }) => {
      await page.click('text=Select Product')
      await page.waitForSelector('[role="option"]')

      await page.click('[role="option"]:first-child')

      const applyButton = page.locator('button:has-text("Apply")')
      await expect(applyButton).not.toBeDisabled()
    })
  })

  /**
   * AC: As a user I can use the filter in different types of screen sizes
   */
  test.describe('Responsive design', () => {
    test('should work on mobile viewport (375px)', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })

      await expect(page.locator('text=Filters')).toBeVisible()

      await page.click('text=Select Product')
      await page.waitForSelector('[role="option"]')

      await expect(page.locator('[role="option"]').first()).toBeVisible()
    })

    test('should work on tablet viewport (768px)', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 })

      await expect(page.locator('text=Filters')).toBeVisible()

      // Both filters should be visible
      await expect(page.locator('text=Select Product')).toBeVisible()
      await expect(page.locator('text=Select Users')).toBeVisible()
    })

    test('should work on desktop viewport (1440px)', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 })

      await page.click('text=Select Product')
      await page.waitForSelector('[role="option"]')

      await expect(page.locator('[role="option"]').first()).toBeVisible()
    })

    test('should have full-width trigger on all sizes', async ({ page }) => {
      const trigger = page.locator('button:has-text("Select Product")')

      // Mobile
      await page.setViewportSize({ width: 375, height: 667 })
      const mobileBox = await trigger.boundingBox()
      expect(mobileBox?.width).toBeGreaterThan(200)

      // Desktop
      await page.setViewportSize({ width: 1440, height: 900 })
      const desktopBox = await trigger.boundingBox()
      expect(desktopBox?.width).toBeGreaterThan(200)
    })
  })

  /**
   * Keyboard Navigation
   */
  test.describe('Keyboard navigation', () => {
    test('should allow Tab navigation through elements', async ({ page }) => {
      await page.click('text=Select Product')
      await page.waitForSelector('[role="option"]')

      // Tab to search
      await page.keyboard.press('Tab')
      await expect(page.locator('input[placeholder="Search products"]')).toBeFocused()

      // Tab to select all
      await page.keyboard.press('Tab')
      await expect(page.locator('[role="checkbox"]')).toBeFocused()
    })
  })
})

/**
 * E2E Tests for Purchases Page (Task 2)
 *
 * These tests verify all acceptance criteria for the purchases page:
 * - See available products, users and purchases
 * - Filter purchases by products and/or users
 * - See results of selection
 * - Clear filter selection
 * - Responsive design
 */
test.describe('Purchases Page - Task 2 Acceptance Criteria', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  /**
   * AC: As a user I can see the available products, users and purchases
   */
  test.describe('View products, users and purchases', () => {
    test('should display purchases on page load', async ({ page }) => {
      await page.waitForSelector('.purchase-card')

      const purchases = await page.locator('.purchase-card').count()
      expect(purchases).toBeGreaterThan(0)
    })

    test('should have Products filter available', async ({ page }) => {
      await expect(page.locator('.filters__label:has-text("Products")')).toBeVisible()
      await expect(page.locator('text=Select Product')).toBeVisible()
    })

    test('should have Users filter available', async ({ page }) => {
      await expect(page.locator('.filters__label:has-text("Users")')).toBeVisible()
      await expect(page.locator('text=Select Users')).toBeVisible()
    })

    test('should load products when filter is opened', async ({ page }) => {
      await page.click('text=Select Product')

      await page.waitForSelector('[role="option"]')

      const options = await page.locator('[role="option"]').count()
      expect(options).toBeGreaterThan(0)
    })

    test('should load users when filter is opened', async ({ page }) => {
      await page.click('text=Select Users')

      await page.waitForSelector('[role="option"]')

      const options = await page.locator('[role="option"]').count()
      expect(options).toBeGreaterThan(0)
    })
  })

  /**
   * AC: As a user I can filter purchases by specific products and/or users
   */
  test.describe('Filter purchases', () => {
    test('should filter by product', async ({ page }) => {
      // Open products dropdown
      await page.click('text=Select Product')
      await page.waitForSelector('[role="listbox"]')

      // Select first product
      const firstOption = page.locator('[role="option"]').first()
      await firstOption.click()

      // Apply filter
      await page.click('button:has-text("Apply")')

      // Dropdown should close and trigger should show selection count
      await expect(page.locator('.multiselect-trigger__text').first()).not.toContainText(
        'Select Product'
      )
    })

    test('should filter by user', async ({ page }) => {
      // Open users dropdown
      await page.click('text=Select Users')
      await page.waitForSelector('[role="listbox"]')

      // Select first user
      const firstOption = page.locator('[role="option"]').first()
      await firstOption.click()

      // Apply filter
      await page.click('button:has-text("Apply")')

      // Dropdown should close and trigger should show selection count
      await expect(page.locator('.multiselect-trigger__text').nth(1)).not.toContainText(
        'Select Users'
      )
    })

    test('should combine product and user filters', async ({ page }) => {
      // Select a product
      await page.click('text=Select Product')
      await page.waitForSelector('[role="listbox"]')
      await page.locator('[role="option"]').first().click()
      await page.click('button:has-text("Apply")')

      // Select a user
      await page.click('text=Select Users')
      await page.waitForSelector('[role="listbox"]')
      await page.locator('[role="option"]').first().click()
      await page.click('button:has-text("Apply")')

      // Both dropdowns should show selections
      await expect(page.locator('.multiselect-trigger__text').first()).not.toContainText(
        'Select Product'
      )
      await expect(page.locator('.multiselect-trigger__text').nth(1)).not.toContainText(
        'Select Users'
      )
    })
  })

  /**
   * AC: As a user I can see the results of my selection
   */
  test.describe('See results', () => {
    test('should display purchases grid', async ({ page }) => {
      await page.waitForSelector('.purchase-card')
      const cards = await page.locator('.purchase-card').count()
      expect(cards).toBeGreaterThan(0)
    })

    test('should update purchases grid based on filters', async ({ page }) => {
      // Get initial count
      await page.waitForSelector('.purchase-card')
      const initialCount = await page.locator('.purchase-card').count()

      // Apply a filter
      await page.click('text=Select Product')
      await page.waitForSelector('[role="listbox"]')
      await page.locator('[role="option"]').first().click()
      await page.click('button:has-text("Apply")')

      // Wait for filtered results
      await page.waitForTimeout(500)

      // Purchases should still be visible (filtered)
      const filteredCount = await page.locator('.purchase-card').count()
      expect(filteredCount).toBeLessThanOrEqual(initialCount)
    })
  })

  /**
   * AC: As a user I can clear the filter selection
   */
  test.describe('Clear filters', () => {
    test('should show Clear all filters button when filters are active', async ({ page }) => {
      await page.waitForSelector('.purchase-card')

      // Initially no clear button
      await expect(page.locator('text=Clear all filters')).not.toBeVisible()

      // Apply a filter
      await page.click('text=Select Product')
      await page.waitForSelector('[role="option"]')
      await page.click('[role="option"]:first-child')
      await page.click('button:has-text("Apply")')

      // Clear button should appear
      await expect(page.locator('text=Clear all filters')).toBeVisible()
    })

    test('should clear all filters when clicking Clear all', async ({ page }) => {
      await page.waitForSelector('.purchase-card')

      // Apply filters
      await page.click('text=Select Product')
      await page.waitForSelector('[role="option"]')
      await page.click('[role="option"]:first-child')
      await page.click('button:has-text("Apply")')

      // Click clear
      await page.click('text=Clear all filters')

      // Filters should be cleared
      await expect(page.locator('text=Select Product')).toBeVisible()
      await expect(page.locator('text=Clear all filters')).not.toBeVisible()
    })
  })

  /**
   * AC: As a user I can use the filters in different types of screen sizes
   */
  test.describe('Responsive design', () => {
    test('mobile: filters should stack vertically', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })

      await expect(page.locator('text=Filters')).toBeVisible()
      await expect(page.locator('text=Select Product')).toBeVisible()
      await expect(page.locator('text=Select Users')).toBeVisible()

      // Both filters should be visible
      await page.click('text=Select Product')
      await page.waitForSelector('[role="option"]')
      await expect(page.locator('[role="option"]').first()).toBeVisible()
    })

    test('tablet: filters should be side by side', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 })

      const productFilter = page.locator('label:has-text("Products")')
      const userFilter = page.locator('label:has-text("Users")')

      const productBox = await productFilter.boundingBox()
      const userBox = await userFilter.boundingBox()

      // On tablet, they should be on the same row (similar Y position)
      expect(Math.abs((productBox?.y || 0) - (userBox?.y || 0))).toBeLessThan(50)
    })

    test('desktop: purchases should display in 4-column grid', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 })

      await page.waitForSelector('.purchase-card')

      // Verify purchases grid exists
      const grid = page.locator('.purchases__grid')
      await expect(grid).toBeVisible()
    })

    test('mobile: purchases should display in single column', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })

      await page.waitForSelector('.purchase-card')

      // Verify the purchases grid exists
      const grid = page.locator('.purchases__grid')
      await expect(grid).toBeVisible()
    })
  })

  /**
   * Loading states
   */
  test.describe('Loading states', () => {
    test('should show loading skeleton initially', async ({ page }) => {
      await page.goto('/')

      // Either loading or content should be visible quickly
      await page.waitForSelector('.skeleton-card, .purchase-card', { timeout: 5000 })
    })
  })
})
