# Step Definitions

## Basic Structure

Page Objects expose **static selector constants**; the step runs the `cy.*` commands. Selector
literals never appear in a step file (`bdd-no-inline-selector`), and neither do URLs or
credentials — those come from `utils/config.ts`.

```typescript
import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor'
import { LoginPage } from '@pages/auth/LoginPage'
import { DashboardPage } from '@pages/DashboardPage'
import { config } from '@utils/config'

Given('the user is on the login page', () => {
  cy.visit(LoginPage.url)
})

When('the user enters valid credentials', () => {
  cy.get(LoginPage.emailInput).type(config.testUserEmail)
  cy.get(LoginPage.passwordInput).type(config.testUserPassword, { log: false })
  cy.get(LoginPage.submitButton).click()
})

Then('the user is redirected to the dashboard', () => {
  cy.url().should('include', DashboardPage.url)
})
```

Arrow functions are **fine** in Cypress Cucumber — there is no `this`-based World to bind to.

`{ log: false }` keeps the password out of the runner log and the recorded video.

## Parameter Expressions

`{int}` and `{float}` are Cucumber expression names, not TypeScript types — the parameter they
produce is a `number`.

```typescript
// {string} — quoted string from Gherkin
When('the user searches for {string}', (query: string) => {
  cy.get(CatalogPage.searchInput).clear().type(`${query}{enter}`)
})

// {int} — integer
Then('the cart should contain {int} items', (count: number) => {
  cy.get(CartPage.item).should('have.length', count)
})

// {float} — decimal number
Then('the total should be {float}', (amount: number) => {
  cy.get(CartPage.total).should('contain.text', amount.toFixed(2))
})

// Regex — when expressions don't fit
Given(/^the user (?:is|has been) logged in$/, () => {
  cy.session('login', () => { /* ... */ })
})
```

## Sharing State Between Steps in a Scenario

Use **`.as()` aliases**. They are scoped to the current test and cleared automatically between scenarios, which is exactly the lifetime scenario state needs.

```typescript
When('the user places an order', () => {
  cy.request('POST', `${config.apiBaseUrl}/api/orders`, { productId: 'prod-1', quantity: 1 })
    .its('body.id')
    .as('orderId')
})

Then('the order confirmation shows the order number', () => {
  cy.get('@orderId').then((orderId) => {
    cy.get(ConfirmationPage.orderId).should('have.text', String(orderId))
  })
})
```

**Never** use a module-level `let`/`var` for this. It survives across scenarios, makes tests order-dependent, and breaks under `.only`, reordering or parallel execution — it is an ESLint **error** under `bdd-no-module-state`:

```typescript
// WRONG — module-level state, shared across every scenario in the file
let createdOrderId: string

When('the user places an order', () => {
  cy.get(CheckoutPage.placeOrderButton).click()
  cy.get(ConfirmationPage.orderId).invoke('text').then((id) => {
    createdOrderId = id
  })
})
```

Aliases work for elements, fixtures and network intercepts too:

```typescript
cy.get(LoginPage.submitButton).as('submitBtn')          // element
cy.fixture('auth/users.json').as('users')               // fixture
cy.intercept('GET', '**/api/orders').as('getOrders')    // request
cy.wait('@getOrders')
```

## DataTable Handling

```typescript
import { DataTable } from '@badeball/cypress-cucumber-preprocessor'

// hashes() — array of objects keyed by header row
Given('the following products exist:', (table: DataTable) => {
  table.hashes().forEach((row) => {
    // row = { name: 'Widget', price: '9.99', category: 'tools' }
    cy.request('POST', `${config.apiBaseUrl}/api/products`, row)
  })
})

// rows() — array of arrays (no header)
When('the user selects the following options:', (table: DataTable) => {
  table.rows().forEach(([option]) => {
    cy.get(FilterPage.optionCheckbox(option)).check()
  })
})

// rowsHash() — two-column table as key/value map
Given('the user profile has:', (table: DataTable) => {
  const data = table.rowsHash()
  // data = { name: 'Alice', role: 'admin' }
  cy.get(ProfilePage.nameInput).clear().type(data['name'])
  cy.get(ProfilePage.roleSelect).select(data['role'])
})
```

## Step Reuse Across Features

Place shared steps in `test/e2e/step_definitions/shared/`:

```typescript
// test/e2e/step_definitions/shared/navigation.steps.ts
import { Given } from '@badeball/cypress-cucumber-preprocessor'

Given('the user navigates to {string}', (path: string) => {
  cy.visit(path)
})

Given('the page has loaded', () => {
  cy.get('body').should('be.visible')
})
```

These are automatically discovered and available in all feature files.
