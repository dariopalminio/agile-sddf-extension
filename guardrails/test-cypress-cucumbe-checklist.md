# Guardrail: E2E Testing with Cypress + Cucumber

Applies to every BDD end-to-end suite built with `@badeball/cypress-cucumber-preprocessor` +
Cypress + TypeScript. Does not apply to unit tests, component tests, or backend/API-only tests.

Rule IDs: `E2E-CY-NN` — unique across this project's guardrails, immutable once published:
never renumbered, never reused.

## Mandatory rules

**On breach:** `(error)` blocks delivery — stop, name the rule id, fix it before continuing.
`(warn)` does not block — apply it, or state why you did not. A semantic rule that fails is raised
for human judgement; never resolve one silently.

### Deterministic rules (eslint-plugin-cypress / ESLint / tsc)

Each `E2E-CY-NN` id enforced by a `no-restricted-syntax` or `no-restricted-imports` entry is the message prefix of that entry, so
they are greppable in the ESLint output. The full config is in *How to run the validation*.

#### Step definitions & Page Objects

- [ ] **E2E-CY-01** No `cy.wait()` with a numeric argument; rely on retry-ability and `should()`, or wait on an intercept alias — ESLint: `cypress/no-unnecessary-waiting` (error)
- [ ] **E2E-CY-02** Every selector constant in `pages/` targets a `data-*` attribute; never a CSS class, an id or an element tag — ESLint (error)
- [ ] **E2E-CY-03** No `cy.xpath()` — ESLint: `cypress/no-xpath` (error)
- [ ] **E2E-CY-04** No selector literal inside `step_definitions/`; selectors come from Page Object constants — ESLint (error)
- [ ] **E2E-CY-05** No `.should()` or `expect()` inside a `Given` or `When` step — ESLint (error)
- [ ] **E2E-CY-06** No `.should()` or `expect()` inside `pages/`; Page Objects never assert — ESLint (error)
- [ ] **E2E-CY-07** No `cy.*` call in a Page Object property initialiser — it would run at import time, before the test — ESLint (error)
- [ ] **E2E-CY-08** `cy.*` inside a Page Object method is flagged; the preferred shape is static selector constants consumed by the step — ESLint (warn)
- [ ] **E2E-CY-09** No module-level `let` / `var` in `step_definitions/`; cross-step state uses `.as()` aliases — ESLint (error)
- [ ] **E2E-CY-10** No `cy.*` inside `BeforeAll` / `AfterAll` (Cypress commands are unavailable there) — ESLint (error)
- [ ] **E2E-CY-11** No bare `cy.intercept()` statement; chain `.as()` whenever the request is waited on — ESLint (error)
- [ ] **E2E-CY-12** No `describe` / `it` / `context` / `specify` under `features/` or `step_definitions/`; keep Mocha specs in a separate directory — ESLint (error)
- [ ] **E2E-CY-13** `Given` / `When` / `Then` / `Before` / `After` are imported from `@badeball/cypress-cucumber-preprocessor`, never from `@cucumber/cucumber` — ESLint: `no-restricted-imports` (error)
- [ ] **E2E-CY-14** The suite type-checks — `tsc --noEmit` (error)

> Arrow functions **are correct** in Cypress step definitions: there is no `this`-bound World to
> preserve. Do not carry over the opposite rule from a Cucumber.js + Playwright suite.

#### Configuration & secrets

- [ ] **E2E-CY-15** `setupNodeEvents` awaits `addCucumberPreprocessorPlugin(on, config)` — grep (error)
- [ ] **E2E-CY-16** `setupNodeEvents` ends with `return config`; omitting it breaks the preprocessor silently — grep (error)
- [ ] **E2E-CY-17** `.cypress-cucumber-preprocessorrc.json`, or the `cypress-cucumber-preprocessor` key in `package.json`, declares `filterSpecs: true` and `omitFiltered: true` — grep (error)
- [ ] **E2E-CY-18** `specPattern` points at `test/e2e/features/**/*.feature` and `supportFile` at `test/e2e/support/e2e.ts` — grep (error)
- [ ] **E2E-CY-19** `package.json` defines the three run-level scripts `test:e2e:smoke`, `test:e2e:sanity` and `test:e2e:regression` — grep (error)
- [ ] **E2E-CY-20** Their tag expressions are cumulative: `@smoke`, then `@smoke or @sanity`, then `@smoke or @sanity or @regression` — grep (error)
- [ ] **E2E-CY-21** No literal `http://` or `https://` URL in `step_definitions/`; the base URL comes from `utils/config.ts` — ESLint (error)
- [ ] **E2E-CY-22** No credential literal in `step_definitions/`; credentials come from `utils/config.ts` via `Cypress.env()` — ESLint (error)
- [ ] **E2E-CY-23** `videos/`, `screenshots/`, `cucumber-json/`, `reports/` and `cypress.env.json` are git-ignored — `git check-ignore` (error)

