# Guardrail: Hexagonal architecture invariants for backend

Applies to the business code of any backend built with Hexagonal Architecture (Ports & Adapters),
whatever its framework (NestJS, Express, Fastify, FastAPI, Spring Boot, Rails, Go, .NET, Rust),
ORM, inbound transport (HTTP, gRPC, CLI, queues, cron, serverless handlers) or topology (monolith,
modular monolith, microservices, serverless, event-driven, monorepo), with or without module folders
— its `domain/`, `application/`, `adapters/in/`, `adapters/out/` and `composition/` layers and their
tests. Does not apply to `src/shared/` code without business meaning (base errors, types, pure
utils), to migrations, seeds or build tooling, nor to disposable prototypes with a declared expiry
date. Stack- or topology-specific rules (DI mechanism, ORM, transport, config, event bus, modules)
are extensions declared elsewhere and never relax the rules below. The shell checks are written for
TypeScript; another language keeps the rule ids and swaps the tool (ArchUnit, import-linter,
go-arch-lint, cargo-deny, NetArchTest, packwerk, deptrac).

Rule IDs: `HEX-BE-NN` — unique across this project's guardrails, immutable once published:
never renumbered, never reused.

## Mandatory rules

**On breach:** `(error)` blocks delivery — stop, name the rule id, fix it before continuing.
`(warn)` does not block — apply it, or state why you did not. A semantic rule that fails is raised
for human judgement; never resolve one silently.

### Deterministic rules (dependency-cruiser / grep / find / node)

The `HEX-BE-NN` ids are the rule names declared in `.dependency-cruiser.cjs` and the labels the shell
checks print, both defined in full under *How to run the validation*. Every check accepts a flat
layout (`src/domain/`) and a per-module layout (`src/<module>/domain/`) alike.

#### Dependency direction

- [ ] **HEX-BE-01** `domain/**` imports nothing from `application/**`, `adapters/**` or `composition/**` — dependency-cruiser (error)
- [ ] **HEX-BE-02** `domain/**` imports no external package at all (nothing resolved under `node_modules/`) — dependency-cruiser (error)
- [ ] **HEX-BE-03** `application/**` imports nothing from `adapters/**` or `composition/**` — dependency-cruiser (error)
- [ ] **HEX-BE-04** `adapters/out/**` imports nothing from `adapters/in/**` — dependency-cruiser (error)
- [ ] **HEX-BE-05** Only `composition/**` and `adapters/out/**` itself import from `adapters/out/**` — dependency-cruiser (error)
- [ ] **HEX-BE-06** `src/shared/**` imports nothing from `domain/`, `application/`, `adapters/` or `composition/` — dependency-cruiser (error)

#### Minimum layout

- [ ] **HEX-BE-07** Every root holding a `domain/` (`src/` or `src/<module>/`) also holds `application/`, `adapters/in/`, `adapters/out/` and `composition/` — find (error)
- [ ] **HEX-BE-08** Every such root holds `application/ports/in/` and `domain/ports/out/` — find (error)
- [ ] **HEX-BE-09** No layer-level directory is named `core/`, `business/` or `model/` in place of `domain/` (`domain/model/` is fine) — find (error)
- [ ] **HEX-BE-10** `.dependency-cruiser.cjs` declares rules named `HEX-BE-01` … `HEX-BE-06` and `package.json` declares an `arch:check` script that runs `depcruise` — node (error)

> The NestJS guardrail (`nestjs-hexagonal-backend-checklist.md`) names its layers `api/` and
> `infra/` and its port folders `ports/incoming` and `ports/outgoing`. This guardrail uses
> `adapters/in/`, `adapters/out/`, `ports/in` and `ports/out`, as the backend invariants policy
> does. Do not carry the NestJS names over.

#### Ports, use cases, persistence and purity

