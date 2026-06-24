---
name: test-nestjs-supertest
description: >-
  Write NestJS API integration tests with Supertest and Jest against a running
  INestApplication (`*.e2e-spec.ts`): CRUD endpoints, guard-protected routes
  (JWT/Bearer), `Test.createTestingModule` + `createNestApplication()`, and test
  DB isolation. Not for isolated unit tests, frontend components, or browser E2E.
license: MIT
metadata:
  author: https://github.com/dariopalminio
  owner: dariopalminio/agile-sddf-extension
  version: "1.0.0"
  domain: quality
  triggers: Supertest, Test API NestJS, e2e-spec, integration testing, api bdd, cucumber, request(app.getHttpServer()), API Test.createTestingModule, createNestApplication, ValidationPipe, guards, DataSource, synchronize, database isolation, beforeAll, afterAll, INestApplication, protected routes, Bearer token
  role: specialist
  scope: implementing, automation, testing, backend-testing
  output-format: code
---

# NestJS Supertest API Integration Testing

## Overview

Tests in this skill use Supertest to make real HTTP requests against a
running `INestApplication` instance, exercising the complete
request/response cycle — middleware, guards, pipes, interceptors, and
database interactions — without needing a browser or UI.

**Capabilities:**
- Implement the RED phase tests of TDD.
- Scaffold API integration test suites with `Test.createTestingModule` + `createNestApplication()`.
- Test CRUD endpoints (POST/GET/PUT/DELETE), including validation error responses.
- Verify authenticated / protected routes guarded by JWT/Bearer auth.
- Isolate and clean the test database between runs.

**Limitations:**
- It does not implement production-functional code, it only implements tests.
- Not for unit tests of controllers/services/providers in isolation.
- Not for frontend component tests.
- Not for true browser E2E tests that simulate real user interactions through a UI (use the `playwright`/`cypress` skills instead).

> **Note:** NestJS docs and tooling conventionally call these "E2E tests"
> and name the files `*.e2e-spec.ts`, but technically they are **API
> integration tests**: unlike true E2E tests (Cypress/Playwright), they
> don't drive a UI or simulate real user interactions. This skill keeps
> `*.e2e-spec.ts` filenames because Jest's e2e test discovery config
> (`test/jest-e2e.json`) matches that pattern — renaming them would break
> test discovery in a real NestJS project.
>
> **Naming note:** the code examples below use `(API integration)` instead
> of the `(e2e)` label that appears in NestJS's own documentation. This is
> intentional, to reinforce that these are technically API integration
> tests, not end-to-end tests with a UI. The string inside `describe(...)`
> is purely a human-readable label for test reports — it has zero effect on
> test behavior — so if you prefer to follow NestJS's convention, you can
> rename it back to `(e2e)` without affecting functionality.

## Prerequisites

- A NestJS application with `@nestjs/testing`, `jest` and `supertest` installed.
- Jest e2e config present (`test/jest-e2e.json`) matching the `*.e2e-spec.ts` pattern.
- A test database (or isolation strategy) available for integration runs.

## Default Tools and Frameworks

- **Jest:** This is the default testing framework. It acts as a test runner and provides functions for making assertions (expects), creating mocks, and running spies (jest.fn(), jest.spyOn()).
- **Supertest:** Used in conjunction with Jest for end-to-end (E2E/API integration) testing. It allows you to make HTTP requests to your application and verify the responses.
- **@nestjs/testing:** This is an official package that provides utilities for creating isolated test modules, facilitating unit and integration testing.
- **cucumber-js:** Optional, for Behavior-Driven Development (BDD) style tests. It allows you to write tests in a human-readable format using Gherkin syntax.

## NestJS Testing Convention

