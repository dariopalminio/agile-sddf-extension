# BDD: Reference Guide: Cucumber Integration and API Testing with Cucumber + Supertest + TypeScript

This guide documents the setup and usage of a BDD testing framework for REST APIs, combining Cucumber.js (Gherkin), SuperTest, Jest, and TypeScript.

---

# BDD: Part 1 - Installation and Configuration

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

# BDD: Part 2 - Integrating Cucumber with a NestJS app (recommended for NestJS projects)

> The examples in Part 1 point SuperTest at an **external URL**
> (`supertest('https://jsonplaceholder.typicode.com')`). That's fine for a
> standalone tutorial, but in a real NestJS project you want the same thing
> the Jest e2e specs do: boot a real `INestApplication` in-process and fire
> requests at `app.getHttpServer()`. This section documents that wiring plus
> the environment gotchas that bite on first setup.

## 6. Recommended folder structure (NestJS): flat suite under `test/bdd/`

Two conventions drive the recommended layout:

1. **Put the suite under `test/`** — NestJS keeps its e2e/integration tests
   there (next to `jest-e2e.json` and the Jest `*.e2e-spec.ts` files), not at
   the project root.
2. **Use a flat 3-folder layout** — `features/`, `steps_definition/`, and
   `support/` as **siblings**, each with a single responsibility. This is
   Cucumber's documented convention (`step_definitions` and `support` are
   separate) and scales better than nesting `steps/` inside `support/`: glue
   code (world/hooks) and step bindings don't get entangled as the suite grows.
   The only cost is a second `require` glob (see §7).

```
project/
├── test/
│   ├── app.e2e-spec.ts               # existing Jest e2e (untouched)
│   ├── jest-e2e.json
│   └── bdd/                          # self-contained Cucumber suite
│       ├── features/
│       │   └── hello.feature         # Gherkin specs (business-readable)
│       ├── steps_definition/
│       │   └── hello.steps.ts        # step definitions (Gherkin → code)
│       └── support/
│           ├── world.ts              # per-scenario context (app + response)
│           └── hooks.ts              # BeforeAll/AfterAll bootstrap the Nest app
├── scripts/
│   ├── generate-cucumber-report.js
│   └── test-cucumber-report.js       # cross-platform "run + report" wrapper
├── results/                          # generated JSON + HTML (gitignore this)
├── cucumber.js                       # config + ts-node registration
└── tsconfig.cucumber.json            # CommonJS override for ts-node
```

> **Why `bdd/` and not `e2e/` or `api/`?** In a NestJS project the existing
> Jest specs already hit the API over HTTP via SuperTest, so both suites are
> technically *API integration tests* with the same scope — the thing that
> distinguishes them is the **style** (BDD/Gherkin vs imperative Jest), so name
> the folder after that. Avoid `e2e/`: it collides with the existing
> `jest-e2e.json` / `*.e2e-spec.ts` naming and is technically inaccurate (no UI
> is driven). Avoid `api/`: both suites are API tests, so it doesn't
> disambiguate. `test/cucumber/` is an equally good tool-explicit alternative.

## 7. Loading TypeScript step definitions (ts-node)

Cucumber.js does **not** transpile TypeScript on its own. Register `ts-node`
at the top of `cucumber.js` and point it at a dedicated tsconfig:

```javascript
// cucumber.js
const path = require('path');

require('ts-node').register({
  project: path.join(__dirname, 'tsconfig.cucumber.json'),
  transpileOnly: true, // skip type-checking for speed; tsc/jest still type-check
});

module.exports = {
  default: {
    // Cucumber defaults to a root `features/` dir; point it at test/bdd.
    paths: ['test/bdd/features/**/*.feature'],
    // Flat layout → load support (world/hooks) AND step definitions; both globs
    // are needed because steps_definition/ is a sibling of support/, not nested.
    require: [
      'test/bdd/support/**/*.ts',
      'test/bdd/steps_definition/**/*.ts',
    ],
    format: ['progress-bar', 'json:results/cucumber-report.json', 'summary'],
    formatOptions: { snippetInterface: 'async-await' },
    // NOTE: do NOT add `publishQuiet` on cucumber >= 10 — it's deprecated and
    // prints a warning. The publish banner is already off by default.
  },
};
```

