# Guardrail: Hexagonal architecture (backend)

Applies to every business module under `src/<module>/` of a backend built with Hexagonal
Architecture (Ports & Adapters) on NestJS + TypeScript or an equivalent stack — its `api/`,
`application/`, `domain/` and `infra/` layers, its `<module>.module.ts` composition root and its
tests. Does not apply to `src/shared/` cross-cutting code (logging, tracing, base errors), to
migrations, seeds or build tooling, nor to disposable prototypes with a declared expiry date.

## Mandatory rules

**On breach:** `(error)` blocks delivery — stop, name the rule id, fix it before continuing.
`(warn)` does not block — apply it, or state why you did not. A semantic rule that fails is raised
for human judgement; never resolve one silently.

### Deterministic rules (dependency-cruiser / grep / find / node)

The `hex-*` rule ids are the names declared in `.dependency-cruiser.cjs` and the labels the shell
checks print, both defined in full under *How to run the validation*.

#### Layer dependencies

- [ ] `domain/**` imports nothing from `application/**`, `api/**` or `infra/**` — dependency-cruiser: `hex-domain-no-outer-layers` (error)
- [ ] `domain/**` imports no framework package (`@nestjs/*`, `typeorm`, `mongoose`, `express`, `axios`, `class-validator`) — dependency-cruiser: `hex-domain-no-framework` (error)
- [ ] `application/**` imports nothing from `api/**` or `infra/**` — dependency-cruiser: `hex-application-no-adapters` (error)
- [ ] `infra/**` imports nothing from `api/**` — dependency-cruiser: `hex-infra-no-api` (error)
- [ ] Only `*.module.ts` files and `infra/**` itself import from `infra/**` — dependency-cruiser: `hex-infra-only-from-composition-root` (error)
- [ ] `api/controllers/**` imports nothing from `domain/**`, `infra/**` or `application/use-cases/**` — only incoming ports, DTOs and API mappers — dependency-cruiser: `hex-controller-only-incoming-ports` (error)
- [ ] No module imports `domain/**` or `infra/**` of another module — dependency-cruiser: `hex-no-cross-module-internals` (error)
- [ ] `src/shared/**` imports nothing from any business module — dependency-cruiser: `hex-shared-no-module` (error)

#### Module layout

- [ ] Every directory holding a `<module>.module.ts` also holds `api/`, `application/`, `domain/` and `infra/` — find: `hex-module-four-layers` (error)
- [ ] Every module holds `application/ports/incoming/` and `domain/ports/outgoing/` — find: `hex-ports-folders` (error)
- [ ] Every module holds a `README.md` — find: `hex-module-readme` (error)
- [ ] Every `.ts` file name is kebab-case with dotted role suffixes (`login.use-case.ts`, `email.vo.ts`) — find: `hex-file-kebab-case` (error)
- [ ] Files under `entities/`, `value-objects/`, `aggregates/`, `use-cases/`, `domain/events/` and `infra/events/` carry their role suffix (`.entity.ts`, `.vo.ts`, `.aggregate.ts`, `.use-case.ts`, `.event.ts`, `.handler.ts`) — find: `hex-file-role-suffix` (error)
- [ ] Every `infra/repositories/<x>.repository.ts` has a sibling `<x>.mapper.ts` — find: `hex-repository-has-mapper` (error)
- [ ] `package.json` declares an `arch:check` script that runs `depcruise` — node: `hex-arch-check-script` (error)

#### Ports, use cases and adapters

- [ ] No `@Injectable(` or `@Inject(` decorator appears in `domain/**` — grep: `hex-domain-no-decorators` (error)
- [ ] Every `application/ports/incoming/*.use-case.ts` exports `interface I<Action>UseCase` — grep: `hex-incoming-port-interface` (error)
- [ ] Every `application/use-cases/*.use-case.ts` declares `class <Action>UseCase implements I<Action>UseCase` — grep: `hex-use-case-implements-port` (error)
- [ ] No `new <X>Repository(` / `<X>Hasher(` / `<X>Generator(` / `<X>Sender(` / `<X>Adapter(` / `<X>Client(` appears in `application/**` — grep: `hex-no-new-adapter-in-use-case` (error)
- [ ] `process.env` is read only in `infra/config/**` and `src/main.ts` — grep: `hex-env-only-in-infra-config` (error)
- [ ] Domain specs neither `jest.mock` a framework or ORM package nor import from `infra/` — grep: `hex-domain-test-pure` (error)

