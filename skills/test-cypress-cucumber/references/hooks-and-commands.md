# Hooks, Shared State & Custom Commands

Managing scenario lifecycle, sharing state between steps, setup/teardown, and reusable custom commands with `@badeball/cypress-cucumber-preprocessor`.

---

## Key Differences from Playwright Cucumber

Two things work differently here, and both invert a rule from the Cucumber.js + Playwright stack:

1. **There is no browser lifecycle to manage in hooks.** Cypress launches and manages the browser automatically. Hooks are only needed for:
   - Seeding/cleaning test data via `cy.request()`
   - Setting cookies or local storage before a scenario
   - Taking screenshots on failure
   - Running tagged setup (e.g., authenticate before `@authenticated` scenarios)
2. **There is no World class.** `@badeball/cypress-cucumber-preprocessor` does not export `setWorldConstructor`/`World`; scenario state is shared with `.as()` aliases. See [Sharing State Between Steps](#sharing-state-between-steps--use-as-aliases) below.

---

## Hooks

```typescript
// test/e2e/support/hooks.ts
import { Before, After, BeforeAll, AfterAll } from '@badeball/cypress-cucumber-preprocessor';

// ── Global setup (runs once before ALL scenarios in a spec file) ───────────
BeforeAll(function () {
  // WARNING: cy.* commands are NOT available here
  // Use for: any pure JS setup that doesn't need Cypress commands
  // Note: in Cypress, BeforeAll runs once per spec file, not globally across files
});

// ── Per-scenario setup (runs before EACH scenario) ─────────────────────────
Before(function () {
  // cy.* commands ARE available here
  // Use for: clearing cookies, resetting app state, seeding data via cy.request()
  cy.clearCookies();
  cy.clearLocalStorage();
});

// ── Tagged hook — only runs before @authenticated scenarios ────────────────
Before({ tags: '@authenticated' }, function () {
  cy.setCookie('auth_token', Cypress.env('TEST_AUTH_TOKEN') || 'test-token');
  // Or use cy.session() for more complete auth state reuse:
  // cy.session('auth', () => {
  //   cy.request('POST', '/api/auth/login', { email: '...', password: '...' })
  //     .then((res) => cy.setCookie('auth_token', res.body.token));
  // });
});

// ── Tagged hook — seed data before @with-products scenarios ───────────────
Before({ tags: '@with-products' }, function () {
  cy.request('POST', `${Cypress.env('API_BASE_URL')}/api/test/seed/products`);
});

// ── Per-scenario teardown (runs after EACH scenario) ───────────────────────
After(function (scenario) {
  if (scenario.result?.status === 'FAILED') {
    // Cypress automatically takes a screenshot; this adds a named one
    cy.screenshot(`${scenario.pickle.name} - FAILED`);
  }
});

// ── Global teardown (runs once after ALL scenarios in a spec file) ─────────
AfterAll(function () {
  // WARNING: cy.* commands are NOT available here
  // Use for: pure JS cleanup after all scenarios in the spec
});
```

---

## Hook Order and Priority

When multiple `Before` hooks apply to the same scenario, use `order` to control execution sequence:

```typescript
Before({ order: 1 }, function () {
  // Runs first — clear state
  cy.clearCookies();
  cy.clearLocalStorage();
});

Before({ order: 2, tags: '@authenticated' }, function () {
  // Runs second — only for @authenticated scenarios
  cy.setCookie('auth_token', Cypress.env('TEST_AUTH_TOKEN'));
});
```

`After` hooks run in **reverse** order of definition (last defined runs first).

---

## Sharing State Between Steps — use `.as()` aliases

> **There is no World class in this stack.** Cypress runs in the browser on top
> of Mocha, and `@badeball/cypress-cucumber-preprocessor` does **not** export
> `setWorldConstructor`, `World` or `IWorldOptions` — those belong to
> Cucumber.js, the runner used with Playwright. A `support/world.ts` written
> against that API does not compile here. Share scenario state with Cypress
> **aliases** instead.

Aliases are scoped to the current test and cleared automatically between
scenarios, which is exactly the lifetime a World would have given you.

```typescript
// test/e2e/step_definitions/orders/orders.steps.ts
import { Given, Then } from '@badeball/cypress-cucumber-preprocessor';
import { config } from '@utils/config';
import { OrdersPage } from '@pages/orders/OrdersPage';

Given('the user has created an order', () => {
  cy.request('POST', `${config.apiBaseUrl}/api/orders`, {
    productId: 'prod-1',
    quantity: 1,
  })
    .its('body.id')
    .as('orderId');          // stored for later steps in this scenario
});

Then('the order appears in the history', () => {
  cy.get('@orderId').then((orderId) => {
    cy.visit(OrdersPage.url);
    cy.contains(String(orderId)).should('be.visible');
  });
});
```

Module-level `let`/`var` is **not** an alternative: it survives across scenarios
and makes tests order-dependent — see `bdd-no-module-state` in the guardrail and
`references/anti-patterns.md` (Anti-pattern 6).

Aliases work for elements, fixtures and network intercepts too:

```typescript
cy.get(LoginPage.submitButton).as('submitBtn');   // element
cy.fixture('auth/users.json').as('users');        // fixture
cy.intercept('GET', '**/api/orders').as('getOrders');   // request
cy.wait('@getOrders');
```

> Because there is no `this`-bound World, **arrow functions are correct** in
> Cypress step definitions. Do not carry over the opposite rule from a
> Cucumber.js + Playwright suite.

---

## cy.session() — Reusing Auth State

For expensive authentication flows, use `cy.session()` to cache and restore auth state across tests:

```typescript
// test/e2e/support/hooks.ts
Before({ tags: '@authenticated' }, function () {
  cy.session(
    'user-auth',
    () => {
      // This runs once; subsequent calls restore the cached session
      cy.request({
        method: 'POST',
        url: `${Cypress.env('API_BASE_URL')}/api/auth/login`,
        body: {
          email: Cypress.env('TEST_USER_EMAIL'),
          password: Cypress.env('TEST_USER_PASSWORD'),
        },
      }).then((res) => {
        cy.setCookie('auth_token', res.body.token);
      });
    },
    {
      validate() {
        // Re-authenticate if session is invalid
        cy.getCookie('auth_token').should('exist');
      },
    },
  );
});
```

---

## Custom Commands

Custom commands reduce repetition in step definitions. Define them in `test/e2e/support/commands.ts` and import them in `test/e2e/support/e2e.ts`.

### getByTestId

```typescript
Cypress.Commands.add('getByTestId', (id: string) =>
  cy.get(`[data-testid="${id}"]`)
)

// Usage in step definitions (via Page Objects):
// cy.getByTestId('submit-button').click()
```

### Custom Commands vs Page Objects

| Use Case | Correct Abstraction |
|---|---|
| Repeatable UI interactions tied to a feature (login, add to cart) | Page Object method |
| Cross-cutting Cypress utilities (`getByTestId`, `login`, `interceptApi`) | Custom Command |
| One-off assertions in a single step | Inline `cy.get().should()` in the step |

---

## BeforeAll / AfterAll Limitations

| Feature | `Before`/`After` | `BeforeAll`/`AfterAll` |
|---------|-----------------|----------------------|
| Access to `cy.*` commands | Yes | **No** |
| Runs per | Scenario | Once per spec file |
| Parallel note | Each spec file has its own lifecycle | Runs per spec file, not globally |

> For true global setup across all spec files, use `test/e2e/support/e2e.ts` or a `setupNodeEvents` task in `cypress.config.ts`.

---

## Quick Reference

| Hook | When | `cy.*` available? |
|------|------|-----------------|
| `BeforeAll` | Once before all scenarios in spec | No |
| `Before` | Before each scenario | Yes |
| `Before({ tags })` | Before matching scenarios only | Yes |
| `After` | After each scenario | Yes |
| `After({ tags })` | After matching scenarios only | Yes |
| `AfterAll` | Once after all scenarios in spec | No |
| `cy.session()` | Cache + restore auth state per test | Yes (inside session setup) |
