// cucumber.js — profile configuration for @cucumber/cucumber
// Usage:
//   npx cucumber-js                          (default profile)
//   npx cucumber-js --profile smoke          (smoke profile)
//   npx cucumber-js --profile regression     (regression profile)
//   npx cucumber-js --profile ci             (CI profile)

const common = {
  require: ['test/e2e/support/hooks.ts', 'test/e2e/step_definitions/**/*.ts'],
  requireModule: ['ts-node/register'],
  publishQuiet: true,
};

module.exports = {
  // ── Default: run all scenarios except @wip ──────────────────────────────
  default: {
    ...common,
    paths: ['test/e2e/features/**/*.feature'],
    tags: 'not @wip',
    format: [
      'progress',
      'html:test/e2e/reports/cucumber-report.html',
      'json:test/e2e/reports/cucumber-report.json',
    ],
  },

  // ── Smoke: fast sanity check — @smoke tagged scenarios only ─────────────
  smoke: {
    ...common,
    paths: ['test/e2e/features/**/*.feature'],
    tags: '@smoke and not @wip',
    format: [
      'progress',
      'html:test/e2e/reports/smoke-report.html',
      'json:test/e2e/reports/smoke-report.json',
    ],
  },

  // ── Regression: full suite — @regression tagged scenarios ───────────────
  regression: {
    ...common,
    paths: ['test/e2e/features/**/*.feature'],
    tags: '@regression and not @wip',
    format: [
      'progress',
      'html:test/e2e/reports/regression-report.html',
      'json:test/e2e/reports/regression-report.json',
    ],
  },

  // ── CI: all non-wip with JUnit XML for GitHub Actions ───────────────────
  ci: {
    ...common,
    paths: ['test/e2e/features/**/*.feature'],
    tags: 'not @wip',
    format: [
      'progress',
      'html:test/e2e/reports/cucumber-report.html',
      'json:test/e2e/reports/cucumber-report.json',
      'junit:test/e2e/reports/junit-report.xml',
    ],
  },
};
