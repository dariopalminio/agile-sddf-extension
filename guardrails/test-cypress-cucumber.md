# Guardrail: E2E Testing with Cypress + Cucumber

Applies to every BDD end-to-end suite built with `@badeball/cypress-cucumber-preprocessor` +
Cypress + TypeScript. Does not apply to unit tests, component tests, or backend/API-only tests.

## Mandatory rules

### Deterministic rules (eslint-plugin-cypress / ESLint / tsc)

Custom rule ids below are emitted as the message prefix of each `no-restricted-syntax` entry, so
they are greppable in the ESLint output. The full config is in *How to run the validation*.

#### Step definitions & Page Objects

- [ ] No `cy.wait()` with a numeric argument; rely on retry-ability and `should()`, or wait on an intercept alias — `cypress/no-unnecessary-waiting` (error)
- [ ] Every selector constant in `pages/` targets a `data-*` attribute; never a CSS class, an id or an element tag — ESLint: `bdd-no-css-selector` (error)
- [ ] No `cy.xpath()` — `cypress/no-xpath` (error)
- [ ] No selector literal inside `step_definitions/`; selectors come from Page Object constants — ESLint: `bdd-no-inline-selector` (error)
- [ ] No `.should()` or `expect()` inside a `Given` or `When` step — ESLint: `bdd-no-assert-in-given-when` (error)
- [ ] No `.should()` or `expect()` inside `pages/`; Page Objects never assert — ESLint: `bdd-no-assert-in-page-object` (error)
- [ ] No `cy.*` call in a Page Object property initialiser — it would run at import time, before the test — ESLint: `bdd-no-cy-in-page-object-property` (error)
- [ ] `cy.*` inside a Page Object method is flagged; the preferred shape is static selector constants consumed by the step — ESLint: `bdd-prefer-static-selectors` (warn)
- [ ] No module-level `let` / `var` in `step_definitions/`; cross-step state uses `.as()` aliases — ESLint: `bdd-no-module-state` (error)
- [ ] No `cy.*` inside `BeforeAll` / `AfterAll` (Cypress commands are unavailable there) — ESLint: `bdd-no-cy-in-global-hooks` (error)
- [ ] No bare `cy.intercept()` statement; chain `.as()` whenever the request is waited on — ESLint: `bdd-intercept-requires-alias` (error)
- [ ] No `describe` / `it` / `context` / `specify` under `features/` or `step_definitions/`; keep Mocha specs in a separate directory — ESLint: `bdd-no-mocha-in-bdd` (error)
- [ ] `Given` / `When` / `Then` / `Before` / `After` are imported from `@badeball/cypress-cucumber-preprocessor`, never from `@cucumber/cucumber` — ESLint: `no-restricted-imports` (error)
- [ ] The suite type-checks — `tsc --noEmit` (error)

> Arrow functions **are correct** in Cypress step definitions: there is no `this`-bound World to
> preserve. Do not carry over the opposite rule from a Cucumber.js + Playwright suite.

#### Configuration & secrets

- [ ] `setupNodeEvents` awaits `addCucumberPreprocessorPlugin(on, config)` — grep (error)
- [ ] `setupNodeEvents` ends with `return config`; omitting it breaks the preprocessor silently — grep (error)
- [ ] `.cypress-cucumber-preprocessorrc.json`, or the `cypress-cucumber-preprocessor` key in `package.json`, declares `filterSpecs: true` and `omitFiltered: true` — grep (error)
- [ ] `specPattern` points at `test/e2e/features/**/*.feature` and `supportFile` at `test/e2e/support/e2e.ts` — grep (error)
- [ ] `package.json` defines the three run-level scripts `test:e2e:smoke`, `test:e2e:sanity` and `test:e2e:regression` — grep (error)
- [ ] Their tag expressions are cumulative: `@smoke`, then `@smoke or @sanity`, then `@smoke or @sanity or @regression` — grep (error)
- [ ] No literal `http://` or `https://` URL in `step_definitions/`; the base URL comes from `utils/config.ts` — ESLint: `bdd-no-hardcoded-url` (error)
- [ ] No credential literal in `step_definitions/`; credentials come from `utils/config.ts` via `Cypress.env()` — ESLint: `bdd-no-hardcoded-credentials` (error)
- [ ] `videos/`, `screenshots/`, `cucumber-json/`, `reports/` and `cypress.env.json` are git-ignored — `git check-ignore` (error)

#### Feature files & tags

- [ ] Every scenario carries at least one domain tag (`@auth`, `@checkout`, …) and one run-level tag (`@smoke`, `@sanity`, `@regression`) — grep (error)
- [ ] Every `.feature` file contains at least one `@smoke` scenario — grep (error)
- [ ] A `.feature` written in a language other than English declares `# language: <code>` on its first line — grep (error)
- [ ] No `Background` block exceeds 3 steps — grep (warn)

#### Structure & naming

