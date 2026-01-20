import { gql } from '@apollo/client'

// Purchases query with filters and pagination
export const PURCHASES_QUERY = gql`
  query Purchases($productIds: [ID], $userIds: [ID], $first: Int, $after: String) {
    purchases(productIds: $productIds, userIds: $userIds, first: $first, after: $after) {
      nodes {
        id
        date
        user {
          id
          firstName
          lastName
          email
        }
        product {
          id
          name
          imageUrl
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        endCursor
        startCursor
      }
    }
  }
`

// Products query for dropdown
export const PRODUCTS_QUERY = gql`
  query Products($first: Int, $after: String) {
    products(first: $first, after: $after) {
      nodes {
        id
        name
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`

// Users query for dropdown
export const USERS_QUERY = gql`
  query Users($first: Int, $after: String) {
    users(first: $first, after: $after) {
      nodes {
        id
        firstName
        lastName
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`
