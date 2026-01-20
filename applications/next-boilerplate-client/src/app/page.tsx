'use client'

import { useCallback, useEffect, useState, useRef } from 'react'
import { useQuery, useApolloClient } from '@apollo/client'
import Image from 'next/image'
import { MultiSelect } from './components/MultiSelect'
import './page.css'
import { PURCHASES_QUERY, PRODUCTS_QUERY, USERS_QUERY } from './queries'

const PAGE_SIZE = 10

// Page size for dropdown options - load all at once
const DROPDOWN_PAGE_SIZE = 1000

// Types
interface Product {
  id: string
  name: string
  imageUrl?: string
  [key: string]: unknown
}

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  name?: string
  [key: string]: unknown
}

interface Purchase {
  id: string
  date: string
  user: User
  product: Product
}

interface PurchasesData {
  purchases: {
    nodes: Purchase[]
    pageInfo: {
      hasNextPage: boolean
      hasPreviousPage: boolean
      endCursor: string | null
      startCursor: string | null
    }
  }
}

// Page size for purchases query
const PURCHASES_PAGE_SIZE = 10

export default function HomePage() {
  // Filter state
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set())
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set())

  // Products dropdown state
  const [products, setProducts] = useState<Product[]>([])
  const [productsLoading, setProductsLoading] = useState(false)
  const [productsInitialized, setProductsInitialized] = useState(false)

  // Users dropdown state
  const [users, setUsers] = useState<Array<{ id: string; name: string }>>([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [usersInitialized, setUsersInitialized] = useState(false)

  // Apollo client for dropdown queries
  const apolloClient = useApolloClient()

  // Fetch all products (no pagination)
  const fetchProducts = useCallback(async () => {
    setProductsLoading(true)
    try {
      const result = await apolloClient.query({
        query: PRODUCTS_QUERY,
        variables: { first: DROPDOWN_PAGE_SIZE, after: null },
      })
      const data = result.data as any
      setProducts(data.products.nodes)
    } catch (error) {
      console.error('Failed to fetch products:', error)
    } finally {
      setProductsLoading(false)
    }
  }, [apolloClient])

  // Fetch all users (no pagination)
  const fetchUsers = useCallback(async () => {
    setUsersLoading(true)
    try {
      const result = await apolloClient.query({
        query: USERS_QUERY,
        variables: { first: DROPDOWN_PAGE_SIZE, after: null },
      })
      const data = result.data as any
      const formattedUsers = data.users.nodes.map((u: User) => ({
        id: u.id,
        name: `${u.firstName} ${u.lastName}`,
      }))
      setUsers(formattedUsers)
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setUsersLoading(false)
    }
  }, [apolloClient])

  // Handle products dropdown open
  const handleProductsOpen = useCallback(() => {
    if (!productsInitialized) {
      fetchProducts()
      setProductsInitialized(true)
    }
  }, [productsInitialized, fetchProducts])

  // Handle users dropdown open
  const handleUsersOpen = useCallback(() => {
    if (!usersInitialized) {
      fetchUsers()
      setUsersInitialized(true)
    }
  }, [usersInitialized, fetchUsers])

  // Clear all filters
  const handleClearFilters = useCallback(() => {
    setSelectedProducts(new Set())
    setSelectedUsers(new Set())
  }, [])

  // Query purchases with filters
  const { loading, error, data, fetchMore, networkStatus } = useQuery<PurchasesData>(
    PURCHASES_QUERY,
    {
      variables: {
        productIds: selectedProducts.size > 0 ? Array.from(selectedProducts) : undefined,
        userIds: selectedUsers.size > 0 ? Array.from(selectedUsers) : undefined,
        first: PAGE_SIZE,
      },
      notifyOnNetworkStatusChange: true,
    }
  )

  // NetworkStatus.loading = 1, NetworkStatus.fetchMore = 3
  // Only show skeleton on initial load, not during fetchMore
  const isInitialLoading = loading && networkStatus !== 3
  const purchases = data?.purchases.nodes ?? []
  const hasMorePurchases = data?.purchases.pageInfo.hasNextPage ?? false
  const purchasesCursor = data?.purchases.pageInfo.endCursor ?? null
  const hasActiveFilters = selectedProducts.size > 0 || selectedUsers.size > 0

  // Infinite scroll for purchases
  const purchasesLoaderRef = useRef<HTMLDivElement>(null)
  const [loadingMore, setLoadingMore] = useState(false)

  const loadMorePurchases = useCallback(async () => {
    if (!hasMorePurchases || loadingMore || !purchasesCursor) return

    setLoadingMore(true)
    try {
      await fetchMore({
        variables: {
          after: purchasesCursor,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prev
          return {
            purchases: {
              ...fetchMoreResult.purchases,
              nodes: [...prev.purchases.nodes, ...fetchMoreResult.purchases.nodes],
            },
          }
        },
      })
    } catch (err) {
      console.error('Failed to load more purchases:', err)
    } finally {
      setLoadingMore(false)
    }
  }, [hasMorePurchases, loadingMore, purchasesCursor, fetchMore])

  // Intersection observer for infinite scroll
  useEffect(() => {
    const loader = purchasesLoaderRef.current
    if (!loader) return

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry.isIntersecting && hasMorePurchases && !isInitialLoading && !loadingMore) {
          loadMorePurchases()
        }
      },
      { rootMargin: '200px', threshold: 0 }
    )

    observer.observe(loader)
    return () => observer.disconnect()
  }, [hasMorePurchases, isInitialLoading, loadingMore, loadMorePurchases])

  return (
    <main className="page">
      <div className="page__container">
        {/* Filters Section */}
        <section className="filters">
          <div className="filters__header">
            <h2 className="filters__title">Filters</h2>
            {hasActiveFilters && (
              <button onClick={handleClearFilters} className="filters__clear-button">
                Clear all filters
              </button>
            )}
          </div>

          <div className="filters__grid">
            {/* Products Filter */}
            <div className="filters__field">
              <label className="filters__label">Products</label>
              <MultiSelect
                options={products}
                value={selectedProducts}
                onChange={setSelectedProducts}
                idKey="id"
                labelKey="name"
                placeholder="Select Product"
                selectedLabel="Products selected"
                onOpen={handleProductsOpen}
                isLoading={productsLoading}
              >
                <MultiSelect.Trigger />
                <MultiSelect.Content>
                  <MultiSelect.Search placeholder="Search products" />
                  <MultiSelect.SelectAll label="Select all products" />
                  <MultiSelect.OptionsList
                    emptyMessage="No products found"
                    noOptionsMessage="No products available"
                  />
                  <MultiSelect.Footer />
                </MultiSelect.Content>
              </MultiSelect>
            </div>

            {/* Users Filter */}
            <div className="filters__field">
              <label className="filters__label">Users</label>
              <MultiSelect
                options={users}
                value={selectedUsers}
                onChange={setSelectedUsers}
                idKey="id"
                labelKey="name"
                placeholder="Select Users"
                selectedLabel="Users selected"
                onOpen={handleUsersOpen}
                isLoading={usersLoading}
              >
                <MultiSelect.Trigger />
                <MultiSelect.Content>
                  <MultiSelect.Search placeholder="Search users" />
                  <MultiSelect.SelectAll label="Select all users" />
                  <MultiSelect.OptionsList
                    emptyMessage="No users found"
                    noOptionsMessage="No users available"
                  />
                  <MultiSelect.Footer />
                </MultiSelect.Content>
              </MultiSelect>
            </div>
          </div>
        </section>

        {/* Error State */}
        {error && (
          <div className="error-state">
            <p className="error-state__text">Error: {error.message}</p>
          </div>
        )}

        {/* Purchases Section */}
        <section className="purchases">
          <div className="purchases__header">
            <h2 className="purchases__title">Purchases</h2>
          </div>

          <div className="purchases__grid">
            {isInitialLoading &&
              // Loading skeleton - only on initial load
              [...Array(8)].map((_, i) => (
                <div key={`skeleton-${i}`} className="skeleton-card">
                  <div className="skeleton-card__image" />
                  <div className="skeleton-card__content">
                    <div className="skeleton-card__title" />
                    <div className="skeleton-card__subtitle" />
                  </div>
                </div>
              ))}
            {!isInitialLoading && purchases.length === 0 && (
              // Empty state
              <div className="empty-state">
                <svg
                  className="empty-state__icon"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
                <h3 className="empty-state__title">No purchases found</h3>
                <p className="empty-state__description">
                  Try adjusting your filters to see more results.
                </p>
              </div>
            )}
            {!isInitialLoading &&
              purchases.length > 0 &&
              // Purchases grid
              purchases.map((purchase) => (
                <article key={purchase.id} className="purchase-card">
                  <div className="purchase-card__image-wrapper">
                    {purchase.product.imageUrl ? (
                      <Image
                        src={purchase.product.imageUrl}
                        alt={purchase.product.name}
                        className="purchase-card__image"
                        width={200}
                        height={200}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    ) : null}
                  </div>
                  <div className="purchase-card__content">
                    <h3 className="purchase-card__title">{purchase.product.name}</h3>
                    <p className="purchase-card__user">
                      {purchase.user.firstName} {purchase.user.lastName}
                    </p>
                  </div>
                </article>
              ))}
          </div>

          {/* Infinite scroll loader */}
          <div ref={purchasesLoaderRef} className="purchases__loader">
            {loadingMore && (
              <div className="purchases__loading-indicator">
                <div className="purchases__spinner" />
                <span>Loading more purchases...</span>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}
