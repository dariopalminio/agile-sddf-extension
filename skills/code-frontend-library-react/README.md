# code-frontend-library-react

Implement React UI library components: pure CSS + BEM + design tokens, TypeScript strict, tsup
build, Turborepo monorepo.

## What it does

Implements production-ready components for a React UI library (`packages/ui`) following strict
conventions: plain CSS + CSS variables (`--ui-*`), BEM naming, a two-layer design-token system,
TypeScript strict mode, and Next.js App Router compatibility. It also covers adding demo pages and
Storybook stories. Testing is out of scope (use `test-react-testing-library` /
`test-playwright-cucumber`).

## When to use

- Creating a new UI component in `packages/ui/src/components/`
- Adding a new variant or size to an existing component
- Implementing compound component sub-parts (e.g., `CardHeader`, `CardBody`)
- Adding a component page/demo to `apps/demo` or stories to `apps/storybook`
- Refactoring a component to the `--ui-*` token system
- Making a component Next.js App Router compatible (`"use client"`)

## Installation

Install only this skill:

```bash
npx skills add dariopalminio/agile-sddf-extension --skill code-frontend-library-react
```

Or install all skills in the repository:

```bash
npx skills add dariopalminio/agile-sddf-extension --all
```

After installation the skill is invoked automatically by context or directly by name.

## Contents

- `SKILL.md` — main instructions
- `references/` — supporting docs loaded on demand (component structure, design tokens,
  accessibility, theming, …)

## License

MIT © Dario Palminio
