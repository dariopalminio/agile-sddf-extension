# Common Pitfalls

Recurring mistakes that make API integration test suites unreliable or give
false confidence.

## Pitfall 1 — Mislabeling a unit test as integration test coverage

```typescript
// Only unit test controllers
describe('UsersController', () => {
  it('should return users', async () => {
    const service = { findAll: jest.fn().mockResolvedValue([]) };
    const controller = new UsersController(service as any);

    const result = await controller.findAll();

    expect(result).toEqual([]);
    // Doesn't test: routes, guards, pipes, serialization
  });
});
```

This is a valid unit test, but it doesn't exercise routing, guards, pipes,
or serialization — calling it an integration test hides the fact that none
of the HTTP stack was actually verified.

**Fix:** drive the test through `request(app.getHttpServer())` against a
real `INestApplication`, as shown in
[setup-and-teardown.md](setup-and-teardown.md).

## Pitfall 2 — Integration test with no setup/teardown

```typescript
describe('Users API', () => {
  it('should create user', async () => {
    const app = await NestFactory.create(AppModule);
    // No proper initialization
    // No cleanup after test
    // Hits real database
  });
});
```

**Fix:** use `Test.createTestingModule(...).compile()` +
`createNestApplication()` with a proper `beforeAll`/`afterAll`, and point the
module at a test database (see
[database-isolation.md](database-isolation.md)).

## Pitfall 3 — Forgetting `app.close()`

Without `afterAll(() => app.close())`, open handles (DB connections, HTTP
listeners) leak across test files. This shows up as Jest's "A worker process
has failed to exit gracefully" warning and can hang CI runs.

```typescript
// Wrong — no cleanup
beforeAll(async () => {
  app = moduleFixture.createNestApplication();
  await app.init();
});
// missing afterAll

// Correct
afterAll(async () => {
  await app.close();
});
```

## Pitfall 4 — Not applying the same global pipes/middleware as production

If `main.ts` registers `app.useGlobalPipes(new ValidationPipe(...))` but the
test module skips it, requests that should fail validation in production
pass silently in the test — the suite is green but doesn't reflect real
behavior. See [setup-and-teardown.md](setup-and-teardown.md) for the
mirroring pattern.

## Pitfall 5 — Shared mutable state between tests

```typescript
// Wrong — module-level variable reused across it() blocks
let userId: string;

it('creates a user', async () => {
  const res = await request(app.getHttpServer()).post('/users').send({ ... });
  userId = res.body.id; // relies on test order
});

it('deletes the user', async () => {
  await request(app.getHttpServer()).delete(`/users/${userId}`); // breaks if reordered or run in isolation
});
```

Tests that depend on a previous test's side effect become flaky when run in
parallel, reordered, or filtered with `.only`. **Fix:** create whatever state
a test needs inside its own `beforeAll`/`beforeEach`, or inside the test
itself, instead of relying on execution order.

## Pitfall 6 — Hitting the real/production database

Even with correct setup/teardown, pointing the test module's `DataSource` at
the development or production database risks data loss and
non-reproducible test runs. **Fix:** use a dedicated `.env.test` connection
string or an in-memory database — see
[database-isolation.md](database-isolation.md) (Strategy 4).

## Quick reference

| Pitfall | Fix |
|---|---|
| Unit test labeled as integration test | Drive requests through `request(app.getHttpServer())` |
| No setup/teardown | `Test.createTestingModule` + `beforeAll`/`afterAll` |
| Missing `app.close()` | Always close the app in `afterAll` |
| Pipes/middleware not mirrored | Apply the same `useGlobalPipes`/`useGlobalGuards` as `main.ts` |
| Shared mutable state | Create state per test, don't rely on execution order |
| Tests hit the real database | Use `.env.test` or an in-memory DB |
