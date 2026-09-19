# Guardrail: React Component Testing with Vitest + Testing Library

Applies to every React component and hook test built with Vitest + `@testing-library/react` +
happy-dom + axe-core (`*.test.tsx` and `*.test-d.ts`). Does not apply to pure unit tests without
React, backend or integration tests, or browser-level E2E suites.

Rule IDs: `RTL-NN` — unique across this project's guardrails, immutable once published:
never renumbered, never reused.

## Mandatory rules

**On breach:** `(error)` blocks delivery — stop, name the rule id, fix it before continuing.
`(warn)` does not block — apply it, or state why you did not. A semantic rule that fails is raised
for human judgement; never resolve one silently.

### Deterministic rules (eslint-plugin-testing-library / eslint-plugin-jest-dom / Vitest / tsc)

The `flat/react` preset leaves several of the rules below disabled; they are declared explicitly in
the config of *How to run the validation*. Published rule ids are the plugin's own and appear verbatim in
the ESLint output; the `RTL-NN` id is how this file and its reviewers cite each rule.

#### Queries & assertions

- [ ] **RTL-01** Every query goes through `screen`, never through the object returned by `render()` — testing-library: `prefer-screen-queries` (error)
- [ ] **RTL-02** Async queries (`findBy*`, `findAllBy*`) are awaited — testing-library: `await-async-queries` (error)
- [ ] **RTL-03** `user-event` API calls are awaited — testing-library: `await-async-events` (error)
- [ ] **RTL-04** Synchronous queries (`getBy*`, `queryBy*`) are not awaited — testing-library: `no-await-sync-queries` (error)
- [ ] **RTL-05** An element that appears asynchronously is fetched with `findBy*`, not `waitFor` wrapping a `getBy*` — testing-library: `prefer-find-by` (error)
- [ ] **RTL-06** Presence assertions use `getBy*`, absence assertions use `queryBy*` — testing-library: `prefer-presence-queries` (error)
- [ ] **RTL-07** `waitForElementToBeRemoved` receives a `queryBy*` callback, so it does not throw before waiting — testing-library: `prefer-query-by-disappearance` (error)
- [ ] **RTL-08** Text matchers carry no global `/g` flag; a stateful regex silently skips matches — testing-library: `no-global-regexp-flag-in-query` (error)

#### Implementation details

- [ ] **RTL-09** No querying through `container` returned by `render()` — testing-library: `no-container` (error)
- [ ] **RTL-10** No direct DOM traversal (`querySelector`, `firstChild`, `parentElement`) — testing-library: `no-node-access` (error)
- [ ] **RTL-11** Interactions use `@testing-library/user-event`, not `fireEvent` — testing-library: `prefer-user-event` (error)
- [ ] **RTL-12** Each test creates its own instance with `userEvent.setup()` before interacting — testing-library: `prefer-user-event-setup` (error)
- [ ] **RTL-13** `getByTestId` is a documented last resort, reported so its use stays visible in review — testing-library: `no-test-id-queries` (warn)
- [ ] **RTL-14** Utilities are imported from `@testing-library/react`, never from `@testing-library/dom` — testing-library: `no-dom-import` (error)
- [ ] **RTL-15** The `render()` result is named `view` or destructured, never `wrapper` or `component` — testing-library: `render-result-naming-convention` (error)
- [ ] **RTL-16** No manual `cleanup()` call; Vitest with `globals: true` runs it automatically — testing-library: `no-manual-cleanup` (error)

> `getByTestId` is a permitted escape hatch here, and the accessible queries come first. Do not
> carry over the `data-*`-mandatory rule from the Cypress guardrail: Cypress drives a browser with
> no accessibility tree to query, this suite has one.

#### Async & act discipline

- [ ] **RTL-17** No `act()` around Testing Library utilities, which already wrap their own updates — testing-library: `no-unnecessary-act` (error)
- [ ] **RTL-18** A `waitFor` callback holds exactly one assertion — testing-library: `no-wait-for-multiple-assertions` (error)
- [ ] **RTL-19** A `waitFor` callback contains no side effect (render, user event, mock setup) — testing-library: `no-wait-for-side-effects` (error)
- [ ] **RTL-20** No snapshot assertion inside `waitFor` — testing-library: `no-wait-for-snapshot` (error)
- [ ] **RTL-21** `waitFor` and `waitForElementToBeRemoved` are awaited — testing-library: `await-async-utils` (error)
- [ ] **RTL-22** No promise passed to `fireEvent` — testing-library: `no-promise-in-fire-event` (error)
- [ ] **RTL-23** `render()` is called inside the test, never in `beforeEach` or another lifecycle hook — testing-library: `no-render-in-lifecycle` (error)
- [ ] **RTL-24** No `screen.debug()`, `prettyDOM()` or `logRoles()` left in a committed test — testing-library: `no-debugging-utils` (error)

#### jest-dom matchers

