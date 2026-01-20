# Frontend Interview Challenge

Spent time: ~ 11h

## Tech Stack

- **Framework:** Next.js
- **Language:** TypeScript
- **Styling:** Pure CSS with CSS Variables (no frameworks)
- **Data Fetching:** Apollo Client with GraphQL
- **Testing:**
  - Jest + React Testing Library (unit/integration tests)
  - Playwright (E2E tests)
- **Code Quality:** ESLint, Prettier

## Key Features

### MultiSelect Component

A fully accessible, reusable compound component pattern implementation.

**Features:**

- Search/filter options (client-side, case-insensitive)
- Select/deselect all items at once
- Individual item selection with checkboxes
- Apply/Cancel workflow with draft state
- Click outside or Escape to cancel
- Keyboard navigation (Tab, Enter, Space, Escape)
- Loading states with skeleton UI
- Responsive design (mobile-first)

### Purchases Page

- Filter purchases by products and/or users
- Clear all filters functionality
- Responsive
- Empty state handling
- Error state handling
- Infinite scroll for pagination

---

## Repository Intro

The repository is structured as a monorepo. To get started install all dependencies in the root folder.

```sh
npm install
```

- `graphql-server`

  ### Usage

  ```sh
  npm run dev:server
  ```

  This will start a graphql-server at http://localhost:4000/.

- `next-boilerplate-client`

  ### Usage

  ```sh
  npm run dev:client
  ```

  This will start a NextJs app at http://localhost:3000/.

  ### Running Tests

  Inside `next-boilerplate-client` you can do the following:

  ```bash
  # Unit & Integration tests
  npm test

  # With coverage
  npm run test:coverage

  # E2E tests (starts dev server automatically)
  npm run test:e2e

  # Linting
  npm run lint
  npm run lint:fix

  # Formatting
  npm run format
  npm run format:check
  ```

## Technical Decisions & Assumptions

### 1. Disabled "Select all", "Search" and "Apply" while the data is fetching

**Decision:** While the filter options are being fetched, keep the "Select all", "Searcg" and "Apply" controls disabled so users cannot perform a global selection, search for not yet fetched data or submit an incomplete selection until loading finishes.

**Rationale:**

- Prevents accidental or inconsistent selections: disabling avoids selecting only the currently loaded page of options when the intent is to act on the full dataset
- Avoids race conditions and API errors: blocking actions until data settles reduces edge cases where state updates and network requests conflict
- Improves UX clarity: a disabled control plus a visible loading affordance (in our case a skeleton) communicates that the UI is not ready for that action
- Simplifies state management and accessibility: fewer ±error states to handle and clearer keyboard/screen-reader behavior while loading

### 2. Disabled "Apply" when no options in the dropdown are selected

**Decision:** While the dropdown is open, the "Apply" button remains disabled until the user has made at least one selection.

**Rationale:**

- Prevents accidental no-op submissions: users cannot click Apply when there are no changes to commit
- Provides a clear affordance: the disabled state signals that a selection is required before taking action

### 3. Client side MultiSelect search filtering

**Decision:** Perform data fetch of all available data when clicking on either of the dropdowns. The MultiSelect search filtering happens on the client side.

**Rationale:**

- Makes sense for this particular scenario because the dataset is small(300 products and 100 users)
- Faster, more responsive UI: filtering local data avoids round‑trips for each keystroke and yields instant results
- Caveat: not suitable for very large datasets

**Assumption:** The size of the dataset does not increase. We know the aproximate size of the dataset for each filter.

### 4. Compound Component Pattern

**Decision:** Used compound components (MultiSelect.Trigger, MultiSelect.Content, etc.) instead of a monolithic component.

**Rationale:**

- Flexibility: Consumers can customize layout and composition
- Separation of concerns: Each sub-component has a single responsibility
- Extensibility: Easy to add new sub-components without breaking existing usage

### 5. Styling Strategy

**Decision:** Pure CSS with CSS Variables and BEM naming convention.

**Rationale:**

- I'm more comfortable using this than tailwind
- No build-time dependencies
- Native browser support
