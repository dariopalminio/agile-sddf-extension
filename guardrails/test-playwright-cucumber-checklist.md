# Guardrail: E2E Testing with Playwright + Cucumber

Applies to every BDD end-to-end suite built with `@cucumber/cucumber` + Playwright + TypeScript.
Does not apply to unit tests, component tests, or backend/API-only tests.

*Package root* below means the root of the package that owns the E2E suite — the repository root in
a single-package project, the app package (e.g. `apps/my-apps`) in a monorepo. All paths are relative
to it.

Rule IDs: `E2E-PW-NN` — unique across this project's guardrails, immutable once published:
never renumbered, never reused.

## Mandatory rules

**On breach:** `(error)` blocks delivery — stop, name the rule id, fix it before continuing.
`(warn)` does not block — apply it, or state why you did not. A semantic rule that fails is raised
for human judgement; never resolve one silently.

### Deterministic rules (ESLint / tsc / cucumber-js)

Each `E2E-PW-NN` id enforced by a `no-restricted-syntax` or `no-restricted-imports` entry is the message prefix of that entry, so it is
greppable in the ESLint output. The full config is in *How to run the validation*.

#### Step definitions, hooks & Page Objects

- [ ] **E2E-PW-01** No `Given` / `When` / `Then` / `Before` / `After` receives an arrow function; all use `async function (this: PlaywrightWorld)` — ESLint (error)
- [ ] **E2E-PW-02** Every step and hook annotates `this` as `PlaywrightWorld`, and the annotation type-checks — `tsc --noEmit` (error)
- [ ] **E2E-PW-03** No `this.page.*` access inside `Given` or `When` steps; they delegate to Page Objects — ESLint (error)
- [ ] **E2E-PW-04** No `this.page.*` access inside `Then` steps other than to build an assertion locator — ESLint (warn)
- [ ] **E2E-PW-05** No `expect()` call inside a `Given` or `When` step — ESLint (error)
- [ ] **E2E-PW-06** No `expect()` call inside `pages/`; Page Objects perform actions or return values, they never assert — ESLint (error)
- [ ] **E2E-PW-07** No module-level `let` / `var` in `step_definitions/`; scenario state lives on `this` — ESLint (error)
- [ ] **E2E-PW-08** `test` is never imported from `@playwright/test`; only `chromium`, `expect` and types are — ESLint: `no-restricted-imports` (error)
- [ ] **E2E-PW-09** No `.page` access inside `BeforeAll` / `AfterAll` (no World instance exists there) — ESLint (error)
- [ ] **E2E-PW-10** The `After` hook closes `page`, `context` and `browser` inside a `finally` block — grep (error)
- [ ] **E2E-PW-11** The `After` hook attaches a screenshot via `this.attach()` when the scenario failed — grep (warn)
- [ ] **E2E-PW-12** No step is *undefined* or *ambiguous* — `cucumber-js --dry-run` (error)

#### Configuration & secrets

- [ ] **E2E-PW-13** No literal `http://` or `https://` URL inside `step_definitions/`; base URL comes from `utils/config.ts` — ESLint (error)
- [ ] **E2E-PW-14** No credential literal in `step_definitions/`; credentials come from `utils/config.ts` + env vars — ESLint (error)
- [ ] **E2E-PW-15** The Cucumber config file sits at the package root and is named `cucumber.js`, `cucumber.cjs` or `cucumber.mjs`, with the extension matching the host `package.json` `"type"`: a package with `"type": "module"` names a CommonJS config `.cjs` (as `.js` it would be parsed as ESM and `module.exports` would throw) — grep (error)
- [ ] **E2E-PW-16** Every profile in the Cucumber config declares `publishQuiet: true` — grep (error)
- [ ] **E2E-PW-17** Every profile excludes work in progress with `not @wip` in its tag expression — grep (error)
- [ ] **E2E-PW-18** `package.json` defines `test:e2e:smoke`, `test:e2e:sanity` and `test:e2e:regression`, each selecting the Cucumber config profile of the same name — grep (error)
- [ ] **E2E-PW-19** Those profiles' tag expressions are cumulative: `@smoke`, then `@smoke or @sanity`, then `@smoke or @sanity or @regression` (`not @wip` is an acceptable superset for the last) — grep (error)
- [ ] **E2E-PW-20** The `tsconfig` used by the suite is internally consistent with its loader: `"module": "commonjs"` with `ts-node/register` in a CommonJS package, **or** an ESM setting (`"NodeNext"` or `"ESNext"`) with the `ts-node/esm` loader in a `"type": "module"` package. A dedicated `tsconfig.cucumber.json` selected via `TS_NODE_PROJECT` is the preferred form — grep (error)
- [ ] **E2E-PW-21** `reports/` and `*.auth.json` are git-ignored — `git check-ignore` (error)

