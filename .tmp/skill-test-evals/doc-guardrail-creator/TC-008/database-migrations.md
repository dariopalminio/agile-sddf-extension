# Guardrail: Database Migrations

Applies to every TypeORM schema-changing migration under `migrations/` in a NestJS service. Does not apply to seed/data-only scripts that touch no schema, or to non-relational stores (Mongo, Redis, S3).

## Mandatory rules

**On breach:** `(error)` blocks delivery — stop, name the rule id, fix it before continuing.
`(warn)` does not block — apply it, or state why you did not. A semantic rule that fails is raised
for human judgement; never resolve one silently.

### Deterministic rules (ESLint / grep / git check-ignore)

#### Migration authoring & structure

- [ ] Every DDL statement (`ALTER TABLE`, `CREATE TABLE`, `DROP TABLE`, `CREATE INDEX`) runs inside a `queryRunner.query()` call in a file under `migrations/`, never from application code — ESLint: `db-no-ddl-outside-migrations` (error)
- [ ] Every migration class implements both `up` and `down` — grep (error)
- [ ] Migration files are named `<epoch-timestamp>-<PascalCaseName>.ts`, so `typeorm migration:run` orders them chronologically — glob (error)
- [ ] The exported migration class `name` property matches the class name — grep (warn)
- [ ] Migration files type-check — `tsc --noEmit` (error)
- [ ] No migration file imports application code from `src/` (services, controllers, entity business logic); only `typeorm` and its `QueryRunner` — ESLint: `db-no-app-imports-in-migration` (error)

#### Configuration & safety

- [ ] `synchronize` is `false` wherever the DataSource config resolves for production — grep (error)
- [ ] Every `DROP COLUMN` / `DROP TABLE` statement in a migration is flagged for manual sign-off — grep (warn)
- [ ] No hardcoded database credential (connection string, password literal) in `data-source.ts` or a migration file; values come from `ConfigService` / `process.env` — ESLint: `db-no-hardcoded-db-credentials` (error)
- [ ] `.env` and any file holding real database credentials are git-ignored — `git check-ignore` (error)
- [ ] `migrationsRun` (or the runner's documented equivalent) is set so migrations execute on deploy, never by hand against production — grep (warn)

---

### Semantic rules (AI / human review)

- [ ] `down()` fully reverses everything `up()` does, including data copies, not only the DDL.
- [ ] A backfill default for a new `NOT NULL` column preserves the real meaning of existing rows, not just a placeholder that satisfies the constraint.
- [ ] A destructive statement (`DROP COLUMN`, `DROP TABLE`) follows the expand-and-contract pattern: it ships only after the replacement column or table has been live and verified, never in the same migration that introduces the replacement.
- [ ] New column, table and index names follow the domain's existing naming conventions rather than introducing a new one.
- [ ] The migration's data-transformation step is idempotent and safe to re-run if the migration is retried after a partial failure.
- [ ] No credentials or personal data are embedded in migration seed or fixture data.

## Minimum expected structure

```
project/
├── src/
│   └── data-source.ts                        ← synchronize: false, migrations: ['dist/migrations/*.js']
└── migrations/
    └── 1705312800000-AddUserAge.ts           ← implements up() and down()
```

```typescript
// migrations/1705312800000-AddUserAge.ts
export class AddUserAge1705312800000 implements MigrationInterface {
  name = 'AddUserAge1705312800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ADD "age" integer DEFAULT 0`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "age"`);
  }
}
```

## How to run the validation

```bash
npx tsc --noEmit                            # migration files type-check
npx eslint migrations src/data-source.ts    # rules of the deterministic table

# every migration implements down()
grep -rL 'public async down' migrations/*.ts   # must print nothing

# migration filenames carry a 13-digit epoch prefix and PascalCase name
node -e "const fs=require('fs');const bad=fs.readdirSync('migrations').filter(f=>!/^\d{13}-[A-Z][A-Za-z0-9]*\.ts$/.test(f));if(bad.length)throw Error('bad migration filenames: '+bad.join(', '))"

# grep-level checks
grep -q 'synchronize: false' src/data-source.ts
grep -rn 'DROP COLUMN\|DROP TABLE' migrations/*.ts   # manual sign-off list (warn), review each hit
git check-ignore -q .env && echo ".env ignored"
```

`db-no-ddl-outside-migrations`, `db-no-app-imports-in-migration` and `db-no-hardcoded-db-credentials`
are not a published plugin: they are project-specific `no-restricted-syntax` entries, defined here in
full.

```javascript
// eslint.config.mjs (ESLint 9+)
export default [
  {
    files: ['src/**/*.ts'],
    ignores: ['migrations/**'],
    rules: {
      'no-restricted-syntax': ['error',
        { selector: "CallExpression[callee.property.name='query'] Literal[value=/ALTER TABLE|CREATE TABLE|DROP TABLE|CREATE INDEX/i]",
          message: 'db-no-ddl-outside-migrations: DDL runs only inside a migration file.' },
      ],
    },
  },
  {
    files: ['migrations/**/*.ts'],
    rules: {
      'no-restricted-imports': ['error', { patterns: [{
        group: ['**/src/**', '@/*'],
        message: 'db-no-app-imports-in-migration: migrations depend only on typeorm.',
      }] }],
      'no-restricted-syntax': ['error',
        { selector: "Literal[value=/^(postgres|mysql|mongodb):\\/\\/.*:.*@/]",
          message: 'db-no-hardcoded-db-credentials: read credentials from ConfigService or process.env.' },
      ],
    },
  },
  {
    files: ['src/data-source.ts'],
    rules: {
      'no-restricted-syntax': ['error',
        { selector: "Property[key.name='password'] Literal[value!='']",
          message: 'db-no-hardcoded-db-credentials: read credentials from ConfigService or process.env.' },
      ],
    },
  },
];
```

ESLint 9's flat config is assumed; on ESLint 8 the same rule blocks move into `.eslintrc` `overrides`.

## Rollback expectations

Revert by running the migration's `down()` — `typeorm migration:revert -d src/data-source.ts` —
before rolling back the application deploy that depended on it. If `down()` cannot cleanly undo a
destructive change (a dropped column or table with no retained backup), restore from the
pre-migration database snapshot instead of attempting a partial revert. Sign-off: the engineer who
authored the migration, or the on-call database owner if the author is unavailable.

## Verification

| Level | Action |
|-------|--------|
| Deterministic | Run the commands above; ESLint and `tsc` must report zero errors, and every grep/git check must succeed or return an empty result. |
| Semantic | Review the semantic checklist against the diff (AI or human reviewer) and attach the result to the PR. |

## Source of truth

This guardrail **summarises** the TypeORM migration rules so they fit in a single pass of the
harness. The authoritative expansion — setup, transaction management, N+1 avoidance, and other
database concerns — lives in `skills/code-backend-nestjs/references/db-use-migrations.md`. Where
this file and that reference disagree, the reference prevails.
