import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';        // never `test` from this package
import { PlaywrightWorld } from '../support/world';
import { LoginPage } from '../pages/LoginPage';
import { config } from '../utils/config';

// Always `async function (this: PlaywrightWorld)` — arrow functions lose the World binding.
// Given/When delegate to a Page Object; expect() appears only in Then steps.

// ── Given ─────────────────────────────────────────────────────────────────

Given('I am on the login page', async function (this: PlaywrightWorld) {
  await new LoginPage(this.page).open();
});

// ── When ──────────────────────────────────────────────────────────────────

When('I enter valid credentials', async function (this: PlaywrightWorld) {
  await new LoginPage(this.page).login(config.testUserEmail, config.testUserPassword);
});

When('I enter an invalid password', async function (this: PlaywrightWorld) {
  await new LoginPage(this.page).login(config.testUserEmail, 'wrong-password');
});

When(
  'I submit the login form with email {string} and password {string}',
  async function (this: PlaywrightWorld, email: string, password: string) {
    await new LoginPage(this.page).login(email, password);
  }
);

// ── Then ──────────────────────────────────────────────────────────────────

Then('I should be redirected to the dashboard', async function (this: PlaywrightWorld) {
  await expect(this.page).toHaveURL(/dashboard/);
});

Then('I should see my username in the header', async function (this: PlaywrightWorld) {
  await expect(this.page.getByTestId('user-menu')).toBeVisible();
});

Then(
  'I should see an error message {string}',
  async function (this: PlaywrightWorld, message: string) {
    await expect(this.page.getByRole('alert')).toContainText(message);
  }
);

Then('I should remain on the login page', async function (this: PlaywrightWorld) {
  await expect(this.page).toHaveURL(/login/);
});

Then(
  'I should see a validation error for the {string} field',
  async function (this: PlaywrightWorld, fieldName: string) {
    await expect(new LoginPage(this.page).fieldError(fieldName)).toHaveAttribute(
      'aria-invalid',
      'true'
    );
  }
);