#### Feature files & tags

- [ ] **E2E-PW-22** Every scenario carries at least one domain tag (`@auth`, `@checkout`, …) and one run-level tag (`@smoke`, `@sanity`, `@regression`) — grep (error)
- [ ] **E2E-PW-23** Every `.feature` file contains at least one `@smoke` scenario — grep (error)
- [ ] **E2E-PW-24** No `Background` block exceeds 3 steps — grep (warn)

#### Structure & naming

- [ ] **E2E-PW-25** The layout is `test/e2e/{features,step_definitions,pages,support,utils,test-data,reports}` under the package root, with the Cucumber config file at that package root — glob (error)
- [ ] **E2E-PW-26** `step_definitions/` mirrors the folder structure of `features/` — glob (error)
- [ ] **E2E-PW-27** Feature and step files are kebab-case: `<feature>.feature`, `<feature>.steps.ts` — glob (error)
- [ ] **E2E-PW-28** Page Object file and class names match exactly and are PascalCase with a `Page` suffix: `LoginPage.ts` → `class LoginPage` — glob (warn)
- [ ] **E2E-PW-29** Helper modules follow `<domain>-helpers.ts` / `<entity>-builder.ts` and use named exports — glob (warn)

---

### Semantic rules (AI / human review)

- [ ] **E2E-PW-30** Scenarios are declarative — they state *what* the system does, never *how* the UI is driven.
- [ ] **E2E-PW-31** Each scenario covers exactly one business behaviour.
- [ ] **E2E-PW-32** Step text uses domain language: no UI details ("clicks the blue Submit button") and no technical jargon ("POST to /api/users").
- [ ] **E2E-PW-33** All steps of a scenario sit at the same level of abstraction; no conjunctive steps ("logs in *and* opens the profile").
- [ ] **E2E-PW-34** Each scenario establishes its own preconditions; no scenario depends on another having run first.
- [ ] **E2E-PW-35** `Scenario Outline` is used only for genuine variations of one behaviour, never to group unrelated cases.
- [ ] **E2E-PW-36** Test data comes from factories or named entities, never from hardcoded database IDs.
- [ ] **E2E-PW-37** Coverage includes the unhappy path (validation errors, API failures), not only the happy path.
- [ ] **E2E-PW-38** Locators follow the priority `getByRole` > `getByLabel` / `getByPlaceholder` > `getByTestId` > `getByText` > CSS/XPath, with CSS/XPath as a last resort.
- [ ] **E2E-PW-39** `nth()`, `first()` and `last()` appear only where the position is semantically meaningful, with the reason stated in a comment.
- [ ] **E2E-PW-40** The assigned run-level tag matches the real scope of the scenario: `@smoke` for the critical happy path, `@sanity` for variants and validation errors, `@regression` for edge cases, accessibility and integrations.
- [ ] **E2E-PW-41** Page Objects expose business actions (`login()`, `checkout()`), not one-to-one wrappers over locators.
- [ ] **E2E-PW-42** No credentials or personal data are committed in `.feature` files, fixtures or versioned test data.

## Minimum expected structure

