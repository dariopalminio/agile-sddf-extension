# test-cypress-cucumber

Write E2E tests with Cucumber BDD + Cypress: feature files, step definitions, hooks, and CI/CD
integration.

## What it does

Helps you build maintainable, behaviour-driven E2E test suites with
`@badeball/cypress-cucumber-preprocessor` + Cypress. It scaffolds projects across complexity
levels (Basic → Enterprise), writes Gherkin `.feature` files and TypeScript step definitions,
configures hooks and tag-based execution, sets up HTML reporting, and integrates with GitHub
Actions. Page Objects, selectors, and intercept patterns are covered by the `cypress-automation`
skill.

## When to use

- Setting up `@badeball/cypress-cucumber-preprocessor` with Cypress and TypeScript
- Writing `.feature` files in Gherkin and implementing `Given`/`When`/`Then` steps
- Configuring `cypress.config.ts` with the cucumber preprocessor plugin
- Running tests with tag expressions and setting up HTML reporting
- Integrating Cypress Cucumber into a CI pipeline; debugging flaky BDD scenarios

Not for unit tests, component tests, or backend tests.

## Installation

Install only this skill:

```bash
npx skills add dariopalminio/agile-sddf-extension --skill test-cypress-cucumber
```

Or install all skills in the repository:

```bash
npx skills add dariopalminio/agile-sddf-extension --all
```

After installation the skill is invoked automatically by context or directly by name.

## Contents

- `SKILL.md` — main instructions
- `references/` — supporting docs loaded on demand (setup, feature files, steps, tags, reporting…)
- `assets/` — ready-to-use starter template files
- `scripts/` — scaffolding scripts (e.g. `scaffold-bdd.mjs`)
- `evals/` — skill evaluation cases

## License

MIT © Dario Palminio
