# test-nestjs-supertest

Write API integration tests for NestJS applications using Supertest.

## What it does

Builds API integration tests that make real HTTP requests against a running `INestApplication`
with Supertest and Jest, exercising the full request/response cycle — routing, middleware, guards,
pipes, interceptors, and database interactions — without a browser or UI. It scaffolds test
suites, covers CRUD and authenticated/protected routes, and isolates the test database between
runs.

## When to use

- Setting up `supertest` with NestJS and Jest, writing `*.e2e-spec.ts` files
- Testing POST/GET/PUT/DELETE endpoints against a running `INestApplication`
- Testing routes protected by guards (JWT/Bearer auth)
- Configuring `Test.createTestingModule` + `createNestApplication()`
- Isolating or cleaning a test database between tests

Not for isolated unit tests, frontend component tests, or true browser E2E tests (use the
Playwright/Cypress skills for those).

## Installation

Install only this skill:

```bash
npx skills add dariopalminio/agile-sddf-extension --skill test-nestjs-supertest
```

Or install all skills in the repository:

```bash
npx skills add dariopalminio/agile-sddf-extension --all
```

After installation the skill is invoked automatically by context or directly by name.

## Contents

- `SKILL.md` — main instructions
- `references/` — supporting docs loaded on demand (setup, CRUD, auth, DB isolation, pitfalls)
- `examples/` — full, self-contained example spec files

## License

MIT © Dario Palminio