```
<package-root>/                        ← repo root, or apps/<app>/ in a monorepo
├── package.json                      ← its "type" decides the config extension below
├── cucumber.cjs                      ← profiles, publishQuiet, tag expressions
│                                       (or .js / .mjs — must match package.json "type")
├── tsconfig.json
├── tsconfig.cucumber.json            ← optional ESM/CJS override for ts-node
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
npx eslint test/e2e                              # E2E-PW-01, E2E-PW-03 … E2E-PW-09, E2E-PW-13, E2E-PW-14 — ids appear as message prefixes

# self-defined checks — each prints its rule id followed by the breach; nothing printed = pass
fail=0
chk()  { [ -z "$2" ] || { printf 'FAIL %s\n%s\n' "$1" "$2"; fail=1; }; }
warn() { [ -z "$2" ] || printf 'WARN %s\n%s\n' "$1" "$2"; }
chk  E2E-PW-02 "$(npx tsc --noEmit -p tsconfig.json 2>&1 | grep -E 'error TS')"
chk  E2E-PW-12 "$(npx cucumber-js --dry-run 2>&1 | grep -iE 'undefined|ambiguous')"
chk  E2E-PW-10 "$(grep -A15 'After(' test/e2e/support/hooks.ts | grep -q 'finally' || echo 'After hook has no finally block')"
warn E2E-PW-11 "$(grep -A15 'After(' test/e2e/support/hooks.ts | grep -q 'this.attach' || echo 'After hook attaches no screenshot')"
# resolve the config file first, whatever its extension (E2E-PW-15)
CFG=$(ls cucumber.js cucumber.cjs cucumber.mjs 2>/dev/null | head -1)
chk  E2E-PW-15 "$([ -n "$CFG" ] || echo 'no Cucumber config at package root')"
# a "type": "module" package must not name a CommonJS config .js (E2E-PW-20)
chk  E2E-PW-20 "$(grep -q '"type"[[:space:]]*:[[:space:]]*"module"' package.json && [ "$CFG" = cucumber.js ] && echo 'rename cucumber.js to cucumber.cjs')"
chk  E2E-PW-16 "$(grep -L 'publishQuiet' "$CFG")"
chk  E2E-PW-17 "$(grep -q 'not @wip' "$CFG" || echo "$CFG excludes no @wip scenarios")"
chk  E2E-PW-18 "$(node -e "const s=require('./package.json').scripts||{};['smoke','sanity','regression'].forEach(p=>{if(!(s['test:e2e:'+p]||'').includes('--profile '+p))console.log('test:e2e:'+p+' missing or not selecting --profile '+p)})")"
chk  E2E-PW-19 "$(grep -A4 'sanity:' "$CFG" | grep -q '@smoke or @sanity' || echo 'sanity profile is not cumulative')"
chk  E2E-PW-21 "$(git check-ignore -q test/e2e/reports || echo 'test/e2e/reports is not git-ignored')"
chk  E2E-PW-23 "$(grep -L '@smoke' test/e2e/features/**/*.feature)"
exit $fail
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
            message: 'E2E-PW-08: Cucumber is the runner. Import only chromium/expect.',
          }],
        }],
        'no-restricted-syntax': ['error',
          { selector: "CallExpression[callee.name=/^(Given|When|Then|Before|After)$/] > ArrowFunctionExpression",
            message: 'E2E-PW-01: use async function (this: PlaywrightWorld) — arrows lose the World binding.' },
          { selector: "CallExpression[callee.name=/^(Given|When)$/] MemberExpression[object.object.type='ThisExpression'][object.property.name='page']",
            message: 'E2E-PW-03: delegate to a Page Object; pass this.page to its constructor.' },
          { selector: "CallExpression[callee.name=/^(Given|When)$/] CallExpression[callee.name='expect']",
            message: 'E2E-PW-05: assertions belong in Then steps.' },
          { selector: "CallExpression[callee.name=/^(BeforeAll|AfterAll)$/] MemberExpression[property.name='page']",
            message: 'E2E-PW-09: no World instance exists in BeforeAll/AfterAll.' },
          { selector: "Program > VariableDeclaration[kind=/^(let|var)$/]",
            message: 'E2E-PW-07: store scenario state on this (World), declared in the World class.' },
          { selector: "Literal[value=/^https?:\\/\\//]",
            message: 'E2E-PW-13: read the base URL from utils/config.ts.' },
        ],
      },
    },
    {
      files: ['test/e2e/pages/**/*.ts'],
      rules: {
        'no-restricted-syntax': ['error',
          { selector: "CallExpression[callee.name='expect']",
            message: 'E2E-PW-06: Page Objects act or return values; assert in Then steps.' },
        ],
      },
    },
  ],
};
```

On ESLint 9+ the same blocks go into `eslint.config.mjs` as two flat-config entries, replacing each
`overrides` item's `files` + `rules` with a top-level object of the same shape.

`E2E-PW-04` and `E2E-PW-14` are the same mechanism at
`warn` severity; add them with the selectors
`CallExpression[callee.name='Then'] MemberExpression[object.object.type='ThisExpression'][object.property.name='page']`
and a project-specific credential pattern.

Note that `E2E-PW-03` deliberately allows `new LoginPage(this.page)` and
`expect(this.page)` — it only forbids driving the page directly from a step.

## Verification

| Level | Action |
|-------|--------|
| Deterministic | Run the commands above; ESLint and `tsc` must report zero errors, `--dry-run` zero undefined or ambiguous steps, and every grep check must pass. |
| Semantic | Review the semantic checklist against the diff (AI or human reviewer), citing the `E2E-PW-NN` id of each finding, and attach the result to the PR. |

## Source of truth

This guardrail **summarises** the E2E BDD rules so they fit in a single pass of the harness. The
authoritative expansion — setup, Page Object templates, reporting, CI pipelines, visual regression
and accessibility testing — lives in `skills/test-playwright-cucumber/` (`SKILL.md` plus its
`references/`). Where this file and the skill disagree, the skill prevails.
