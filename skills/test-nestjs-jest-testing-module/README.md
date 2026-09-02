# test-nestjs-jest-testing-module

Write unit tests for NestJS applications using the Testing Module and Jest.

## What it does

Provides guidance for writing unit tests of NestJS services, controllers, guards, interceptors and
pipes in isolation, using `Test.createTestingModule` and Jest. Dependencies are replaced with test
doubles (`useValue` + `jest.fn()`), so the tests stay fast, deterministic and free of side effects.

## When to use

- Writing isolated unit tests for NestJS services, providers, controllers, guards, interceptors or
  pipes with Jest
- Mocking external services (HTTP, repositories, SDKs) so tests never hit the network or a database
- Covering exception paths (`NotFoundException`, `ConflictException`), API timeouts, rate limiting
  and time-dependent logic with `jest.useFakeTimers()`

Not for:

- Full request/response API integration tests — use `test-nestjs-supertest`
- Frontend component tests — use `test-react-testing-library`
- Browser E2E tests — use the Playwright or Cypress skills

## Installation

Install only this skill:

```bash
npx skills add dariopalminio/agile-sddf-extension --skill test-nestjs-jest-testing-module
```

Or install all skills in the repository:

```bash
npx skills add dariopalminio/agile-sddf-extension --all
```

After installation the skill is invoked automatically by context or directly by name.

## Contents

- `SKILL.md` — main instructions
- `references/` — supporting docs loaded on demand

## License

MIT © Dario Palminio