#### Feature files & tags

- [ ] **E2E-CY-24** Every scenario carries at least one domain tag (`@auth`, `@checkout`, …) and one run-level tag (`@smoke`, `@sanity`, `@regression`) — grep (error)
- [ ] **E2E-CY-25** Every `.feature` file contains at least one `@smoke` scenario — grep (error)
- [ ] **E2E-CY-26** A `.feature` written in a language other than English declares `# language: <code>` on its first line — grep (error)
- [ ] **E2E-CY-27** No `Background` block exceeds 3 steps — grep (warn)

#### Structure & naming

- [ ] **E2E-CY-28** The layout is `test/e2e/{features,step_definitions,pages,support,utils,fixtures,reports}` with `cypress.config.ts` at the project root — glob (error)
- [ ] **E2E-CY-29** `step_definitions/` mirrors the folder structure of `features/` — glob (error)
- [ ] **E2E-CY-30** `support/e2e.ts` imports `./commands` and `./hooks` — grep (error)
- [ ] **E2E-CY-31** Feature and step files are kebab-case: `<feature>.feature`, `<feature>.steps.ts` — glob (error)
- [ ] **E2E-CY-32** Page Object file and class names match exactly, PascalCase with a `Page` suffix; component objects use the same casing without the suffix — glob (warn)

---

### Semantic rules (AI / human review)

- [ ] **E2E-CY-33** Scenarios are declarative — they state *what* the system does, never *how* the UI is driven.
- [ ] **E2E-CY-34** Each scenario covers exactly one business behaviour.
- [ ] **E2E-CY-35** Step text uses domain language: no UI details ("clicks the blue Submit button") and no technical jargon ("POST to /api/users").
- [ ] **E2E-CY-36** All steps of a scenario sit at the same level of abstraction; no conjunctive steps ("logs in *and* opens the profile").
- [ ] **E2E-CY-37** Each scenario establishes its own preconditions; no scenario depends on another having run first.
- [ ] **E2E-CY-38** `Scenario Outline` is used only for genuine variations of one behaviour, never to group unrelated cases.
- [ ] **E2E-CY-39** Test data comes from `cy.fixture()` or factories, never from hardcoded database IDs.
- [ ] **E2E-CY-40** Coverage includes the unhappy path (validation errors, intercepted API failures), not only the happy path.
- [ ] **E2E-CY-41** `.eq()`, `.first()` and `.last()` appear only where the position is semantically meaningful, with the reason stated in a comment.
- [ ] **E2E-CY-42** Repeated authentication uses `cy.session()` rather than driving the login form in every scenario; `cy.within()` scopes commands to a container instead of lengthening selectors.
- [ ] **E2E-CY-43** The assigned run-level tag matches the real scope of the scenario: `@smoke` for the critical happy path, `@sanity` for variants and validation errors, `@regression` for edge cases, accessibility and integrations.
- [ ] **E2E-CY-44** The abstraction fits the need: a Page Object for feature-bound interactions, a custom command for cross-cutting utilities (`getByTestId`), an inline assertion for a one-off check.
- [ ] **E2E-CY-45** Page Objects and their `data-testid` values are named after the domain, not after the current markup.
- [ ] **E2E-CY-46** No credentials or personal data are committed in `.feature` files, fixtures or versioned test data.

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

Run these from the package that owns the E2E suite (in a monorepo, `cd` into it first — the
repository root only forwards the scripts it re-exports).

```bash
# e2e
pnpm test:e2e                # npm run test:e2e
# smoke testing
pnpm test:e2e:smoke          # npm run test:e2e:smoke
# sanity testing
pnpm test:e2e:sanity         # npm run test:e2e:sanity
# regression testing
pnpm test:e2e:regression     # npm run test:e2e:regression
```