- [ ] The layout is `test/e2e/{features,step_definitions,pages,support,utils,fixtures,reports}` with `cypress.config.ts` at the project root — glob (error)
- [ ] `step_definitions/` mirrors the folder structure of `features/` — glob (error)
- [ ] `support/e2e.ts` imports `./commands` and `./hooks` — grep (error)
- [ ] Feature and step files are kebab-case: `<feature>.feature`, `<feature>.steps.ts` — glob (error)
- [ ] Page Object file and class names match exactly, PascalCase with a `Page` suffix; component objects use the same casing without the suffix — glob (warn)

---

### Semantic rules (AI / human review)

- [ ] Scenarios are declarative — they state *what* the system does, never *how* the UI is driven.
- [ ] Each scenario covers exactly one business behaviour.
- [ ] Step text uses domain language: no UI details ("clicks the blue Submit button") and no technical jargon ("POST to /api/users").
- [ ] All steps of a scenario sit at the same level of abstraction; no conjunctive steps ("logs in *and* opens the profile").
- [ ] Each scenario establishes its own preconditions; no scenario depends on another having run first.
- [ ] `Scenario Outline` is used only for genuine variations of one behaviour, never to group unrelated cases.
- [ ] Test data comes from `cy.fixture()` or factories, never from hardcoded database IDs.
- [ ] Coverage includes the unhappy path (validation errors, intercepted API failures), not only the happy path.
- [ ] `.eq()`, `.first()` and `.last()` appear only where the position is semantically meaningful, with the reason stated in a comment.
- [ ] Repeated authentication uses `cy.session()` rather than driving the login form in every scenario; `cy.within()` scopes commands to a container instead of lengthening selectors.
- [ ] The assigned run-level tag matches the real scope of the scenario: `@smoke` for the critical happy path, `@sanity` for variants and validation errors, `@regression` for edge cases, accessibility and integrations.
- [ ] The abstraction fits the need: a Page Object for feature-bound interactions, a custom command for cross-cutting utilities (`getByTestId`), an inline assertion for a one-off check.
- [ ] Page Objects and their `data-testid` values are named after the domain, not after the current markup.
- [ ] No credentials or personal data are committed in `.feature` files, fixtures or versioned test data.

## Minimum expected structure

```
my-project/
├── cypress.config.ts                     ← specPattern, supportFile, setupNodeEvents
├── .cypress-cucumber-preprocessorrc.json ← stepDefinitions, filterSpecs, omitFiltered
├── tsconfig.json
└── test/
    └── e2e/
        ├── features/auth/login.feature
        ├── step_definitions/auth/login.steps.ts   ← mirrors features/
        ├── pages/auth/LoginPage.ts
        ├── support/{e2e.ts,commands.ts,hooks.ts}
        ├── utils/config.ts                        ← reads Cypress.env()
        ├── fixtures/                              ← cy.fixture() data
        └── reports/                               ← git-ignored
```

```typescript
// test/e2e/pages/auth/LoginPage.ts — static selectors only, no cy.* and no assertions
export class LoginPage {
  static readonly url           = '/login';
  static readonly emailInput    = "[data-testid='email-input']";
  static readonly passwordInput = "[data-testid='password-input']";
  static readonly submitButton  = "[data-testid='submit-button']";
}
```

```typescript
// test/e2e/step_definitions/auth/login.steps.ts
import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';
import { LoginPage } from '@pages/auth/LoginPage';
import { config } from '@utils/config';

Given('the user is on the login page', () => {   // arrow functions are fine here
  cy.visit(LoginPage.url);
});

When('the user submits valid credentials', () => {
  cy.get(LoginPage.emailInput).type(config.testUserEmail);
  cy.get(LoginPage.passwordInput).type(config.testUserPassword);
  cy.get(LoginPage.submitButton).click();        // action only, no assertion
});

Then('the user is redirected to the dashboard', () => {
  cy.url().should('include', '/dashboard');      // assertions live only in Then
});
```

```typescript
// cypress.config.ts — the preprocessor breaks silently without `return config`
async setupNodeEvents(on, config) {
  await addCucumberPreprocessorPlugin(on, config);
  on('file:preprocessor', createEsbuildPlugin());
  return config;
}
```

## How to run the validation

```bash
npm run test:e2e:smoke                # real execution, fast gate
npx tsc --noEmit                      # type-check
npx eslint test/e2e                   # rules of the deterministic table

# the three run-level scripts exist and their tag expressions are cumulative
node -e "const s=require('./package.json').scripts||{},w={smoke:['@smoke'],sanity:['@smoke','@sanity'],regression:['@smoke','@sanity','@regression']};for(const[k,t]of Object.entries(w)){const v=s['test:e2e:'+k];if(!v)throw Error('missing test:e2e:'+k);t.forEach(x=>{if(!v.includes(x))throw Error('test:e2e:'+k+' must include '+x)})}"

# grep-level checks
grep -q 'return config' cypress.config.ts
grep -q 'filterSpecs' .cypress-cucumber-preprocessorrc.json
grep -L '@smoke' test/e2e/features/**/*.feature   # must print nothing
git check-ignore -q test/e2e/reports && echo "reports ignored"
```

