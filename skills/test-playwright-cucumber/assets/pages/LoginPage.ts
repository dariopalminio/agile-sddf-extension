// Page Object template — locators plus business actions.
//
// Rules enforced by the guardrail:
//   - Locators are readonly and initialised in the constructor from the Page.
//   - Methods expose business actions (open(), login()), not 1-to-1 locator wrappers.
//   - No expect() here: Page Objects act or return values, steps assert.
//   - Locator priority: getByRole > getByLabel/getByPlaceholder > getByTestId > getByText > CSS.
//   - No waitForTimeout() and no networkidle — wait for a specific element.

import { type Page, type Locator } from '@playwright/test';

export class LoginPage {
  private readonly emailInput: Locator;
  private readonly passwordInput: Locator;
  private readonly submitButton: Locator;
  private readonly errorAlert: Locator;

  constructor(private readonly page: Page) {
    this.emailInput = page.getByLabel('Email');
    this.passwordInput = page.getByLabel('Password');
    this.submitButton = page.getByRole('button', { name: /log in/i });
    this.errorAlert = page.getByRole('alert');
  }

  /** Navigate to the login page and wait for it to be interactive. */
  async open(): Promise<void> {
    await this.page.goto('/login');
    await this.page.waitForLoadState('domcontentloaded');
  }

  /** Full business action: fill the form and submit it. */
  async login(email: string, password: string): Promise<void> {
    if (email) await this.emailInput.fill(email);
    if (password) await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  /** Returns a value — does not assert. The Then step performs the assertion. */
  async getErrorMessage(): Promise<string> {
    return (await this.errorAlert.textContent()) ?? '';
  }

  /** Locator for the inline validation error of a given field. */
  fieldError(field: string): Locator {
    return this.page.getByLabel(new RegExp(field, 'i'));
  }
}