- [ ] **HEX-BE-11** Every `application/ports/in/*.ts` exports `interface I<Action>UseCase` (or a `type` of that name) — grep (error)
- [ ] **HEX-BE-12** Every `application/use-cases/*.use-case.ts` declares `class <Action>UseCase implements I<Action>UseCase` — grep (error)
- [ ] **HEX-BE-13** No `IRepository<` generic port and no `IService` port is declared anywhere — grep (error)
- [ ] **HEX-BE-14** No `new <X>Repository(` / `<X>Publisher(` / `<X>Client(` / `<X>Adapter(` / `<X>Gateway(` / `<X>Clock(` / `<X>IdGenerator(` appears in `application/**` or `adapters/in/**` outside tests — grep (error)
- [ ] **HEX-BE-15** Non-test files in `domain/**` contain no `Date.now(`, `new Date()`, `Math.random(`, `randomUUID(`, `process.env`, `fs.` or `crypto.` — grep (error)
- [ ] **HEX-BE-16** Every `adapters/out/persistence/<x>.repository.ts` has a sibling `<x>.mapper.ts` — find (error)
- [ ] **HEX-BE-17** Non-test files in `domain/**` and `application/**` contain no ORM transaction primitive (`.transaction(`, `.$transaction(`, `startTransaction(`, `beginTransaction(`, `withTransaction(`, `queryRunner`, `getManager(`, `dataSource.`, `prisma.`) — grep (error)
- [ ] **HEX-BE-18** Specs under `domain/` and `application/` import nothing from `adapters/` or `composition/` and call no `vi.mock(` / `jest.mock(` — grep (error)

> `HEX-BE-15` and `HEX-BE-17` are proxies, not proofs: a clock injected as a port is fine, a
> transaction reached through a wrapper the grep does not name is not. Purity and the transactional
> boundary are confirmed in `HEX-BE-24` to `HEX-BE-26`.

---

### Semantic rules (AI / human review)

- [ ] **HEX-BE-19** Use cases only orchestrate: every business decision (`if` on domain state, calculation, invariant) lives in an entity, value object or domain service, never in a use case, controller, handler, adapter or mapper.
- [ ] **HEX-BE-20** Adapters translate, never decide: an outgoing adapter converts between the external model (ORM entity, API DTO, message) and the core model, an incoming adapter converts between the external input (HTTP, message, CLI args) and the use-case input, and neither contains a business branch.
- [ ] **HEX-BE-21** Every outgoing port lives in `domain/ports/out/` when it names a business concept (a repository of an aggregate) and in `application/ports/out/` only when it is purely technical (unit of work, clock, id generator, publisher); no port is declared inside an adapter.
- [ ] **HEX-BE-22** Every port is role-specific and its method names use the business language (`findByEmail`, `publishOrder`), never the infrastructure language (`selectWhere`, `insertRow`).
- [ ] **HEX-BE-23** Each use case is one business operation with one incoming port and one implementation; an incoming port with several unrelated methods is several use cases.
- [ ] **HEX-BE-24** The persistence model is distinct from the domain model: no domain entity is persisted directly, the repository mapper is the only place that translates `Domain ↔ PersistenceModel`, and no ORM entity, row, document or database error crosses the `adapters/out/` boundary untranslated.
- [ ] **HEX-BE-25** The domain knows no transactions: atomicity across several writes is delimited in the use case through an `IUnitOfWork`-style port or inside the outgoing adapter, never with ORM primitives in `domain/` or `application/`.
- [ ] **HEX-BE-26** The core is pure: no I/O, no real clock, no real randomness, no framework API; time and identifiers enter through outgoing ports (`IClock`, `IIdGenerator`) injected at construction.
- [ ] **HEX-BE-27** Domain events are published only after the originating transaction has committed (outbox or equivalent), never inside the transaction as if the change were already confirmed.
- [ ] **HEX-BE-28** There is exactly one composition point per execution context (one for a monolith, one per module in a modular monolith, one per service, one per handler or per cold start in serverless), and nothing outside it names a concrete implementation of a port.
- [ ] **HEX-BE-29** Use-case tests use in-memory fakes of the outgoing ports, reusable across tests; they never mock the ORM, the database or the bus. Domain tests need no framework, database, network or file system.
- [ ] **HEX-BE-30** Nothing in `src/shared/` names a business concept: a concept shared by two modules is extracted into a module or a shared core package, or duplicated — never moved to `shared/`.
- [ ] **HEX-BE-31** A project that uses stack-specific folder names (`api/`, `infra/`) declares which folder plays each role in `.dependency-cruiser.cjs`, keeps the `HEX-BE-NN` rule names, and no stack or topology extension contradicts or relaxes any rule of this file.

## Minimum expected structure

