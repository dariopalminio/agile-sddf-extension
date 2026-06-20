# Setup and Teardown

Every API integration test suite needs to bootstrap a real
`INestApplication` once, apply the exact same global config the app uses in
production, and tear it down cleanly afterwards. Skipping any of these steps either makes the test
unrepresentative of production behavior or leaks resources between test
files.

## Canonical pattern

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('UsersController (API integration)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Apply same config as production
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  // describe('/users (POST)', ...) — see references/crud-operations.md
});
```

## Why replicate production config in the test module

`ValidationPipe`, global guards, interceptors, and exception filters only run
if they're registered on the `INestApplication` instance the test creates.
If `main.ts` registers `app.useGlobalPipes(new ValidationPipe(...))` but the
test module doesn't, validation errors that would return `400` in production
silently pass through in the test — the suite turns green while the real app
would reject the request. Always mirror `main.ts` bootstrap calls
(`useGlobalPipes`, `useGlobalGuards`, `useGlobalInterceptors`,
`enableCors`, etc.) in the `beforeAll` block.

## `beforeAll` vs `beforeEach`

Create the app once per file in `beforeAll` — `createTestingModule().compile()`
is expensive, and most suites don't need a fresh app per test. Use
`beforeEach` only for state that must reset between tests (see
[database-isolation.md](database-isolation.md)), not for re-creating the app.

## Always close the app

`afterAll(() => app.close())` is mandatory, not optional — see
[common-pitfalls.md](common-pitfalls.md) (Pitfall 3) for what happens when
it's missing.
