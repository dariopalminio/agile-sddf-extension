---
name: test-nestjs-jest-testing-module
description: Write Unit Tests for NestJS applications using Testing Module and jest
license: MIT
metadata:
  owner: dariopalminio/agile-sddf-extension
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

## Examples

- **Service with a mocked repository** — provide `UsersService` plus a `useValue` mock for `UserRepository`, then assert that `service.create(dto)` calls `repo.save(dto)` and returns the saved user. See [references/test-use-testing-module.md](references/test-use-testing-module.md).
- **Exception paths** — mock `repo.findOne` to return an existing record and assert `service.create(...)` rejects with `ConflictException`; mock it to return `null` and assert `findById(...)` rejects with `NotFoundException`.
- **Guard testing** — compile a module with `RolesGuard` + `Reflector`, stub `reflector.getAllAndOverride`, and assert `guard.canActivate(context)` returns the expected boolean.
- **Mocked external HTTP service** — provide a `jest.Mocked<HttpService>`, return `of(mockResponse)` for success and `throwError(...)` for timeout/rate-limit cases. See [references/test-mock-external-services.md](references/test-mock-external-services.md).

## References

For more details, consult these reference files (loaded on demand):

- [references/test-mock-external-services.md](references/test-mock-external-services.md) - Mock external services in tests
- [references/test-use-testing-module.md](references/test-use-testing-module.md) - Use Testing Module for unit tests

> These files are only loaded if the agent needs additional context.
