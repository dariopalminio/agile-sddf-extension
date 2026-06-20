# Database Isolation

Integration tests must run against a clean, predictable database state. Pick
one of these strategies based on how much speed vs. realism the suite needs.

## Strategy 1 — Full schema synchronize on each test

Wipe and recreate the entire schema before every test. Simplest to set up,
but slow on large schemas since it drops and recreates every table each run.

```typescript
describe('Orders API (API integration)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: '.env.test', // Test database config
        }),
        AppModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    dataSource = moduleFixture.get(DataSource);
    await app.init();
  });

  beforeEach(async () => {
    // Clean database between tests
    await dataSource.synchronize(true);
  });

  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
  });
});
```

## Strategy 2 — Transactional rollback per test

Wrap each test in a transaction and roll it back afterwards instead of
touching the schema. Fast, but only works if the application code under
test executes its queries through the same `QueryRunner`/connection the test
controls — it won't isolate writes made through a separate pooled connection.

```typescript
let queryRunner: QueryRunner;

beforeEach(async () => {
  queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();
});

afterEach(async () => {
  await queryRunner.rollbackTransaction();
  await queryRunner.release();
});
```

## Strategy 3 — Truncate touched tables in `afterEach`

Instead of synchronizing the whole schema, clear only the tables the suite
actually writes to. Faster than Strategy 1 once the schema grows, at the
cost of having to keep the truncate list in sync with the tables the suite
touches.

```typescript
afterEach(async () => {
  await dataSource.query('TRUNCATE TABLE "orders" CASCADE');
});
```

## Strategy 4 — Isolated test database / in-memory database

Point the test module at a dedicated database instance via
`ConfigModule.forRoot({ envFilePath: '.env.test' })` (as in Strategy 1)
rather than reusing the development/production connection string — this
protects real data even if a wipe strategy has a bug. For suites that don't
need full SQL-dialect fidelity, swapping in an in-memory engine (e.g.
`better-sqlite3`) for the TypeORM connection during tests makes CI runs
faster, at the cost of not catching dialect-specific SQL bugs (e.g. Postgres
`JSONB` operators that SQLite doesn't support).

## Choosing a strategy

| Strategy | Speed | Realism | Best for |
|---|---|---|---|
| 1. Full synchronize | Slow | High | Small schemas, simplicity over speed |
| 2. Transactional rollback | Fast | High | Suites where the app shares the test's connection |
| 3. Truncate touched tables | Medium | High | Larger schemas, stable table list |
| 4. Isolated/in-memory DB | Fast (in-memory) | Lower (in-memory) | Large CI suites, fast feedback loops |

Whichever strategy is used, never point integration tests at the
real/production database — see [common-pitfalls.md](common-pitfalls.md)
(Pitfall 6).
