# Guardrail: React Component Testing with Vitest + Testing Library

Applies to every React component and hook test built with Vitest + `@testing-library/react` +
happy-dom + axe-core (`*.test.tsx` and `*.test-d.ts`). Does not apply to pure unit tests without
React, backend or integration tests, or browser-level E2E suites.

## Mandatory rules

**On breach:** `(error)` blocks delivery — stop, name the rule id, fix it before continuing.
`(warn)` does not block — apply it, or state why you did not. A semantic rule that fails is raised
for human judgement; never resolve one silently.

### Deterministic rules (eslint-plugin-testing-library / eslint-plugin-jest-dom / Vitest / tsc)

The `flat/react` preset leaves several of the rules below disabled; they are declared explicitly in
the config of *How to run the validation*. Rule ids are the plugin's own, so they appear verbatim in
the ESLint output.

#### Queries & assertions

- [ ] Every query goes through `screen`, never through the object returned by `render()` — testing-library: `prefer-screen-queries` (error)
- [ ] Async queries (`findBy*`, `findAllBy*`) are awaited — testing-library: `await-async-queries` (error)
- [ ] `user-event` API calls are awaited — testing-library: `await-async-events` (error)
- [ ] Synchronous queries (`getBy*`, `queryBy*`) are not awaited — testing-library: `no-await-sync-queries` (error)
- [ ] An element that appears asynchronously is fetched with `findBy*`, not `waitFor` wrapping a `getBy*` — testing-library: `prefer-find-by` (error)
- [ ] Presence assertions use `getBy*`, absence assertions use `queryBy*` — testing-library: `prefer-presence-queries` (error)
- [ ] `waitForElementToBeRemoved` receives a `queryBy*` callback, so it does not throw before waiting — testing-library: `prefer-query-by-disappearance` (error)
- [ ] Text matchers carry no global `/g` flag; a stateful regex silently skips matches — testing-library: `no-global-regexp-flag-in-query` (error)

#### Implementation details

- [ ] No querying through `container` returned by `render()` — testing-library: `no-container` (error)
- [ ] No direct DOM traversal (`querySelector`, `firstChild`, `parentElement`) — testing-library: `no-node-access` (error)
- [ ] Interactions use `@testing-library/user-event`, not `fireEvent` — testing-library: `prefer-user-event` (error)
- [ ] Each test creates its own instance with `userEvent.setup()` before interacting — testing-library: `prefer-user-event-setup` (error)
- [ ] `getByTestId` is a documented last resort, reported so its use stays visible in review — testing-library: `no-test-id-queries` (warn)
- [ ] Utilities are imported from `@testing-library/react`, never from `@testing-library/dom` — testing-library: `no-dom-import` (error)
- [ ] The `render()` result is named `view` or destructured, never `wrapper` or `component` — testing-library: `render-result-naming-convention` (error)
- [ ] No manual `cleanup()` call; Vitest with `globals: true` runs it automatically — testing-library: `no-manual-cleanup` (error)

> `getByTestId` is a permitted escape hatch here, and the accessible queries come first. Do not
> carry over the `data-*`-mandatory rule from the Cypress guardrail: Cypress drives a browser with
> no accessibility tree to query, this suite has one.

#### Async & act discipline

- [ ] No `act()` around Testing Library utilities, which already wrap their own updates — testing-library: `no-unnecessary-act` (error)
- [ ] A `waitFor` callback holds exactly one assertion — testing-library: `no-wait-for-multiple-assertions` (error)
- [ ] A `waitFor` callback contains no side effect (render, user event, mock setup) — testing-library: `no-wait-for-side-effects` (error)
- [ ] No snapshot assertion inside `waitFor` — testing-library: `no-wait-for-snapshot` (error)
- [ ] `waitFor` and `waitForElementToBeRemoved` are awaited — testing-library: `await-async-utils` (error)
- [ ] No promise passed to `fireEvent` — testing-library: `no-promise-in-fire-event` (error)
- [ ] `render()` is called inside the test, never in `beforeEach` or another lifecycle hook — testing-library: `no-render-in-lifecycle` (error)
- [ ] No `screen.debug()`, `prettyDOM()` or `logRoles()` left in a committed test — testing-library: `no-debugging-utils` (error)

#### jest-dom matchers

- [ ] Existence is asserted with `toBeInTheDocument()`, not with `toBeNull` / `toHaveLength` on a query — jest-dom: `prefer-in-document` (error)
- [ ] Checked state uses `toBeChecked()` — jest-dom: `prefer-checked` (error)
- [ ] Disabled state uses `toBeEnabled()` / `toBeDisabled()` — jest-dom: `prefer-enabled-disabled` (error)
- [ ] Focus uses `toHaveFocus()` — jest-dom: `prefer-focus` (error)
- [ ] Attributes use `toHaveAttribute()` — jest-dom: `prefer-to-have-attribute` (error)
- [ ] Text content uses `toHaveTextContent()` — jest-dom: `prefer-to-have-text-content` (error)

#### Project configuration & layout

- [ ] `vitest.config.ts` declares `environment: 'happy-dom'` — grep (error)
- [ ] `vitest.config.ts` declares `globals: true`, which is what enables RTL auto-cleanup — grep (error)
- [ ] The setup file imports `@testing-library/jest-dom/vitest`; the bare entry point does not register the matchers on Vitest's `expect` — grep (error)
- [ ] Component tests are co-located with the component they test and named `*.test.tsx`; type-level tests are named `*.test-d.ts(x)` — glob (error)
- [ ] The suite type-checks — `tsc --noEmit` (error)
- [ ] `vitest.config.ts` declares coverage thresholds — grep (warn)

