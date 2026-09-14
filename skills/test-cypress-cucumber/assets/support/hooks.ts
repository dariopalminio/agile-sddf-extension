import { Before, After, BeforeAll, AfterAll } from '@badeball/cypress-cucumber-preprocessor'

/**
 * Cypress + Cucumber hook template.
 *
 * This file is a starting point, not a drop-in production authentication
 * implementation. Copy it into the target project and adapt it only after
 * reviewing that project's authentication contract.
 *
 * Security contract for maintainers and automation agents:
 * - Read test credentials only from Cypress.env() or CI-managed secrets.
 * - Never hard-code credentials, tokens, real URLs, or default test accounts.
 * - Never log credentials or bearer tokens.
 * - Do not invent a login endpoint, token response shape, cookie name, or
 *   browser-storage mechanism for a target application.
 * - Do not run authenticated tests against production without explicit user
 *   authorization and a reviewed, non-destructive test account.
 * - If authentication is not configured for the target project, fail clearly
 *   instead of silently creating an unsafe or misleading session.
 */

// Runs once before all scenarios in the suite — no cy.* commands available here
BeforeAll(() => {
  // Global setup: seed database, set up test users, etc.
})

// Runs before each scenario
Before(() => {
  // Reset app state, clear cookies, etc.
  // Use cy.session() here to cache and restore authentication state
})

function authenticationSetupRequired(): never {
  throw new Error(
    '[hooks.ts] @authenticated is intentionally unconfigured. ' +
      'Implement a project-owned, reviewed test authentication helper before using this tag. ' +
      'Use Cypress.env() or CI-managed secrets, prefer server-issued Secure, HttpOnly, ' +
      'SameSite cookies when supported, and never persist bearer tokens in localStorage or sessionStorage.',
  )
}

// Tagged hook: target projects must replace this fail-closed adaptation point
// with their own reviewed authentication helper. A safe implementation can wrap
// that helper in cy.session() to reuse a server-established test session.
Before({ tags: '@authenticated' }, () => {
  authenticationSetupRequired()
})

// Runs after each scenario — screenshot on failure is handled automatically
// by screenshotOnRunFailure: true in cypress.config.ts, but you can add custom logic here
After(function () {
  // Custom teardown per scenario if needed
})

// Runs once after all scenarios in the suite — no cy.* commands available here
AfterAll(() => {
  // Global teardown: clean up test data, etc.
})
