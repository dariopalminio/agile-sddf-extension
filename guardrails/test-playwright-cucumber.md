# Guardrail: E2E Testing with Playwright + Cucumber

Applies to every BDD end-to-end suite built with `@cucumber/cucumber` + Playwright + TypeScript.
Does not apply to unit tests, component tests, or backend/API-only tests.

## Mandatory rules

### Deterministic rules (ESLint / tsc / cucumber-js)

Rule ids below are emitted as the message prefix of each `no-restricted-syntax` entry, so they are
greppable in the ESLint output. The full config is in *How to run the validation*.

#### Step definitions, hooks & Page Objects

- [ ] No `Given` / `When` / `Then` / `Before` / `After` receives an arrow function; all use `async function (this: PlaywrightWorld)` — ESLint: `bdd-no-arrow-steps` (error)
- [ ] Every step and hook annotates `this` as `PlaywrightWorld`, and the annotation type-checks — `tsc --noEmit` (error)
- [ ] No `this.page.*` access inside `Given` or `When` steps; they delegate to Page Objects — ESLint: `bdd-no-page-in-given-when` (error)
- [ ] No `this.page.*` access inside `Then` steps other than to build an assertion locator — ESLint: `bdd-prefer-page-object-in-then` (warn)
- [ ] No `expect()` call inside a `Given` or `When` step — ESLint: `bdd-no-assert-in-given-when` (error)
- [ ] No `expect()` call inside `pages/`; Page Objects perform actions or return values, they never assert — ESLint: `bdd-no-assert-in-page-object` (error)
- [ ] No module-level `let` / `var` in `step_definitions/`; scenario state lives on `this` — ESLint: `bdd-no-module-state` (error)
- [ ] `test` is never imported from `@playwright/test`; only `chromium`, `expect` and types are — ESLint: `no-restricted-imports` (error)
- [ ] No `.page` access inside `BeforeAll` / `AfterAll` (no World instance exists there) — ESLint: `bdd-no-page-in-global-hooks` (error)
- [ ] The `After` hook closes `page`, `context` and `browser` inside a `finally` block — grep (error)
- [ ] The `After` hook attaches a screenshot via `this.attach()` when the scenario failed — grep (warn)
- [ ] No step is *undefined* or *ambiguous* — `cucumber-js --dry-run` (error)

#### Configuration & secrets

- [ ] No literal `http://` or `https://` URL inside `step_definitions/`; base URL comes from `utils/config.ts` — ESLint: `bdd-no-hardcoded-url` (error)
- [ ] No credential literal in `step_definitions/`; credentials come from `utils/config.ts` + env vars — ESLint: `bdd-no-hardcoded-credentials` (error)
- [ ] Every profile in `cucumber.js` declares `publishQuiet: true` — grep (error)
- [ ] Every profile excludes work in progress with `not @wip` in its tag expression — grep (error)
- [ ] `package.json` defines `test:e2e:smoke`, `test:e2e:sanity` and `test:e2e:regression`, each selecting the `cucumber.js` profile of the same name — grep (error)
- [ ] Those profiles' tag expressions are cumulative: `@smoke`, then `@smoke or @sanity`, then `@smoke or @sanity or @regression` (`not @wip` is an acceptable superset for the last) — grep (error)
- [ ] `tsconfig` declares `"module": "commonjs"`, or `"NodeNext"` together with the `ts-node/esm` loader in ESM projects — grep (error)
- [ ] `reports/` and `*.auth.json` are git-ignored — `git check-ignore` (error)

#### Feature files & tags

- [ ] Every scenario carries at least one domain tag (`@auth`, `@checkout`, …) and one run-level tag (`@smoke`, `@sanity`, `@regression`) — grep (error)
- [ ] Every `.feature` file contains at least one `@smoke` scenario — grep (error)
- [ ] No `Background` block exceeds 3 steps — grep (warn)

#### Structure & naming

