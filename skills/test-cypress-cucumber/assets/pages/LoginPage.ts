// Page Object template — static data-testid selectors only.
//
// Rules enforced by the guardrail:
//   - Static readonly string constants; no cy.* in a property initialiser
//     (it would run at import time, before the test exists).
//   - Every selector targets a data-* attribute — never a CSS class, an id
//     or an element tag.
//   - No should()/expect() here: Page Objects expose selectors, steps assert.
//
// Step definitions import these constants and run the cy.* commands themselves.

export class LoginPage {
  static readonly url = '/login';

  static readonly emailInput = "[data-testid='email-input']";
  static readonly passwordInput = "[data-testid='password-input']";
  static readonly submitButton = "[data-testid='submit-button']";

  static readonly errorMessage = "[data-testid='error-message']";
  static readonly headerUsername = "[data-testid='header-username']";

  /** Inline validation error for a given form field. */
  static fieldError(field: string): string {
    return `[data-testid='${field}-error']`;
  }
}
