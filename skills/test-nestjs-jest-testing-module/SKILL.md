---
name: test-nestjs-jest-testing-module
description: Write Unit Tests for NestJS applications using Testing Module and jest
license: MIT
metadata:
  owner: dariopalminio/agile-sddf-extension
  domain: quality
  triggers: Test NestJS, unit test, Testing Module, jest, mock dependencies, exception paths, guard testing, mocked external services
  role: specialist
  scope: implementing, automation, testing, backend-testing
  output-format: code
---

# NestJS Jest Testing Module Unit Tests

## Overview

Write unit tests for NestJS applications using `Test.createTestingModule` and Jest.

**Capabilities:**
- Implement the RED phase tests of TDD.
- Scaffold isolated unit test suites with `Test.createTestingModule(...).compile()` and resolve providers via `module.get(...)`.
- Test services, controllers, guards, interceptors, and pipes in isolation with mocked dependencies (`useValue` with `jest.fn()`).
- Mock external services (HTTP, databases/repositories, SDKs) so tests stay fast, deterministic, and side-effect free.
- Cover edge cases: thrown exceptions (`NotFoundException`, `ConflictException`), API timeouts, rate limiting, and time-dependent logic via `jest.useFakeTimers()`.

**Limitations:**
- It does not implement production-functional code, it only implements tests.
- Not for API integration tests that exercise the full HTTP request/response cycle (use the `test-nestjs-supertest` skill instead).
- Not for true browser E2E tests that drive a UI (use the `playwright`/`cypress` skills instead).
- Not for frontend component tests (use the `test-react-testing-library` skill instead).
- Does not test against real external services or databases — those must be mocked.

## Prerequisites

- A NestJS application with `@nestjs/testing` and `jest` installed.
- Providers/services under test that receive their dependencies via NestJS dependency injection (constructor injection).
- A Jest config that discovers unit test files (conventionally `*.spec.ts`).

## Core Workflow

1. **Locate the spec** — co-locate `<name>.spec.ts` next to the class under test, inside `src/`.
2. **Compile a minimal module** — `Test.createTestingModule({ providers: [...] }).compile()` in `beforeEach`, declaring only the class under test plus its direct dependencies.
3. **Mock every dependency** — `{ provide: Token, useValue: { method: jest.fn() } }`, using the right token (`getRepositoryToken`, `getModelToken`, custom `@Inject` token).
4. **Resolve** — `module.get<T>(Token)` for singletons, `await module.resolve<T>(Token)` for `REQUEST`/`TRANSIENT` scope.
5. **Write the happy path** — arrange the stubs, act, assert the returned value *and* the observable side effects.
6. **Write the failure paths** — thrown exceptions, dependency errors, timeouts, and the absence of side effects on error.
7. **Clean up** — `jest.clearAllMocks()` in `afterEach`; `jest.useRealTimers()` too when fake timers were used.

## Constraints

### MUST DO

- Build the module with `Test.createTestingModule(...).compile()` — never instantiate the class with `new`
- Declare only the class under test and its direct dependencies; never import `AppModule`
- Create the module in `beforeEach`, not `beforeAll`, so every test starts isolated
- Mock every external dependency: HTTP clients, repositories, message queues, SDKs
- Type mocks as `jest.Mocked<T>`, or derive the type from a factory with `ReturnType<typeof factory>`
- Stub every call the method under test makes, not only the one being asserted
- `await` every promise assertion: `await expect(...).rejects.toThrow(...)`
- Assert the returned value, not merely that a mock was called
- Call `jest.clearAllMocks()` in `afterEach`
- Restore timers with `jest.useRealTimers()` in `afterEach` whenever `jest.useFakeTimers()` was used
- Return observables (`of(...)` / `throwError(...)`) from `HttpService` mocks — not resolved promises
- Cover the denial path of every guard, not just the allow path

### MUST NOT DO

- Instantiate the class under test manually (`new UsersService(new UserRepository())`)
- Call real external services or databases from a unit test
- Import `AppModule` into a unit test module
- Leave a promise assertion without `await` — the test then passes unconditionally
- Ship a mock that only covers the happy path, with no error scenario
- Assert on private methods or properties (`(service as any).buildQuery`)
- Cast a mock with `as any` to satisfy a wide SDK interface — infer the type from the factory instead
- Leave `jest.useFakeTimers()` active past the test that needed it

## Examples

- **Service with a mocked repository** — provide `UsersService` plus a `useValue` mock for `UserRepository`, then assert that `service.create(dto)` calls `repo.save(dto)` and returns the saved user. See [references/test-use-testing-module.md](references/test-use-testing-module.md).
- **Exception paths** — mock `repo.findOne` to return an existing record and assert `service.create(...)` rejects with `ConflictException`; mock it to return `null` and assert `findById(...)` rejects with `NotFoundException`.
- **Guard testing** — compile a module with `RolesGuard` plus a `useValue` mock for `Reflector`, stub `reflector.getAllAndOverride`, and assert `guard.canActivate(context)` returns the expected boolean. Always include the **denial** cases (wrong role, no user at all): a guard that always returned `true` would pass an allow-only suite.
- **Mocked external HTTP service** — provide a `jest.Mocked<HttpService>`, return `of(mockResponse)` for success and `throwError(...)` for timeout/rate-limit cases. See [references/test-mock-external-services.md](references/test-mock-external-services.md).

## References

For more details, consult these reference files (loaded on demand):

- [references/test-mock-external-services.md](references/test-mock-external-services.md) - Mock external services in tests
- [references/test-use-testing-module.md](references/test-use-testing-module.md) - Use Testing Module for unit tests

> These files are only loaded if the agent needs additional context.