- [ ] The layout is `test/e2e/{features,step_definitions,pages,support,utils,test-data,reports}` with `cucumber.js` at the project root — glob (error)
- [ ] `step_definitions/` mirrors the folder structure of `features/` — glob (error)
- [ ] Feature and step files are kebab-case: `<feature>.feature`, `<feature>.steps.ts` — glob (error)
- [ ] Page Object file and class names match exactly and are PascalCase with a `Page` suffix: `LoginPage.ts` → `class LoginPage` — glob (warn)
- [ ] Helper modules follow `<domain>-helpers.ts` / `<entity>-builder.ts` and use named exports — glob (warn)

---

### Semantic rules (AI / human review)

- [ ] Scenarios are declarative — they state *what* the system does, never *how* the UI is driven.
- [ ] Each scenario covers exactly one business behaviour.
- [ ] Step text uses domain language: no UI details ("clicks the blue Submit button") and no technical jargon ("POST to /api/users").
- [ ] All steps of a scenario sit at the same level of abstraction; no conjunctive steps ("logs in *and* opens the profile").
- [ ] Each scenario establishes its own preconditions; no scenario depends on another having run first.
- [ ] `Scenario Outline` is used only for genuine variations of one behaviour, never to group unrelated cases.
- [ ] Test data comes from factories or named entities, never from hardcoded database IDs.
- [ ] Coverage includes the unhappy path (validation errors, API failures), not only the happy path.
- [ ] Locators follow the priority `getByRole` > `getByLabel` / `getByPlaceholder` > `getByTestId` > `getByText` > CSS/XPath, with CSS/XPath as a last resort.
- [ ] `nth()`, `first()` and `last()` appear only where the position is semantically meaningful, with the reason stated in a comment.
- [ ] The assigned run-level tag matches the real scope of the scenario: `@smoke` for the critical happy path, `@sanity` for variants and validation errors, `@regression` for edge cases, accessibility and integrations.
- [ ] Page Objects expose business actions (`login()`, `checkout()`), not one-to-one wrappers over locators.
- [ ] No credentials or personal data are committed in `.feature` files, fixtures or versioned test data.

## Minimum expected structure

```
my-project/
├── cucumber.js                       ← profiles, publishQuiet, tag expressions
├── tsconfig.json
└── test/
    └── e2e/
        ├── features/auth/login.feature
        ├── step_definitions/auth/login.steps.ts   ← mirrors features/
        ├── pages/auth/LoginPage.ts
        ├── support/{world.ts,hooks.ts}
        ├── utils/config.ts                        ← baseUrl, credentials, timeouts
        ├── test-data/auth/*.auth.json             ← git-ignored
        └── reports/                               ← git-ignored
```

```typescript
// test/e2e/step_definitions/auth/login.steps.ts
import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';        // never `test` from this package
import { PlaywrightWorld } from '@support/world';
import { LoginPage } from '@pages/auth/LoginPage';

Given('the user is on the login page', async function (this: PlaywrightWorld) {
  await new LoginPage(this.page).open();          // no this.page.* here
});

When(
  'the user logs in with {string} and {string}',
  async function (this: PlaywrightWorld, email: string, password: string) {
    await new LoginPage(this.page).login(email, password);   // action only, no expect()
  }
);

Then('the user should be redirected to the dashboard', async function (this: PlaywrightWorld) {
  await expect(this.page).toHaveURL(/dashboard/); // assertions live only in Then
});
```

```typescript
// test/e2e/support/hooks.ts — teardown must never leak a browser process
After(async function (this: PlaywrightWorld, scenario) {
  try {
    if (scenario.result?.status === Status.FAILED) {
      this.attach(await this.page.screenshot({ fullPage: true }), 'image/png');
    }
  } finally {
    await this.page?.close();
    await this.context?.close();
    await this.browser?.close();
  }
});
```

## How to run the validation