- [ ] **RTL-25** Existence is asserted with `toBeInTheDocument()`, not with `toBeNull` / `toHaveLength` on a query — jest-dom: `prefer-in-document` (error)
- [ ] **RTL-26** Checked state uses `toBeChecked()` — jest-dom: `prefer-checked` (error)
- [ ] **RTL-27** Disabled state uses `toBeEnabled()` / `toBeDisabled()` — jest-dom: `prefer-enabled-disabled` (error)
- [ ] **RTL-28** Focus uses `toHaveFocus()` — jest-dom: `prefer-focus` (error)
- [ ] **RTL-29** Attributes use `toHaveAttribute()` — jest-dom: `prefer-to-have-attribute` (error)
- [ ] **RTL-30** Text content uses `toHaveTextContent()` — jest-dom: `prefer-to-have-text-content` (error)

#### Project configuration & layout

- [ ] **RTL-31** `vitest.config.ts` declares `environment: 'happy-dom'` — grep (error)
- [ ] **RTL-32** `vitest.config.ts` declares `globals: true`, which is what enables RTL auto-cleanup — grep (error)
- [ ] **RTL-33** The setup file imports `@testing-library/jest-dom/vitest`; the bare entry point does not register the matchers on Vitest's `expect` — grep (error)
- [ ] **RTL-34** Component tests are co-located with the component they test and named `*.test.tsx`; type-level tests are named `*.test-d.ts(x)` — glob (error)
- [ ] **RTL-35** The suite type-checks — `tsc --noEmit` (error)
- [ ] **RTL-36** `vitest.config.ts` declares coverage thresholds — grep (warn)

---

### Semantic rules (AI / human review)

- [ ] **RTL-37** Tests assert what the user sees and does; never internal state, internal methods, lifecycle or a child component's internals.
- [ ] **RTL-38** The query priority is genuinely respected: role, label and text first, `alt`/`title` second, and every `getByTestId` states in a comment why no accessible query reaches the element.
- [ ] **RTL-39** Each `describe` names the component under test, and each test states the behaviour in "given …, should …" prose.
- [ ] **RTL-40** Props come from a per-component factory with sensible defaults; each test overrides only the field it exercises.
- [ ] **RTL-41** Test data is realistic (faker, cuid2 or an existing factory), never a hardcoded database id.
- [ ] **RTL-42** Coverage includes the unhappy path — validation errors, rejected requests, empty and loading states — not only the happy path.
- [ ] **RTL-43** Providers the component needs come from the shared `test-utils` render wrapper rather than being redeclared per file.
- [ ] **RTL-44** axe runs against a settled DOM, after loading has finished; a violation is fixed or documented with its reasoning, never silenced with a blanket disable.
- [ ] **RTL-45** Accessibility coverage extends beyond the default state to the interactive flows (opened dialog, submitted form, error state).
- [ ] **RTL-46** `jsdom` is selected per file only where happy-dom lacks the browser API in question, with the reason stated; happy-dom stays the default.
- [ ] **RTL-47** Type-level tests target the public API — exported unions, props interfaces, ref types — not internal implementation types.
- [ ] **RTL-48** Mocks replace collaborators at the module boundary; the behaviour under test is never mocked away.
- [ ] **RTL-49** No credentials or personal data are committed in fixtures, factories or test data.

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
pnpm test # or npm run test
```

```bash
npx vitest run                        # behaviour suite
npx vitest typecheck                  # *.test-d.ts type-level tests
npx eslint "src/**/*.test.@(ts|tsx)"  # RTL-01 … RTL-30 — the plugin rule ids appear in the output

# self-defined checks — each prints its rule id followed by the breach; nothing printed = pass
fail=0
chk()  { [ -z "$2" ] || { printf 'FAIL %s\n%s\n' "$1" "$2"; fail=1; }; }
warn() { [ -z "$2" ] || printf 'WARN %s\n%s\n' "$1" "$2"; }
chk  RTL-31 "$(grep -q "environment: 'happy-dom'" vitest.config.ts || echo "vitest.config.ts lacks environment: 'happy-dom'")"
chk  RTL-32 "$(grep -q 'globals: true' vitest.config.ts || echo "vitest.config.ts lacks globals: true")"
chk  RTL-33 "$(grep -q '@testing-library/jest-dom/vitest' vitest.setup.ts || echo "vitest.setup.ts does not import @testing-library/jest-dom/vitest")"
chk  RTL-34 "$(find src -path '*__tests__*' -name '*.test.tsx')"          # every test sits next to its component
chk  RTL-35 "$(npx tsc --noEmit 2>&1 | grep -E 'error TS')"
warn RTL-36 "$(grep -q 'thresholds' vitest.config.ts || echo "vitest.config.ts declares no coverage thresholds")"
exit $fail
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
| Semantic | Review the semantic checklist against the diff (AI or human reviewer), citing the `RTL-NN` id of each finding, and attach the result to the PR. |

## Source of truth

This guardrail **summarises** the React component testing rules so they fit in a single pass of the
harness. The authoritative expansion — installation, query reference, user-event API, async
patterns, debugging, happy-dom, axe-core integration and type-level testing — lives in
`skills/test-react-testing-library/` (`SKILL.md` plus its `references/`). Where this file and the
skill disagree, the skill prevails.