```text
src/                                            # or src/<module>/ — same shape inside each module
├── domain/model/{entities,value-objects,aggregates}/   # decides: invariants validated in the constructor
├── domain/ports/out/<entity>.repository.ts     # export interface I<Entity>Repository
├── domain/ports/out/{clock,id-generator}.ts    # time and randomness as ports
├── domain/{services,events,exceptions}/
├── application/ports/in/<action>.use-case.ts   # export interface I<Action>UseCase
├── application/ports/out/unit-of-work.ts       # transactional boundary as a port
├── application/use-cases/<action>.use-case.ts  # class <Action>UseCase implements I<Action>UseCase
├── adapters/in/{http,grpc,cli,consumers,cron}/ # controllers, routes, handlers; consume incoming ports
├── adapters/out/persistence/<x>.repository.ts + <x>.mapper.ts   # Domain ↔ PersistenceModel
├── adapters/out/{messaging,http,cache,clock,id-generator}/      # one outgoing port each; translate only
├── composition/container.ts                    # the only file that names implementations
├── test/fakes/                                 # in-memory fakes of outgoing ports
└── shared/{errors,types,utils}/                # no business meaning
```

```typescript
// application/use-cases/register-user.use-case.ts — receives ports, never implementations
export class RegisterUserUseCase implements IRegisterUserUseCase {
  constructor(
    private readonly users: IUserRepository,
    private readonly uow: IUnitOfWork,
    private readonly clock: IClock,
    private readonly ids: IIdGenerator,
  ) {}
  async execute(input: RegisterUserInput): Promise<Result<UserId, DomainError>> {
    const user = User.register(this.ids.next(), input.email, this.clock.now()); // domain decides
    return this.uow.run(() => this.users.save(user));                           // use case delimits
  }
}
```

```typescript
// adapters/out/persistence/user.repository.ts — translates through the mapper, never returns a row
export class TypeOrmUserRepository implements IUserRepository {
  async findByEmail(email: string): Promise<User | null> {
    const row = await this.repo.findOne({ where: { email } });
    return row ? toDomain(row) : null;
  }
}
```

## How to run the validation

Requires Node ≥ 20.12, dependency-cruiser ≥ 17 and TypeScript 5.x (`npm i -D dependency-cruiser
typescript@5`) — dependency-cruiser 17 does not accept TypeScript 7 and then cruises zero `.ts`
files. Verified with dependency-cruiser 17.4.3 / TypeScript 5.9.3 against a canonical fixture
(0 findings) and a fixture with one breach per rule (every id fired). No published preset covers
these rules; the ruleset below is the norm.

```js
// .dependency-cruiser.cjs — L(x) matches a flat layout (src/<x>/) and a per-module layout
// (src/<module>/<x>/) alike. A project using stack names substitutes `api` for `adapters/in`
// and `infra` for `adapters/out` here; the rule names do not change.
const L = (x) => `^src/(${x}|[^/]+/(${x}))/`;
module.exports = {
  forbidden: [
    { name: 'HEX-BE-01', severity: 'error',
      from: { path: L('domain') },
      to:   { path: L('application|adapters|composition') } },
    { name: 'HEX-BE-02', severity: 'error',
      from: { path: L('domain') },
      to:   { path: '^node_modules/' } },
    { name: 'HEX-BE-03', severity: 'error',
      from: { path: L('application') },
      to:   { path: L('adapters|composition') } },
    { name: 'HEX-BE-04', severity: 'error',
      from: { path: L('adapters/out') },
      to:   { path: L('adapters/in') } },
    { name: 'HEX-BE-05', severity: 'error',
      from: { path: '^src/', pathNot: L('composition|adapters/out') },
      to:   { path: L('adapters/out') } },
    { name: 'HEX-BE-06', severity: 'error',
      from: { path: '^src/shared/' },
      to:   { path: '^src/', pathNot: '^src/shared/' } },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    exclude: { path: '\\.(spec|test)\\.ts$' },
    tsConfig: { fileName: 'tsconfig.json' },
    tsPreCompilationDeps: true,
  },
};
```