```bash
npx cucumber-js --dry-run                        # undefined / ambiguous steps
npx tsc --noEmit -p tsconfig.json                # `this: PlaywrightWorld` typing
npx eslint test/e2e                              # rules of the deterministic table

# the three run-level scripts exist and select the matching profile
node -e "const s=require('./package.json').scripts||{};['smoke','sanity','regression'].forEach(p=>{if(!(s['test:e2e:'+p]||'').includes('--profile '+p))throw Error('test:e2e:'+p)})"

# grep-level checks
grep -A4 'sanity:' cucumber.js | grep -q '@smoke or @sanity'
grep -L 'publishQuiet' cucumber.js               # must print nothing
grep -L '@smoke' test/e2e/features/**/*.feature  # must print nothing
grep -A15 'After(' test/e2e/support/hooks.ts | grep -q 'finally'
git check-ignore -q test/e2e/reports && echo "reports ignored"
```

There is no published ruleset for this domain, so the deterministic layer is defined here. Add to
the ESLint config of the project under test:

```javascript
// .eslintrc.js
module.exports = {
  overrides: [
    {
      files: ['test/e2e/step_definitions/**/*.ts', 'test/e2e/support/hooks.ts'],
      rules: {
        'no-restricted-imports': ['error', {
          paths: [{
            name: '@playwright/test',
            importNames: ['test'],
            message: 'bdd-no-playwright-runner: Cucumber is the runner. Import only chromium/expect.',
          }],
        }],
        'no-restricted-syntax': ['error',
          { selector: "CallExpression[callee.name=/^(Given|When|Then|Before|After)$/] > ArrowFunctionExpression",
            message: 'bdd-no-arrow-steps: use async function (this: PlaywrightWorld) — arrows lose the World binding.' },
          { selector: "CallExpression[callee.name=/^(Given|When)$/] MemberExpression[object.object.type='ThisExpression'][object.property.name='page']",
            message: 'bdd-no-page-in-given-when: delegate to a Page Object; pass this.page to its constructor.' },
          { selector: "CallExpression[callee.name=/^(Given|When)$/] CallExpression[callee.name='expect']",
            message: 'bdd-no-assert-in-given-when: assertions belong in Then steps.' },
          { selector: "CallExpression[callee.name=/^(BeforeAll|AfterAll)$/] MemberExpression[property.name='page']",
            message: 'bdd-no-page-in-global-hooks: no World instance exists in BeforeAll/AfterAll.' },
          { selector: "Program > VariableDeclaration[kind=/^(let|var)$/]",
            message: 'bdd-no-module-state: store scenario state on this (World), declared in the World class.' },
          { selector: "Literal[value=/^https?:\\/\\//]",
            message: 'bdd-no-hardcoded-url: read the base URL from utils/config.ts.' },
        ],
      },
    },
    {
      files: ['test/e2e/pages/**/*.ts'],
      rules: {
        'no-restricted-syntax': ['error',
          { selector: "CallExpression[callee.name='expect']",
            message: 'bdd-no-assert-in-page-object: Page Objects act or return values; assert in Then steps.' },
        ],
      },
    },
  ],
};
```

On ESLint 9+ the same blocks go into `eslint.config.mjs` as two flat-config entries, replacing each
`overrides` item's `files` + `rules` with a top-level object of the same shape.

`bdd-prefer-page-object-in-then` and `bdd-no-hardcoded-credentials` are the same mechanism at
`warn` severity; add them with the selectors
`CallExpression[callee.name='Then'] MemberExpression[object.object.type='ThisExpression'][object.property.name='page']`
and a project-specific credential pattern.

Note that `bdd-no-page-in-given-when` deliberately allows `new LoginPage(this.page)` and
`expect(this.page)` — it only forbids driving the page directly from a step.

## Verification

| Level | Action |
|-------|--------|
| Deterministic | Run the commands above; ESLint and `tsc` must report zero errors, `--dry-run` zero undefined or ambiguous steps, and every grep check must pass. |
| Semantic | Review the semantic checklist against the diff (AI or human reviewer) and attach the result to the PR. |

## Source of truth

This guardrail **summarises** the E2E BDD rules so they fit in a single pass of the harness. The
authoritative expansion — setup, Page Object templates, reporting, CI pipelines, visual regression
and accessibility testing — lives in `skills/test-playwright-cucumber/` (`SKILL.md` plus its
`references/`). Where this file and the skill disagree, the skill prevails.
