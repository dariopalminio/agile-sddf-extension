# Reference Guide: Cucumber Integration and API Testing with Cucumber + Supertest + TypeScript

This guide documents the setup and usage of a BDD testing framework for REST APIs, combining Cucumber.js (Gherkin), SuperTest, Jest, and TypeScript.

---

# Part 1: Installation and Configuration

## 1. Introduction

This stack allows you to write API tests using:
- **TypeScript** — type-safe test code
- **Jest** — test runner and assertions
- **SuperTest** — HTTP request library for testing APIs
- **Cucumber.js** — BDD framework to write tests in Gherkin (Given/When/Then)

The combination gives you both technical robustness (SuperTest) and business‑readable specifications (Gherkin).

## 2. Project Structure

A typical folder structure for this setup:

```
project/
├── features/                    # Gherkin feature files
│   ├── posts.feature
│   └── support/                 # Step definitions and support code
│       └── steps.ts
├── specs/                       # Optional: SuperTest + Jest tests
│   └── supertest.spec.ts
├── results/                     # Generated reports
├── jest.config.js               # Jest configuration
├── cucumber.js                  # Cucumber configuration
├── tsconfig.json                # TypeScript configuration
└── package.json
```

## 3. Dependencies Installation

Install the required development dependencies:

```bash
npm install --save-dev jest supertest ts-jest @cucumber/cucumber @types/jest @types/supertest @types/node
```

Recommended versions (check for latest compatible ones):

```json
{
  "devDependencies": {
    "jest": "^29.5.0",
    "supertest": "^6.3.4",
    "ts-jest": "^29.1.2",
    "@cucumber/cucumber": "^10.0.0",
    "@types/jest": "^29.5.12",
    "@types/supertest": "^6.0.2",
    "@types/node": "^20.0.0"
  }
}
```

## 4. Configuration Files

### 4.1 `jest.config.js`

```javascript
/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
};
```

### 4.2 `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "./dist"
  },
  "include": ["features/**/*.ts", "specs/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### 4.3 `cucumber.js`

```javascript
module.exports = {
  default: {
    require: ['features/support/**/*.ts'],
    format: ['progress', 'json:results/cucumber-report.json'],
    publishQuiet: true,
  },
};
```

### 4.4 `package.json` Scripts

```json
{
  "scripts": {
    "test:supertest": "jest specs/",
    "test:cucumber": "cucumber-js --require features/support/*.ts features/*.feature",
    "test": "npm run test:supertest && npm run test:cucumber"
  }
}
```

## 5. SuperTest + Jest (Optional but Recommended)

You can also write traditional API tests with SuperTest + Jest alongside Cucumber. Example in `specs/supertest.spec.ts`:

```typescript
import supertest from 'supertest';

const request = supertest('https://jsonplaceholder.typicode.com');

describe('GET REQUESTS', () => {
  it('GET /posts', async () => {
    const response = await request.get('/posts');
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(100);
    expect(response.body[0].userId).toBe(1);
  });
});

describe('POST REQUESTS', () => {
  it('POST /posts', async () => {
    const data = { title: 'foo', body: 'bar', userId: 1 };
    const response = await request.post('/posts').send(data);
    expect(response.status).toBe(201);
    expect(response.body.title).toBe(data.title);
  });
});
```

Run them with:

```bash
npm run test:supertest
```

---

## Resources

- [Original article on Medium](https://medium.com/@azizzouaghia/setting-up-basic-api-testing-with-supertest-cucumber-jest-and-typescript-8c6a23c045a1)
- [Example repository](https://github.com/tooniez/supertest-cucumber-ts)
- [Cucumber.js documentation](https://github.com/cucumber/cucumber-js)