#### Domain model

- [ ] No `IRepository<` generic port is declared anywhere — grep: `hex-no-generic-repository` (error)
- [ ] Every file in `domain/exceptions/` references `DomainError` (extends it or a subclass) — grep: `hex-domain-error-hierarchy` (error)
- [ ] Every `domain/events/*.event.ts` exports a class whose name ends in `Event` — grep: `hex-event-class-suffix` (error)
- [ ] `domain/services/**` contains no `async`, `await` or `Promise<` — grep: `hex-domain-service-sync` (warn)

> `hex-domain-service-sync` is a proxy for purity, not a proof of it: a synchronous service can still
> mutate shared state. Its absence of I/O is confirmed in the semantic layer.

---

### Semantic rules (AI / human review)

- [ ] Use cases only orchestrate: every business decision (`if` on domain state, calculation, invariant) lives in an entity, value object or domain service, never in a use case, controller, DTO or mapper.
- [ ] Controllers are thin: they validate format through DTOs and pipes, map to the application input and delegate to the incoming port; they contain no business branching.
- [ ] Entities carry identity and lifecycle; value objects are immutable and validate their invariants in the constructor, so an invalid instance cannot exist.
- [ ] Domain services are pure: no I/O, no clock or random access, no mutation outside the objects they receive.
- [ ] `PasswordHasher`, `TokenGenerator`, `EmailSender` and any other technical capability is declared as an outgoing port and implemented in `infra/`, never modelled as a domain service.
- [ ] Every outgoing port is role-specific and its method names use the domain language (`findByEmail`, not `selectWhereEmailEquals`); a technical port placed in `application/ports/outgoing/` is justified in the module ADR.
- [ ] Each adapter implements exactly one outgoing port; the repository returns domain entities and the mapper only translates — no ORM model, `Document` or database error crosses the `infra/` boundary untranslated.
- [ ] No domain entity is serialised into an HTTP response; API DTOs are specific to the API and are not reused as application DTOs or entities.
- [ ] Every `DomainError` carries a protocol-independent business code; the HTTP status is chosen by the global `DomainExceptionFilter`, never by a controller or adapter, and no `DomainError` surfaces as a 500.
- [ ] Domain events are named in the past tense, published after the write transaction commits, and their handlers in `infra/events/` are idempotent.
- [ ] The domain knows no transactions; atomicity across several operations goes through an `IUnitOfWork`-style port or the infrastructure adapter, never through ORM primitives in `application/`.
- [ ] Use-case tests use in-memory fakes of the outgoing ports, not ORM-specific doubles; domain tests need no NestJS, database or HTTP.
- [ ] Nothing in `src/shared/` names a business concept; whatever is specific to one module lives in that module.
- [ ] The module `README.md` lists its ports, use cases, adapters and ADR, and any deviation from these rules is recorded as an ADR under `docs/adr/` with context, decision, consequences and review date.

## Minimum expected structure

```text
src/<module>/
├── api/controllers/<module>.controller.ts        # imports only I<Action>UseCase + DTOs + api mappers
├── api/dtos/ · api/mappers/
├── application/ports/incoming/<action>.use-case.ts   # export interface I<Action>UseCase
├── application/use-cases/<action>.use-case.ts        # class <Action>UseCase implements I<Action>UseCase
├── domain/model/{entities,value-objects,aggregates}/
├── domain/ports/outgoing/<entity>.repository.ts      # export interface I<Entity>Repository
├── domain/{services,events,exceptions}/
├── infra/repositories/<entity>.repository.ts + <entity>.mapper.ts + <entity>.schema.ts
├── infra/{services,events,config}/
├── README.md
└── <module>.module.ts                                # the only place that names implementations
```