---

### Semantic rules (AI / human review)

- [ ] Tests assert what the user sees and does; never internal state, internal methods, lifecycle or a child component's internals.
- [ ] The query priority is genuinely respected: role, label and text first, `alt`/`title` second, and every `getByTestId` states in a comment why no accessible query reaches the element.
- [ ] Each `describe` names the component under test, and each test states the behaviour in "given …, should …" prose.
- [ ] Props come from a per-component factory with sensible defaults; each test overrides only the field it exercises.
- [ ] Test data is realistic (faker, cuid2 or an existing factory), never a hardcoded database id.
- [ ] Coverage includes the unhappy path — validation errors, rejected requests, empty and loading states — not only the happy path.
- [ ] Providers the component needs come from the shared `test-utils` render wrapper rather than being redeclared per file.
- [ ] axe runs against a settled DOM, after loading has finished; a violation is fixed or documented with its reasoning, never silenced with a blanket disable.
- [ ] Accessibility coverage extends beyond the default state to the interactive flows (opened dialog, submitted form, error state).
- [ ] `jsdom` is selected per file only where happy-dom lacks the browser API in question, with the reason stated; happy-dom stays the default.
- [ ] Type-level tests target the public API — exported unions, props interfaces, ref types — not internal implementation types.
- [ ] Mocks replace collaborators at the module boundary; the behaviour under test is never mocked away.
- [ ] No credentials or personal data are committed in fixtures, factories or test data.

## Minimum expected structure

```
my-app/
├── vitest.config.ts                    ← happy-dom, globals, setupFiles, coverage
├── vitest.setup.ts                     ← jest-dom/vitest + configure()
├── eslint.config.mjs
└── src/
    ├── test/test-utils.tsx             ← render wrapped in the app providers
    └── components/Button/
        ├── Button.tsx
        ├── Button.test.tsx             ← behaviour, co-located
        └── Button.test-d.ts            ← types, vitest typecheck
```

```typescript
// vitest.config.ts — globals: true is what gives RTL its automatic cleanup
export default defineConfig({
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./vitest.setup.ts'],
    typecheck: { enabled: true },
    coverage: { provider: 'v8', thresholds: { lines: 80, functions: 80, branches: 75 } },
  },
});

// vitest.setup.ts — the /vitest entry point, not '@testing-library/jest-dom'
import '@testing-library/jest-dom/vitest';
```

```tsx
// Button.test.tsx — setup(), accessible query, awaited findBy
test('given a submitted form, should show the confirmation', async () => {
  const user = userEvent.setup();
  render(<ContactForm {...makeProps()} />);

  await user.type(screen.getByLabelText(/email/i), 'a@b.com');
  await user.click(screen.getByRole('button', { name: /submit/i }));

  expect(await screen.findByRole('status')).toHaveTextContent(/thank you/i);
});
```

## How to run the validation

```bash
npx vitest run                        # behaviour suite
npx vitest typecheck                  # *.test-d.ts type-level tests
npx tsc --noEmit                      # the suite type-checks
npx eslint "src/**/*.test.@(ts|tsx)"  # rules of the deterministic table

# grep-level checks
grep -q "environment: 'happy-dom'" vitest.config.ts
grep -q 'globals: true' vitest.config.ts
grep -q "@testing-library/jest-dom/vitest" vitest.setup.ts
grep -q 'thresholds' vitest.config.ts

# every test file sits next to its component; none is parked in a __tests__ folder
test -z "$(find src -path '*__tests__*' -name '*.test.tsx')"
```

The two presets cover most of the table; the rest is declared here:

```javascript
// eslint.config.mjs
import testingLibrary from 'eslint-plugin-testing-library';
import jestDom from 'eslint-plugin-jest-dom';

export default [
  {
    ...testingLibrary.configs['flat/react'],
    files: ['src/**/*.test.{ts,tsx}'],
  },
  {
    ...jestDom.configs['flat/recommended'],
    files: ['src/**/*.test.{ts,tsx}'],
  },
  {
    files: ['src/**/*.test.{ts,tsx}'],
    rules: {
      // flat/react enables none of these four
      'testing-library/prefer-user-event': 'error',
      'testing-library/prefer-user-event-setup': 'error',
      'testing-library/no-debugging-utils': 'error',   // ships as warn
      'testing-library/no-test-id-queries': 'warn',
    },
  },
];
```

`flat/react` already enables the remaining testing-library rules of the table at `error`, and
`flat/recommended` enables every jest-dom rule listed. `eslint-plugin-testing-library` v7 requires
ESLint 8.57 or newer. Its preset also enables `no-promise-in-fire-event` and
`render-result-naming-convention` — both are in the table — but nothing beyond it, so a failure from
these configs is always a breach of a rule listed above.

## Verification

| Level | Action |
|-------|--------|
| Deterministic | Run the commands above; ESLint, `tsc` and `vitest typecheck` report zero errors, the suite passes, and every grep check succeeds. |
| Semantic | Review the semantic checklist against the diff (AI or human reviewer) and attach the result to the PR. |

## Source of truth

This guardrail **summarises** the React component testing rules so they fit in a single pass of the
harness. The authoritative expansion — installation, query reference, user-event API, async
patterns, debugging, happy-dom, axe-core integration and type-level testing — lives in
`skills/test-react-testing-library/` (`SKILL.md` plus its `references/`). Where this file and the
skill disagree, the skill prevails.
