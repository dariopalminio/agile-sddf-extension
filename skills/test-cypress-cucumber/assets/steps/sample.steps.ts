import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor'
import { LoginPage } from '../pages/LoginPage'
import { config } from '../utils/config'

// Arrow functions are correct here: Cypress has no `this`-bound World.
// Selectors come from the Page Object — never inline literals in a step.
// Assertions live only in Then steps.

// ── Given ────────────────────────────────────────────────────────────────────

Given('el usuario está en la página de inicio de sesión', () => {
  cy.visit(LoginPage.url)
})

// ── When ─────────────────────────────────────────────────────────────────────

When('el usuario ingresa credenciales válidas', () => {
  cy.get(LoginPage.emailInput).type(config.testUserEmail)
  cy.get(LoginPage.passwordInput).type(config.testUserPassword, { log: false })
  cy.get(LoginPage.submitButton).click()
})

When('el usuario ingresa una contraseña incorrecta', () => {
  cy.get(LoginPage.emailInput).type(config.testUserEmail)
  cy.get(LoginPage.passwordInput).type('contraseña-incorrecta', { log: false })
  cy.get(LoginPage.submitButton).click()
})

When(
  'el usuario envía el formulario con email {string} y contraseña {string}',
  (email: string, password: string) => {
    if (email) cy.get(LoginPage.emailInput).type(email)
    if (password) cy.get(LoginPage.passwordInput).type(password, { log: false })
    cy.get(LoginPage.submitButton).click()
  },
)

// ── Then ─────────────────────────────────────────────────────────────────────

Then('debería ser redirigido al panel de control', () => {
  cy.url().should('include', '/dashboard')
})

Then('debería ver su nombre de usuario en el encabezado', () => {
  cy.get(LoginPage.headerUsername).should('be.visible')
})

Then('debería ver el mensaje de error {string}', (message: string) => {
  cy.get(LoginPage.errorMessage).should('contain.text', message)
})

Then('debería permanecer en la página de inicio de sesión', () => {
  cy.url().should('include', LoginPage.url)
})

Then('debería ver un error de validación para el campo {string}', (field: string) => {
  cy.get(LoginPage.fieldError(field)).should('be.visible')
})
