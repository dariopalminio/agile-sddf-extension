# test-living-spec-cucumber

Maintain executable Cucumber living specifications. Gherkin features live under the repository's
`specs/features/` directory by domain and capability. Step definitions and Page Objects stay in
the app or package that runs them.

## Installation

From the project where you want to use the skill, install it from the published repository.
[Skills CLI reference](https://github.com/vercel-labs/skills/blob/main/docs/commands.md)

```sh
npx skills add dariopalminio/agile-sddf-extension --skill test-living-spec-cucumber
```

To try the version in a local checkout, run this from the root of this repository.

```sh
npx skills add ./skills/test-living-spec-cucumber
```

## Usage

Ask your agent to use the skill when adding a scenario, reorganizing a feature, or fixing
Cucumber discovery in an existing suite. Include the behavior and the app or package that runs
the tests. If the project has several runners, include the test command or profile name.

> Use `test-living-spec-cucumber` to document how a shopper cancels a pending order in the
> `shopping` domain and `manage-orders` capability. The Cucumber runner starts in
> `apps/storefront/` and uses `npm run test:bdd`. Reuse its existing steps and verify the
> affected scenario.

The skill checks whether Cucumber discovers the feature and resolves its steps. It runs the
affected scenarios when the test environment is available and reports any execution blocker.

## Resources

- [Skill instructions](SKILL.md)
- [Cucumber.js monorepo example](references/cucumber-js-monorepo.md)
- [Evaluation cases](evals/evals.json)

## License

MIT. [Repository license](../../LICENSE)