### Why a separate `tsconfig.cucumber.json`?

Modern NestJS starters ship a root `tsconfig.json` with
`"module": "nodenext"`. `ts-node` (as used by Cucumber here) needs CommonJS,
and `nodenext` also enables `resolvePackageJsonExports`, which errors under
`moduleResolution: "node"`. Override both in a tsconfig that extends the root:

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "module": "commonjs",
    "moduleResolution": "node",
    "resolvePackageJsonExports": false,
    "types": ["node"]
  },
  "include": ["test/bdd/**/*.ts", "src/**/*.ts"]
}
```

> If you skip this you'll see errors like
> `TS5098: Option 'resolvePackageJsonExports' can only be used when 'moduleResolution' is set to 'node16', 'nodenext', or 'bundler'`.

## 8. Node.js version compatibility (read before installing)

`@cucumber/cucumber` v11+ (incl. v13) **requires Node 22 / 24 / >=26** and
will hard-exit on older Node:

```
Cucumber can only run on Node.js versions 22 || 24 || >=26. This Node.js version is v20.20.0
```

If you're on **Node 20 (or older)**, pin Cucumber to **v10**, which is fully
compatible and matches the API used throughout this guide:

```bash
npm install --save-dev @cucumber/cucumber@^10.9.0
```

Check your runtime first (`node --version`) — the `@types/node` version in
`package.json` is *not* the runtime version.

## 9. Bootstrapping the Nest app (World + hooks)

`test/bdd/support/world.ts` — per-scenario context shared across steps:

```typescript
import { setWorldConstructor, World, IWorldOptions } from '@cucumber/cucumber';
import { INestApplication } from '@nestjs/common';
import { Response } from 'supertest';

export class CustomWorld extends World {
  app!: INestApplication;
  response!: Response;

  constructor(options: IWorldOptions) {
    super(options);
  }
}

setWorldConstructor(CustomWorld);
```

`test/bdd/support/hooks.ts` — boot the app once, inject it per scenario
(mirrors the `beforeAll`/`afterAll` of the Jest e2e specs):

```typescript
import { BeforeAll, AfterAll, Before } from '@cucumber/cucumber';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
// from test/bdd/support/ up to the project root, then into src/
import { AppModule } from '../../../src/app.module';
import { CustomWorld } from './world';

let app: INestApplication;

BeforeAll(async () => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  app = moduleFixture.createNestApplication();
  // Apply the same global pipes/guards/interceptors as main.ts here if needed,
  // e.g. app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  await app.init();
});

AfterAll(async () => {
  if (app) {
    await app.close();
  }
});

Before(function (this: CustomWorld) {
  this.app = app;
});
```

> Step definitions then use `request(this.app.getHttpServer())` instead of a
> hard-coded URL — see Part 2 for the NestJS step-definition example.

## 10. package.json scripts (NestJS)

```json
{
  "scripts": {
    "test:cucumber": "cucumber-js",
    "test:cucumber:report": "node scripts/test-cucumber-report.js",
    "report:cucumber": "node scripts/generate-cucumber-report.js"
  }
}
```

**Do not overwrite the existing `test` script** (it usually runs the Jest unit
suite in a NestJS project). Keep Cucumber on its own scripts so both suites
coexist. Also add `/results` to `.gitignore`.

---

## Resources

- [Original article on Medium](https://medium.com/@azizzouaghia/setting-up-basic-api-testing-with-supertest-cucumber-jest-and-typescript-8c6a23c045a1)
- [Example repository](https://github.com/tooniez/supertest-cucumber-ts)
- [Cucumber.js documentation](https://github.com/cucumber/cucumber-js)