```typescript
// application/ports/incoming/login.use-case.ts — port and DI token share the name
export interface ILoginUseCase {
  execute(input: LoginInput): Promise<Result<LoginOutput, DomainError>>;
}
export const ILoginUseCase = Symbol('ILoginUseCase');

// application/use-cases/login.use-case.ts — receives ports, never implementations
export class LoginUseCase implements ILoginUseCase {
  constructor(
    private readonly users: IUserRepository,
    private readonly hasher: IPasswordHasher,
  ) {}
  async execute(input: LoginInput): Promise<Result<LoginOutput, DomainError>> { /* orchestrate only */ }
}
```

```typescript
// <module>.module.ts — composition root: port → implementation
providers: [
  { provide: IUserRepository, useClass: MongoUserRepository },
  { provide: IPasswordHasher, useClass: BcryptPasswordHasher },
  { provide: ILoginUseCase,   useClass: LoginUseCase },
]
```

## How to run the validation

Requires Node ≥ 20.12, dependency-cruiser ≥ 17 and TypeScript 5.x (`npm i -D dependency-cruiser
typescript@5`) — dependency-cruiser 17 does not accept TypeScript 7 and then cruises zero `.ts`
files. Verified with dependency-cruiser 17.4.3 / TypeScript 5.9.3. No published preset covers these
rules; the ruleset below is the norm.

```js
// .dependency-cruiser.cjs
module.exports = {
  forbidden: [
    { name: 'hex-domain-no-outer-layers', severity: 'error',
      from: { path: '^src/[^/]+/domain/' },
      to:   { path: '^src/[^/]+/(application|api|infra)/' } },
    { name: 'hex-domain-no-framework', severity: 'error',
      from: { path: '^src/[^/]+/domain/' },
      to:   { path: '^node_modules/(@nestjs|typeorm|mongoose|express|axios|class-validator)/' } },
    { name: 'hex-application-no-adapters', severity: 'error',
      from: { path: '^src/[^/]+/application/' },
      to:   { path: '^src/[^/]+/(api|infra)/' } },
    { name: 'hex-infra-no-api', severity: 'error',
      from: { path: '^src/[^/]+/infra/' },
      to:   { path: '^src/[^/]+/api/' } },
    { name: 'hex-infra-only-from-composition-root', severity: 'error',
      from: { path: '^src/', pathNot: ['\\.module\\.ts$', '^src/[^/]+/infra/'] },
      to:   { path: '^src/[^/]+/infra/' } },
    { name: 'hex-controller-only-incoming-ports', severity: 'error',
      from: { path: '^src/[^/]+/api/controllers/' },
      to:   { path: '^src/[^/]+/(domain|infra|application/use-cases)/' } },
    { name: 'hex-no-cross-module-internals', severity: 'error',
      from: { path: '^src/([^/]+)/' },
      to:   { path: '^src/[^/]+/(domain|infra)/', pathNot: '^src/$1/' } },
    { name: 'hex-shared-no-module', severity: 'error',
      from: { path: '^src/shared/' },
      to:   { path: '^src/', pathNot: '^src/shared/' } },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    exclude: { path: '\\.spec\\.ts$' },
    tsConfig: { fileName: 'tsconfig.json' },
    tsPreCompilationDeps: true,
  },
};
```