`eslint-plugin-cypress` covers the selector and waiting rules; everything else is defined here:

```javascript
// eslint.config.mjs (ESLint 10+)
import pluginCypress from 'eslint-plugin-cypress';
import tseslint from 'typescript-eslint';

const ts = { languageOptions: { parser: tseslint.parser } };
const noAssert = [
  { selector: "CallExpression[callee.property.name='should']", message: 'assert in Then steps only.' },
  { selector: "CallExpression[callee.name='expect']", message: 'assert in Then steps only.' },
];

export default [
  pluginCypress.configs.recommended,
  {
    ...ts,
    files: ['test/e2e/**/*.ts'],
    rules: { 'cypress/no-xpath': 'error' },   // absent from the recommended preset
  },
  {
    ...ts,
    files: ['test/e2e/step_definitions/**/*.ts'],
    rules: {
      'no-restricted-imports': ['error', { paths: [{
        name: '@cucumber/cucumber',
        message: 'bdd-wrong-preprocessor: import from @badeball/cypress-cucumber-preprocessor.',
      }] }],
      'no-restricted-syntax': ['error',
        ...noAssert.map(r => ({ ...r,
          selector: `CallExpression[callee.name=/^(Given|When)$/] ${r.selector}`,
          message: `bdd-no-assert-in-given-when: ${r.message}` })),
        { selector: "CallExpression[callee.property.name=/^(get|find)$/] > Literal[value=/\\[data-/]",
          message: 'bdd-no-inline-selector: import the selector constant from the Page Object.' },
        { selector: "Program > VariableDeclaration[kind=/^(let|var)$/]",
          message: 'bdd-no-module-state: share state with .as() aliases, not module variables.' },
        { selector: "ExpressionStatement > CallExpression[callee.property.name='intercept']",
          message: 'bdd-intercept-requires-alias: chain .as() so the request can be waited on.' },
        { selector: "CallExpression[callee.name=/^(describe|it|context|specify)$/]",
          message: 'bdd-no-mocha-in-bdd: keep Mocha specs out of the BDD directories.' },
        { selector: "Literal[value=/^https?:\\/\\//]",
          message: 'bdd-no-hardcoded-url: read the base URL from utils/config.ts.' },
      ],
    },
  },
  {
    ...ts,
    files: ['test/e2e/pages/**/*.ts'],
    rules: {
      'no-restricted-syntax': ['error',
        ...noAssert.map(r => ({ ...r, message: `bdd-no-assert-in-page-object: ${r.message}` })),
        { selector: "PropertyDefinition MemberExpression[object.name='cy']",
          message: 'bdd-no-cy-in-page-object-property: this would run at import time.' },
        { selector: "Literal[value=/^[.#]|^\\[(?!data-)/]",
          message: 'bdd-no-css-selector: selectors must target a data-* attribute.' },
      ],
    },
  },
  {
    ...ts,
    files: ['test/e2e/support/hooks.ts'],
    rules: {
      'no-restricted-syntax': ['error',
        { selector: "CallExpression[callee.name=/^(BeforeAll|AfterAll)$/] MemberExpression[object.name='cy']",
          message: 'bdd-no-cy-in-global-hooks: Cypress commands are unavailable in BeforeAll/AfterAll.' },
      ],
    },
  },
];
```

`bdd-prefer-static-selectors` and `bdd-no-hardcoded-credentials` are the same mechanism at `warn`
severity: add `MethodDefinition MemberExpression[object.name='cy']` under `pages/**`, and a
project-specific credential pattern under `step_definitions/**`.

Do not add `cypress/require-data-selectors`: it only accepts a `data-*` **literal** inside `cy.get()`,
so under this layering it contradicts `bdd-no-inline-selector` and flags every step. The `data-*`
mandate is enforced by `bdd-no-css-selector`, at the Page Object where the literals actually live.

`eslint-plugin-cypress` v7 requires ESLint 10 or newer. Its `recommended` preset also enables three
rules beyond what this guardrail requires — `no-assigning-return-values`, `no-async-tests` and
`unsafe-to-chain-command`. They are good Cypress hygiene, but a failure on one of them is not a
breach of a rule listed above.

## Verification

| Level | Action |
|-------|--------|
| Deterministic | Run the commands above; ESLint and `tsc` must report zero errors, the `@smoke` run must pass, and every grep check must succeed. |
| Semantic | Review the semantic checklist against the diff (AI or human reviewer) and attach the result to the PR. |

## Source of truth

This guardrail **summarises** the E2E BDD rules so they fit in a single pass of the harness. The
authoritative expansion — setup, reporting, CI pipelines, API mocking, visual regression and
accessibility testing — lives in `skills/test-cypress-cucumber/` (`SKILL.md` plus its
`references/`), which in turn defers to the `cypress-automation` skill for Page Object, selector
and intercept patterns. Where this file and the skill disagree, the skill prevails.
