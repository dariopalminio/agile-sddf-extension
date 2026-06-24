# BDD: Cucumber reporting

## Generating Reports (Optional)

Install `cucumber-html-reporter`:

```bash
npm install --save-dev cucumber-html-reporter
```

Add a script to generate an HTML report from the JSON output:

```javascript
// scripts/generate-cucumber-report.js
const reporter = require('cucumber-html-reporter');

reporter.generate({
  theme: 'bootstrap',
  jsonFile: 'results/cucumber-report.json',
  output: 'results/cucumber-report.html',
  reportSuiteAsScenarios: true,
  scenarioTimestamp: true,
  launchReport: false, // set true to auto-open a browser locally; keep false for CI
  metadata: {
    'App Name': 'nestjs-hello-world',
    'Test Environment': 'local',
  },
});
```

Then add to `package.json`:

```json
{
  "scripts": {
    "report:cucumber": "node scripts/generate-cucumber-report.js"
  }
}
```

## Run-and-report in one step (cross-platform)

You'll usually want to run the suite **and** generate the report in one
command, including when scenarios fail (a failing run still writes the JSON,
so the report is most useful then). Avoid shell chaining in npm scripts:

- `cucumber-js && node ...` skips the report when tests fail.
- `cucumber-js ; node ...` does **not** work on Windows (pnpm/npm runs the
  script via `cmd.exe`, which passes `;` as an argument to `cucumber-js`,
  producing `The uri (...) must end with .feature or .md`).

Use a small Node wrapper instead — it's portable and always reports:

```javascript
// scripts/test-cucumber-report.js
const { spawnSync } = require('child_process');
const path = require('path');

const cucumberBin = path.join(
  __dirname, '..', 'node_modules', '.bin',
  process.platform === 'win32' ? 'cucumber-js.cmd' : 'cucumber-js',
);

const cucumber = spawnSync(cucumberBin, [], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

spawnSync(process.execPath, [path.join(__dirname, 'generate-cucumber-report.js')], {
  stdio: 'inherit',
});

// Preserve Cucumber's exit code so CI still fails on test failures.
process.exit(cucumber.status ?? 1);
```

```json
{
  "scripts": {
    "test:cucumber:report": "node scripts/test-cucumber-report.js"
  }
}
```