```bash
npx depcruise src --config .dependency-cruiser.cjs      # hex-domain-no-outer-layers … hex-shared-no-module
# package.json → "scripts": { "arch:check": "depcruise src --config .dependency-cruiser.cjs" }

# grep / find checks — each prints its rule id followed by the offending paths
fail=0
chk()  { [ -z "$2" ] || { printf '%s\n%s\n' "$1" "$2"; fail=1; }; }
warn() { [ -z "$2" ] || printf '%s (warn)\n%s\n' "$1" "$2"; }
for m in $(find src -mindepth 2 -maxdepth 2 -name '*.module.ts' -not -path 'src/shared/*'); do d=$(dirname "$m")
  for l in api application domain infra; do [ -d "$d/$l" ] || chk hex-module-four-layers "$d/$l"; done
  [ -d "$d/application/ports/incoming" ] || chk hex-ports-folders "$d/application/ports/incoming"
  [ -d "$d/domain/ports/outgoing" ]      || chk hex-ports-folders "$d/domain/ports/outgoing"
  [ -f "$d/README.md" ]                  || chk hex-module-readme "$d/README.md"
done
chk hex-file-kebab-case  "$(find src -name '*.ts' | grep -vE '/[a-z0-9]+(-[a-z0-9]+)*(\.[a-z]+(-[a-z]+)*)*\.ts$')"
chk hex-file-role-suffix "$(find src -name '*.ts' ! -name '*.spec.ts' \( \
  \( -path '*/domain/model/entities/*'      ! -name '*.entity.ts' \) -o \
  \( -path '*/domain/model/value-objects/*' ! -name '*.vo.ts' \) -o \
  \( -path '*/domain/model/aggregates/*'    ! -name '*.aggregate.ts' \) -o \
  \( -path '*/application/use-cases/*'      ! -name '*.use-case.ts' \) -o \
  \( -path '*/domain/events/*'              ! -name '*.event.ts' \) -o \
  \( -path '*/infra/events/*'               ! -name '*.handler.ts' \) \))"
chk hex-repository-has-mapper "$(for r in $(find src -path '*/infra/repositories/*.repository.ts'); do [ -f "${r%.repository.ts}.mapper.ts" ] || echo "$r"; done)"
chk hex-arch-check-script "$(node -e "const s=require('./package.json').scripts||{};if(!/depcruise/.test(s['arch:check']||''))console.log('package.json: scripts.arch:check must run depcruise')")"
chk hex-domain-no-decorators      "$(grep -rnE '@(Injectable|Inject)\(' --include='*.ts' src/*/domain 2>/dev/null)"
chk hex-incoming-port-interface   "$(for p in $(find src -path '*/application/ports/incoming/*.use-case.ts'); do grep -qE 'export interface I[A-Z][A-Za-z0-9]*UseCase\b' "$p" || echo "$p"; done)"
chk hex-use-case-implements-port  "$(for u in $(find src -path '*/application/use-cases/*.use-case.ts'); do grep -qE 'class [A-Z][A-Za-z0-9]*UseCase implements I[A-Z][A-Za-z0-9]*UseCase\b' "$u" || echo "$u"; done)"
chk hex-no-new-adapter-in-use-case "$(grep -rnE 'new [A-Z][A-Za-z0-9]*(Repository|Hasher|Generator|Sender|Adapter|Client)\(' --include='*.ts' src/*/application 2>/dev/null)"
chk hex-env-only-in-infra-config  "$(grep -rn 'process\.env' --include='*.ts' src | grep -vE '/infra/config/|^src/main\.ts')"
chk hex-domain-test-pure          "$(grep -rnE "jest\.mock\(['\"](@nestjs|typeorm|mongoose|express)|from ['\"][^'\"]*/infra/" --include='*.spec.ts' src/*/domain 2>/dev/null)"
chk hex-no-generic-repository     "$(grep -rnE '\bIRepository<' --include='*.ts' src)"
chk hex-domain-error-hierarchy    "$(grep -rL 'DomainError' --include='*.ts' src/*/domain/exceptions 2>/dev/null)"
chk hex-event-class-suffix        "$(grep -rLE 'export class [A-Z][A-Za-z0-9]*Event\b' --include='*.event.ts' src/*/domain/events 2>/dev/null)"
warn hex-domain-service-sync      "$(grep -rnE '\b(async|await|Promise<)' --include='*.ts' src/*/domain/services 2>/dev/null)"
exit $fail
```

## Verification

| Level | Action |
|-------|--------|
| Deterministic | `npm run arch:check` and the shell block above finish with exit code 0 and print no `hex-*` id. |
| Semantic | Review the semantic checklist against the diff (AI or human), quoting the rule that fails for each finding, and attach the result to the PR. |

## Source of truth

This guardrail **summarises** the Ports & Adapters rules enforceable on a backend module. The
authoritative expansion — layer responsibilities, aggregate design, domain events, CQRS and the
rationale behind each rule — lives in Alistair Cockburn's
[Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/), Robert C. Martin's
*Clean Architecture* and Eric Evans' *Domain-Driven Design*. Where this file and the architecture
policy of the project being built disagree, that project's policy prevails.