```bash
npx eslint test/e2e                   # E2E-CY-01 … E2E-CY-13, E2E-CY-21, E2E-CY-22 — ids appear as message prefixes

# self-defined checks — each prints its rule id followed by the breach; nothing printed = pass
fail=0
chk() { [ -z "$2" ] || { printf 'FAIL %s\n%s\n' "$1" "$2"; fail=1; }; }
chk E2E-CY-14 "$(npx tsc --noEmit 2>&1 | grep -E 'error TS')"
chk E2E-CY-16 "$(grep -q 'return config' cypress.config.ts || echo 'setupNodeEvents does not return config')"
chk E2E-CY-17 "$(grep -q 'filterSpecs' .cypress-cucumber-preprocessorrc.json || echo 'filterSpecs is not enabled')"
# the three run-level scripts exist (E2E-CY-19) and their tag expressions are cumulative (E2E-CY-20)
chk E2E-CY-19 "$(node -e "const s=require('./package.json').scripts||{};['smoke','sanity','regression'].forEach(k=>{if(!s['test:e2e:'+k])console.log('missing test:e2e:'+k)})")"
chk E2E-CY-20 "$(node -e "const s=require('./package.json').scripts||{},w={smoke:['@smoke'],sanity:['@smoke','@sanity'],regression:['@smoke','@sanity','@regression']};for(const[k,t]of Object.entries(w)){const v=s['test:e2e:'+k]||'';t.forEach(x=>{if(!v.includes(x))console.log('test:e2e:'+k+' must include '+x)})}")"
chk E2E-CY-23 "$(git check-ignore -q test/e2e/reports || echo 'test/e2e/reports is not git-ignored')"
chk E2E-CY-25 "$(grep -L '@smoke' test/e2e/features/**/*.feature)"
exit $fail
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
        message: 'E2E-CY-13: import from @badeball/cypress-cucumber-preprocessor.',
      }] }],
      'no-restricted-syntax': ['error',
        ...noAssert.map(r => ({ ...r,
          selector: `CallExpression[callee.name=/^(Given|When)$/] ${r.selector}`,
          message: `E2E-CY-05: ${r.message}` })),
        { selector: "CallExpression[callee.property.name=/^(get|find)$/] > Literal[value=/\\[data-/]",
          message: 'E2E-CY-04: import the selector constant from the Page Object.' },
        { selector: "Program > VariableDeclaration[kind=/^(let|var)$/]",
          message: 'E2E-CY-09: share state with .as() aliases, not module variables.' },
        { selector: "ExpressionStatement > CallExpression[callee.property.name='intercept']",
          message: 'E2E-CY-11: chain .as() so the request can be waited on.' },
        { selector: "CallExpression[callee.name=/^(describe|it|context|specify)$/]",
          message: 'E2E-CY-12: keep Mocha specs out of the BDD directories.' },
        { selector: "Literal[value=/^https?:\\/\\//]",
          message: 'E2E-CY-21: read the base URL from utils/config.ts.' },
      ],
    },
  },
  {
    ...ts,
    files: ['test/e2e/pages/**/*.ts'],
    rules: {
      'no-restricted-syntax': ['error',
        ...noAssert.map(r => ({ ...r, message: `E2E-CY-06: ${r.message}` })),
        { selector: "PropertyDefinition MemberExpression[object.name='cy']",
          message: 'E2E-CY-07: this would run at import time.' },
        { selector: "Literal[value=/^[.#]|^\\[(?!data-)/]",
          message: 'E2E-CY-02: selectors must target a data-* attribute.' },
      ],
    },
  },
  {
    ...ts,
    files: ['test/e2e/support/hooks.ts'],
    rules: {
      'no-restricted-syntax': ['error',
        { selector: "CallExpression[callee.name=/^(BeforeAll|AfterAll)$/] MemberExpression[object.name='cy']",
          message: 'E2E-CY-10: Cypress commands are unavailable in BeforeAll/AfterAll.' },
      ],
    },
  },
];
```

`E2E-CY-08` and `E2E-CY-22` are the same mechanism at `warn`
severity: add `MethodDefinition MemberExpression[object.name='cy']` under `pages/**`, and a
project-specific credential pattern under `step_definitions/**`.

Do not add `cypress/require-data-selectors`: it only accepts a `data-*` **literal** inside `cy.get()`,
so under this layering it contradicts `E2E-CY-04` and flags every step. The `data-*`
mandate is enforced by `E2E-CY-02`, at the Page Object where the literals actually live.

`eslint-plugin-cypress` v7 requires ESLint 10 or newer. Its `recommended` preset also enables three
rules beyond what this guardrail requires — `no-assigning-return-values`, `no-async-tests` and
`unsafe-to-chain-command`. They are good Cypress hygiene, but a failure on one of them is not a
breach of a rule listed above.

## Verification

| Level | Action |
|-------|--------|
| Deterministic | Run the commands above; ESLint and `tsc` must report zero errors, the `@smoke` run must pass, and every grep check must succeed. |
| Semantic | Review the semantic checklist against the diff (AI or human reviewer), citing the `E2E-CY-NN` id of each finding, and attach the result to the PR. |

## Source of truth

This guardrail **summarises** the E2E BDD rules so they fit in a single pass of the harness. The
authoritative expansion — setup, reporting, CI pipelines, API mocking, visual regression and
accessibility testing — lives in `skills/test-cypress-cucumber/` (`SKILL.md` plus its
`references/`), which in turn defers to the `cypress-automation` skill for Page Object, selector
and intercept patterns. Where this file and the skill disagree, the skill prevails.
