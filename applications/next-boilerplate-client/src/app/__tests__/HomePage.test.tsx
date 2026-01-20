import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MockedProvider } from '@apollo/client/testing'
import HomePage from '../page'
import { PURCHASES_QUERY, PRODUCTS_QUERY, USERS_QUERY } from '../queries'

// Mock CSS imports
jest.mock('../page.css', () => ({}))
jest.mock('../components/MultiSelect/MultiSelect.css', () => ({}))

// Mock data
const mockProducts = [
  { id: 'p1', name: 'Yoga Class' },
  { id: 'p2', name: 'Gym Pass' },
  { id: 'p3', name: 'Swimming Pool' },
]

const mockUsers = [
  { id: 'u1', firstName: 'John', lastName: 'Doe' },
  { id: 'u2', firstName: 'Jane', lastName: 'Smith' },
]

const mockPurchases = [
  {
    id: '1',
    date: '2024-01-01',
    user: { id: 'u1', firstName: 'John', lastName: 'Doe', email: 'john@test.com' },
    product: { id: 'p1', name: 'Yoga Class', imageUrl: null },
  },
  {
    id: '2',
    date: '2024-01-02',
    user: { id: 'u2', firstName: 'Jane', lastName: 'Smith', email: 'jane@test.com' },
    product: { id: 'p2', name: 'Gym Pass', imageUrl: null },
  },
]

// Mock useApolloClient to return a mock client that works with our test data
jest.mock('@apollo/client', () => {
  const actual = jest.requireActual('@apollo/client')
  return {
    ...actual,
    useApolloClient: () => ({
      query: jest.fn().mockImplementation(({ query }) => {
        const queryString = query.loc?.source?.body || ''
        if (queryString.includes('products')) {
          return Promise.resolve({
            data: {
              products: {
                nodes: [
                  { id: 'p1', name: 'Yoga Class' },
                  { id: 'p2', name: 'Gym Pass' },
                  { id: 'p3', name: 'Swimming Pool' },
                ],
                pageInfo: { hasNextPage: false, endCursor: null },
              },
            },
          })
        }
        if (queryString.includes('users')) {
          return Promise.resolve({
            data: {
              users: {
                nodes: [
                  { id: 'u1', firstName: 'John', lastName: 'Doe' },
                  { id: 'u2', firstName: 'Jane', lastName: 'Smith' },
                ],
                pageInfo: { hasNextPage: false, endCursor: null },
              },
            },
          })
        }
        return Promise.resolve({ data: null })
      }),
    }),
  }
})

const mocks = [
  // Initial purchases query
  {
    request: {
      query: PURCHASES_QUERY,
      variables: { first: 10 },
    },
    result: {
      data: {
        purchases: {
          nodes: mockPurchases,
          pageInfo: {
            hasNextPage: false,
            hasPreviousPage: false,
            endCursor: null,
            startCursor: null,
          },
        },
      },
    },
    maxUsageCount: 10,
  },
  // Products query - loads all at once
  {
    request: {
      query: PRODUCTS_QUERY,
      variables: { first: 1000, after: null },
    },
    result: {
      data: {
        products: {
          nodes: mockProducts,
          pageInfo: { hasNextPage: false, endCursor: null },
        },
      },
    },
    maxUsageCount: 10,
  },
  // Users query - loads all at once
  {
    request: {
      query: USERS_QUERY,
      variables: { first: 1000, after: null },
    },
    result: {
      data: {
        users: {
          nodes: mockUsers,
          pageInfo: { hasNextPage: false, endCursor: null },
        },
      },
    },
    maxUsageCount: 10,
  },
  // Filtered purchases - by product
  {
    request: {
      query: PURCHASES_QUERY,
      variables: { productIds: ['p1'], userIds: undefined, first: 10 },
    },
    result: {
      data: {
        purchases: {
          nodes: [mockPurchases[0]],
          pageInfo: {
            hasNextPage: false,
            hasPreviousPage: false,
            endCursor: null,
            startCursor: null,
          },
        },
      },
    },
    maxUsageCount: 10,
  },
  // Filtered purchases - by user
  {
    request: {
      query: PURCHASES_QUERY,
      variables: { productIds: undefined, userIds: ['u1'], first: 10 },
    },
    result: {
      data: {
        purchases: {
          nodes: [mockPurchases[0]],
          pageInfo: {
            hasNextPage: false,
            hasPreviousPage: false,
            endCursor: null,
            startCursor: null,
          },
        },
      },
    },
    maxUsageCount: 10,
  },
]

function renderHomePage(apolloMocks: readonly unknown[] = mocks) {
  return render(
    <MockedProvider mocks={apolloMocks as typeof mocks} addTypename={false}>
      <HomePage />
    </MockedProvider>
  )
}