- **Unit Testing (*.spec.ts):** The convention for unit tests (UT) is to co-locate them (place them in the same directory) alongside the files being tested.
- **E2E Testing (*.e2e-spec.ts):** The convention for locating e2e tests is test/ (that's where jest-e2e.json and *.e2e-spec.ts live).
- **Cucumber (features/):** By default, Cucumber is located in features/ (Nested Folders Strategy)
- **Cucumber (test/bdd/):** In custom settings, the convention for self-contained Cucumber suite is located in test/bdd/ (flat structure strategy)

## Key Best Practices

- **Dependency injection:** This is not only a good practice, it is an essential practice for writing maintainable, testable, and scalable code.
- **Isolation:** Each test should be independent. It should not depend on the state of other tests or an external environment.
- **Descriptive Names:** Use clear names in the `describe` and `it` blocks that explain what is being tested and what the expected result is.
- **Scenario Coverage:** Don't limit yourself to testing the "happy path." Make sure to also test edge cases and error situations (exceptions).
- **Using the CLI:** It is recommended to use the NestJS CLI (`nest generate`) to create files, as it will automatically generate the `.spec.ts` test files with the basic structure.
- **Test module creation:** Use Test.createTestingModule() and declare only the required providers for the unit under test. Avoid importing heavy or unrelated modules.
- **Replacing dependencies:** To swap a real implementation for a mock, use .overrideProvider() combined with .useValue() or .useClass(). Alternatively, define the mocked provider directly in the providers array.
- **Mocking repositories (TypeORM/Mongoose):** Use getRepositoryToken(Entity) or getModelToken(Entity) as the injection token, and provide an object whose methods (findOne, save, etc.) are defined as jest.fn().
- **Mocking external services (APIs, queues, etc.):** Create a plain object with mock functions (jest.fn()) that return resolved or rejected promises depending on the scenario you want to test.
- **Verifying interactions:** Check that mocks were called correctly using expect(mock.method).toHaveBeenCalledWith(...) and toHaveBeenCalledTimes(n).
- **Resetting state between tests:** Run jest.clearAllMocks() or jest.resetAllMocks() inside beforeEach to clear calls and mock results without recreating the entire module.
- **Avoiding unnecessary overhead:** For unit tests, do not import the full AppModule. Build lightweight test modules that declare only the dependencies actually needed by the component you are isolating.

## Examples

Full, self-contained spec files demonstrating the patterns above:

| File | Demonstrates |
|------|--------------|
| `examples/users.e2e-spec.ts` | Complete Users resource spec: CRUD (POST/GET/PUT/DELETE) plus protected-route authentication in one file |
| `examples/orders.e2e-spec.ts` | Spec with full database isolation: `synchronize(true)` reset between tests, with assertions proving isolation actually works |

> These files are only loaded if the agent needs additional context.

## References

For more details, consult these reference files (loaded on demand):

- **Setup & Teardown** — `references/bootstrap-and-teardown.md`: Configuring `Test.createTestingModule`, `createNestApplication()`, global pipes, `beforeAll`/`afterAll`, closing the app
- **CRUD Operations** — `references/crud-operations.md`: Testing POST, GET, PUT, DELETE endpoints, including validation error responses
- **Authentication** — `references/authentication.md`: Testing routes protected by guards, obtaining tokens via a login flow, sending `Authorization: Bearer` headers
- **Database Isolation** — `references/database-isolation.md`: Cleaning or resetting the test database between tests, choosing an isolation strategy
- **Common Pitfalls** — `references/common-pitfalls.md`: Debugging flaky/leaking integration tests, avoiding false-confidence anti-patterns

If Cucumber is used (BDD with gherkin):
- **Cucumber Integration** — `references/bdd-cucumber-integration.md`: Setting up Cucumber.js with SuperTest. Part 1 = standalone (external URL, root `features/`); **Part 2 = wiring Cucumber to a real NestJS `INestApplication`** (World + hooks bootstrap). Recommended layout is a **flat suite under `test/bdd/{features,steps_definition,support}`** (siblings, one job each; named `bdd` because both Jest and Cucumber suites are API integration tests — the distinguishing axis is the BDD style, and `e2e`/`api` collide or fail to disambiguate). Covers `paths` + dual `require` globs in `cucumber.js`, plus the gotchas: ts-node TypeScript loading with a CommonJS `tsconfig.cucumber.json` override, Node version compatibility (Cucumber v13 needs Node 22+; use v10 on Node 20), and keeping Cucumber off the existing Jest `test` script
- **Cucumber Testing** — `references/bdd-cucumber-testing.md`: Writing Gherkin feature files and step definitions. Section 2 = external URL; section 2b = NestJS steps via `request(this.app.getHttpServer())` and a typed `CustomWorld` (imported from the sibling `support/` dir in the flat layout)
- **Cucumber Reporting** — `references/bdd-cucumber-reporting.md`: Generating HTML reports from Cucumber JSON output, plus a cross-platform run-and-report Node wrapper (shell `;` chaining breaks on Windows)

> These files are only loaded if the agent needs additional context.

Resources: 
- [NestJS E2E Testing](https://docs.nestjs.com/fundamentals/testing#end-to-end-testing)
- [Jest documentation](https://jestjs.io/)
- [SuperTest documentation](https://github.com/ladjs/supertest)
