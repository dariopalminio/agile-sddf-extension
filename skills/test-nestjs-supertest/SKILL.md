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
  triggers: Supertest, Test API NestJS, e2e-spec, integration testing, request(app.getHttpServer()), API Test.createTestingModule, createNestApplication, ValidationPipe, guards, DataSource, synchronize, database isolation, beforeAll, afterAll, INestApplication, protected routes, Bearer token
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

## Examples

Full, self-contained spec files demonstrating the patterns above:

| File | Demonstrates |
|------|--------------|
| `examples/users.e2e-spec.ts` | Complete Users resource spec: CRUD (POST/GET/PUT/DELETE) plus protected-route authentication in one file |
| `examples/orders.e2e-spec.ts` | Spec with full database isolation: `synchronize(true)` reset between tests, with assertions proving isolation actually works |

> These files are only loaded if the agent needs additional context.

## References

For more details, consult these reference files (loaded on demand):

| Topic | Reference | Load When |
|-------|-----------|-----------|
| Setup & Teardown | `references/setup-and-teardown.md` | Configuring `Test.createTestingModule`, `createNestApplication()`, global pipes, `beforeAll`/`afterAll`, closing the app |
| CRUD Operations | `references/crud-operations.md` | Testing POST, GET, PUT, DELETE endpoints, including validation error responses |
| Authentication | `references/authentication.md` | Testing routes protected by guards, obtaining tokens via a login flow, sending `Authorization: Bearer` headers |
| Database Isolation | `references/database-isolation.md` | Cleaning or resetting the test database between tests, choosing an isolation strategy |
| Common Pitfalls | `references/common-pitfalls.md` | Debugging flaky/leaking integration tests, avoiding false-confidence anti-patterns |

> These files are only loaded if the agent needs additional context.

Reference: [NestJS E2E Testing](https://docs.nestjs.com/fundamentals/testing#end-to-end-testing)
