## 5. Generating Reports (Optional)

Install `cucumber-html-reporter`:

```bash
npm install --save-dev cucumber-html-reporter
```

Add a script to generate an HTML report from the JSON output:

```javascript
// scripts/generate-report.js
const reporter = require('cucumber-html-reporter');

reporter.generate({
  theme: 'bootstrap',
  jsonFile: 'results/cucumber-report.json',
  output: 'results/cucumber-report.html',
  reportSuiteAsScenarios: true,
  launchReport: true,
});
```

Then add to `package.json`:

```json
{
  "scripts": {
    "generate:report": "node scripts/generate-report.js"
  }
}
```

