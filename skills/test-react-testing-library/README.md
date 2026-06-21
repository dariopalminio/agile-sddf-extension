# test-react-testing-library

Test React components with Vitest + Testing Library + happy-dom + axe-core.

## What it does

Provides patterns for testing React components, forms, and hooks the way users actually use them:
rendering, user interaction (via `@testing-library/user-event`), async behavior (`findBy` /
`waitFor`), jest-dom matchers, and accessibility checks with axe-core. It emphasizes accessible
queries (role, label, text) and avoids testing implementation details.

## When to use

- Testing UI components, forms, or hooks that render in the DOM
- Writing render/query/interaction assertions with Testing Library and Vitest
- Adding accessibility assertions to component tests

Not for backend tests or true browser E2E tests (use the Playwright/Cypress skills for those).

## Installation

Install only this skill:

```bash
npx skills add dariopalminio/agile-sddf-extension --skill test-react-testing-library
```

Or install all skills in the repository:

```bash
npx skills add dariopalminio/agile-sddf-extension --all
```

After installation the skill is invoked automatically by context or directly by name.

## Contents

- `SKILL.md` — main instructions
- `references/` — supporting docs loaded on demand (queries, user events, async, axe-core, config…)

## License

MIT © Dario Palminio
