# test-playwright-cucumber

Write E2E tests with Cucumber BDD + Playwright: feature files, step definitions, hooks, and CI/CD
integration.

## What it does

Helps you build maintainable, behaviour-driven E2E test suites with `@cucumber/cucumber` +
Playwright. It scaffolds projects across complexity levels (Basic → Enterprise), writes Gherkin
`.feature` files and TypeScript step definitions, configures the `World` class and browser
lifecycle, sets up multi-profile execution and HTML/JSON/JUnit reporting, and integrates with
GitHub Actions.

## When to use

- Setting up `@cucumber/cucumber` with Playwright and TypeScript
- Writing `.feature` files in Gherkin and implementing `Given`/`When`/`Then` steps
- Configuring the `World` class for browser lifecycle management
- Configuring `cucumber.js` with multiple profiles (smoke, core, full)
- Setting up reporting with screenshot embedding and integrating into a CI pipeline
- Debugging step definition issues and flaky BDD scenarios

Not for unit tests, component tests, or backend tests.

## Installation

Install only this skill:

```bash
npx skills add dariopalminio/agile-sddf-extension --skill test-playwright-cucumber
```

Or install all skills in the repository:

```bash
npx skills add dariopalminio/agile-sddf-extension --all
```

After installation the skill is invoked automatically by context or directly by name.

## Contents

- `SKILL.md` — main instructions
- `references/` — supporting docs loaded on demand (setup, feature files, World, tags, reporting…)
- `assets/` — ready-to-use starter template files
- `scripts/` — scaffolding scripts (e.g. `scaffold-bdd.mjs`)
- `evals/` — skill evaluation cases

## License

MIT © Dario Palminio