```bash
npx depcruise src --config .dependency-cruiser.cjs      # HEX-BE-01 … HEX-BE-06
# package.json → "scripts": { "arch:check": "depcruise src --config .dependency-cruiser.cjs" }

# grep / find / node checks — each prints its rule id followed by the offending paths
fail=0
chk() { [ -z "$2" ] || { printf '%s\n%s\n' "$1" "$2"; fail=1; }; }
roots="$( [ -d src/domain ] && echo src; find src -mindepth 2 -maxdepth 2 -type d -name domain -exec dirname {} \; )"
for r in $roots; do
  for l in domain application composition adapters/in adapters/out; do [ -d "$r/$l" ] || chk HEX-BE-07 "$r/$l"; done
  [ -d "$r/application/ports/in" ] || chk HEX-BE-08 "$r/application/ports/in"
  [ -d "$r/domain/ports/out" ]     || chk HEX-BE-08 "$r/domain/ports/out"
done
chk HEX-BE-09 "$(find src -maxdepth 2 -type d \( -name core -o -name business -o -name model \) -not -path '*/domain/*')"
chk HEX-BE-10 "$(node -e "
const m=[];try{const n=require('./.dependency-cruiser.cjs').forbidden.map(r=>r.name);
for(let i=1;i<=6;i++){const id='HEX-BE-0'+i;n.includes(id)||m.push('.dependency-cruiser.cjs: missing rule '+id)}}
catch(e){m.push('.dependency-cruiser.cjs: '+e.message)}
const s=(require('./package.json').scripts||{})['arch:check']||'';/depcruise/.test(s)||m.push('package.json: scripts.arch:check must run depcruise');
console.log(m.join('\n'))")"
chk HEX-BE-11 "$(for p in $(find src -path '*/application/ports/in/*.ts' ! -name '*.spec.ts'); do grep -qE 'export (interface|type) I[A-Z][A-Za-z0-9]*UseCase\b' "$p" || echo "$p"; done)"
chk HEX-BE-12 "$(for u in $(find src -path '*/application/use-cases/*.use-case.ts'); do grep -qE 'class [A-Z][A-Za-z0-9]*UseCase implements I[A-Z][A-Za-z0-9]*UseCase\b' "$u" || echo "$u"; done)"
chk HEX-BE-13 "$(grep -rnE '\bIRepository<|\bIService\b' --include='*.ts' src)"
chk HEX-BE-14 "$(grep -rnE 'new [A-Z][A-Za-z0-9]*(Repository|Publisher|Client|Adapter|Gateway|Clock|IdGenerator)\(' --include='*.ts' --exclude='*.spec.ts' --exclude='*.test.ts' src | grep -E '/(application|adapters/in)/')"
chk HEX-BE-15 "$(grep -rnE 'Date\.now\(|new Date\(\)|Math\.random\(|randomUUID\(|\bprocess\.env\b|\bfs\.|\bcrypto\.' --include='*.ts' --exclude='*.spec.ts' --exclude='*.test.ts' $(find src -type d -name domain) 2>/dev/null)"
chk HEX-BE-16 "$(for r in $(find src -path '*/adapters/out/persistence/*.repository.ts'); do [ -f "${r%.repository.ts}.mapper.ts" ] || echo "$r"; done)"
chk HEX-BE-17 "$(grep -rnE '\.[$]?transaction\(|startTransaction\(|beginTransaction\(|withTransaction\(|queryRunner|getManager\(|\bdataSource\.|\bprisma\.' --include='*.ts' --exclude='*.spec.ts' --exclude='*.test.ts' $(find src -type d \( -name domain -o -name application \)) 2>/dev/null)"
chk HEX-BE-18 "$(grep -rnE "from ['\"][^'\"]*/(adapters|composition)/|\b(vi|jest)\.mock\(" --include='*.spec.ts' --include='*.test.ts' $(find src -type d \( -name domain -o -name application \)) 2>/dev/null)"
exit $fail
```

## Verification

| Level | Action |
|-------|--------|
| Deterministic | `npm run arch:check` and the shell block above finish with exit code 0 and print no `HEX-BE-NN` id. |
| Semantic | Review the semantic checklist against the diff (AI or human), citing the `HEX-BE-NN` id of each finding, and attach the result to the PR. |

## Source of truth

This guardrail **summarises** the framework- and topology-independent invariants of a hexagonal
backend. The authoritative expansion — definitions, the rationale behind each invariant, the
extension model by stack and topology and the operational steps — lives in
[policies/hexagonal-backend-policy.md](../policies/hexagonal-backend-policy.md), itself grounded
in Alistair Cockburn's *Hexagonal Architecture*, Robert C. Martin's *Clean Architecture*, Eric
Evans' *Domain-Driven Design* and Vaughn Vernon's *Implementing Domain-Driven Design*. Where this
file and that policy disagree, the policy prevails.
