# Cucumber.js Monorepo Example

The storefront package already has a `test:e2e` script that runs `cucumber-js --profile living-spec`
from `apps/storefront/`. The package owns order management and uses ESM support files.

## Feature and automation

Save the feature at `specs/features/shopping/manage-orders/cancel-order.feature`.

```gherkin
@shopping @manage-orders
Feature: Order cancellation

  @smoke
  Scenario: Cancel a pending order
    Given the shopper has a pending order
    When the shopper cancels the order
    Then the order status is Canceled
```

Look for matching bindings in `apps/storefront/e2e/steps/`. Add any missing bindings there and
reuse the order details Page Object in `apps/storefront/e2e/pages/` for cancellation and status
lookup. Assert the status in the `Then` step.

## Feature and support code discovery

In `apps/storefront/cucumber.json`, keep discovery settings in the existing `living-spec`
profile and define the run-level filters alongside it.

```json
{
  "living-spec": {
    "paths": ["../../specs/features/shopping/manage-orders/**/*.feature"],
    "import": ["e2e/support/**/*.mjs", "e2e/steps/**/*.mjs"]
  },
  "smoke": { "tags": "@smoke" },
  "sanity": { "tags": "@smoke or @sanity" },
  "regression": { "tags": "@smoke or @sanity or @regression" }
}
```

The feature glob reaches the repository root from `apps/storefront/` and selects only the
capability this package owns. The import globs load its World, hooks, and step bindings.
Use the actual runner directory and the project's existing module format, file extensions,
and loaders when adapting the example.

## Verification

Add the run-level scripts alongside `test:e2e` in `apps/storefront/package.json`. Each script
combines the base discovery profile with one run-level profile. [Cucumber.js profiles](https://github.com/cucumber/cucumber-js/blob/main/docs/profiles.md)

```json
{
  "scripts": {
    "test:e2e": "cucumber-js --profile living-spec",
    "test:e2e:smoke": "npm run test:e2e -- --profile smoke",
    "test:e2e:sanity": "npm run test:e2e -- --profile sanity",
    "test:e2e:regression": "npm run test:e2e -- --profile regression"
  }
}
```

Run the command for the scope you need from `apps/storefront/`.

```sh
npm run test:e2e:smoke
npm run test:e2e:sanity
npm run test:e2e:regression
```

Append `-- --dry-run` to each command to check its scenario selection. All three include the
`Cancel a pending order` smoke scenario.

To check discovery and bindings for just the affected scenario, filter by its name.

```sh
npm run test:e2e -- --dry-run --name "^Cancel a pending order$"
```

Expect one scenario with three skipped steps. If the output lists zero scenarios, check the
working directory, profile paths, and scenario filters. For an undefined step, check that the
profile loads the step file and that its expression matches the Gherkin. For an ambiguous step,
inspect all matching expressions and resolve the overlap while preserving existing bindings.

Once discovery and binding checks pass, run the same scenario against the test app.

```sh
npm run test:e2e -- --name "^Cancel a pending order$"
```

Report the actual execution result. If the test app is unavailable, report the discovery and binding
results and the execution blocker. [Cucumber.js configuration](https://github.com/cucumber/cucumber-js/blob/main/docs/configuration.md) · [Dry-run behavior](https://github.com/cucumber/cucumber-js/blob/main/docs/dry_run.md)