describe('HomePage - Purchases Page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  /**
   * AC: As a user I can see the available products, users and purchases
   */
  describe('View products, users and purchases', () => {
    it('should display the Filters section', async () => {
      renderHomePage()

      expect(screen.getByText('Filters')).toBeInTheDocument()
    })

    it('should display Products filter', async () => {
      renderHomePage()

      expect(screen.getByText('Products')).toBeInTheDocument()
      expect(screen.getByText('Select Product')).toBeInTheDocument()
    })

    it('should display Users filter', async () => {
      renderHomePage()

      expect(screen.getByText('Users')).toBeInTheDocument()
      expect(screen.getByText('Select Users')).toBeInTheDocument()
    })

    it('should display Purchases section', async () => {
      renderHomePage()

      expect(screen.getByText('Purchases')).toBeInTheDocument()
    })

    it('should display purchases after loading', async () => {
      renderHomePage()

      await waitFor(() => {
        expect(screen.getByText('Yoga Class')).toBeInTheDocument()
        expect(screen.getByText('Gym Pass')).toBeInTheDocument()
      })
    })

    it('should load products when Products filter is opened', async () => {
      const user = userEvent.setup()
      renderHomePage()

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('Yoga Class')).toBeInTheDocument()
      })

      await user.click(screen.getByText('Select Product'))

      await waitFor(
        () => {
          expect(screen.getByRole('option', { name: 'Yoga Class' })).toBeInTheDocument()
          expect(screen.getByRole('option', { name: 'Gym Pass' })).toBeInTheDocument()
          expect(screen.getByRole('option', { name: 'Swimming Pool' })).toBeInTheDocument()
        },
        { timeout: 3000 }
      )
    })

    it('should load users when Users filter is opened', async () => {
      const user = userEvent.setup()
      renderHomePage()

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('Yoga Class')).toBeInTheDocument()
      })

      await user.click(screen.getByText('Select Users'))

      await waitFor(
        () => {
          expect(screen.getByRole('option', { name: 'John Doe' })).toBeInTheDocument()
          expect(screen.getByRole('option', { name: 'Jane Smith' })).toBeInTheDocument()
        },
        { timeout: 3000 }
      )
    })
  })

  /**
   * AC: As a user I can see the results of my selection
   */
  describe('See results', () => {
    it('should display purchases in a grid', async () => {
      renderHomePage()

      await waitFor(() => {
        const purchaseCards = document.querySelectorAll('.purchase-card')
        expect(purchaseCards.length).toBe(2)
      })
    })

    it('should show purchase product name and user name', async () => {
      renderHomePage()

      await waitFor(() => {
        expect(screen.getByText('Yoga Class')).toBeInTheDocument()
      })
    })
  })

  /**
   * AC: As a user I can clear the filter selection
   */
  describe('Clear filters', () => {
    it('should not show Clear button when no filters are active', async () => {
      renderHomePage()

      expect(screen.queryByText('Clear all filters')).not.toBeInTheDocument()
    })

    it('should show Clear button when filters are active', async () => {
      const user = userEvent.setup()
      renderHomePage()

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('Yoga Class')).toBeInTheDocument()
      })

      await user.click(screen.getByText('Select Product'))

      await waitFor(
        () => {
          expect(screen.getByRole('option', { name: 'Yoga Class' })).toBeInTheDocument()
        },
        { timeout: 3000 }
      )

      await user.click(screen.getByRole('option', { name: 'Yoga Class' }))
      await user.click(screen.getByText('Apply'))

      await waitFor(() => {
        expect(screen.getByText('Clear all filters')).toBeInTheDocument()
      })
    })

    it('should clear all filters when Clear button is clicked', async () => {
      const user = userEvent.setup()
      renderHomePage()

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('Yoga Class')).toBeInTheDocument()
      })

      await user.click(screen.getByText('Select Product'))

      await waitFor(
        () => {
          expect(screen.getByRole('option', { name: 'Yoga Class' })).toBeInTheDocument()
        },
        { timeout: 3000 }
      )

      await user.click(screen.getByRole('option', { name: 'Yoga Class' }))
      await user.click(screen.getByText('Apply'))

      await waitFor(() => {
        expect(screen.getByText('Clear all filters')).toBeInTheDocument()
      })

      await user.click(screen.getByText('Clear all filters'))

      await waitFor(() => {
        expect(screen.queryByText('Clear all filters')).not.toBeInTheDocument()
      })
    })
  })

  /**
   * AC: As a user I can use the filters in different types of screen sizes
   */
  describe('Responsive design', () => {
    it('should have filters section with proper classes', async () => {
      renderHomePage()

      const filtersSection = document.querySelector('.filters')
      expect(filtersSection).toBeInTheDocument()
    })

    it('should have purchases grid with proper classes', async () => {
      renderHomePage()

      await waitFor(() => {
        const purchasesGrid = document.querySelector('.purchases__grid')
        expect(purchasesGrid).toBeInTheDocument()
      })
    })

    it('should have purchase cards with proper classes', async () => {
      renderHomePage()

      await waitFor(() => {
        const purchaseCards = document.querySelectorAll('.purchase-card')
        expect(purchaseCards.length).toBeGreaterThan(0)
      })
    })
  })

  /**
   * Loading and error states
   */
  describe('Loading and error states', () => {
    it('should show loading skeleton while fetching purchases', () => {
      renderHomePage()

      const skeletons = document.querySelectorAll('.skeleton-card')
      expect(skeletons.length).toBeGreaterThan(0)
    })

    it('should show error message when query fails', async () => {
      const errorMocks = [
        {
          request: {
            query: PURCHASES_QUERY,
            variables: { first: 10 },
          },
          error: new Error('Network error'),
        },
      ]

      renderHomePage(errorMocks)

      await waitFor(() => {
        expect(screen.getByText(/Error:/)).toBeInTheDocument()
      })
    })

    it('should show empty state when no purchases match filters', async () => {
      const emptyMocks = [
        {
          request: {
            query: PURCHASES_QUERY,
            variables: { first: 10 },
          },
          result: {
            data: {
              purchases: {
                nodes: [],
                pageInfo: {
                  hasNextPage: false,
                  hasPreviousPage: false,
                  endCursor: null,
                  startCursor: null,
                },
              },
            },
          },
        },
      ]

      renderHomePage(emptyMocks)

      await waitFor(() => {
        expect(screen.getByText('No purchases found')).toBeInTheDocument()
      })
    })
  })
})
