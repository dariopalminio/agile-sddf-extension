# Guardrail: Hexagonal architecture invariants for frontend

Applies to the business code of any frontend built with Hexagonal Architecture (Ports & Adapters),
whatever its UI framework (React, Vue, Angular, Svelte, Solid, Lit), meta-framework (Next, Nuxt,
SvelteKit, Remix, Astro), platform (web, mobile, desktop, extension, CLI) or topology (pure
frontend, BFF, full-stack, monorepo), with or without feature folders — its `domain/`,
`application/`, `adapters/in/`, `adapters/out/` and `composition/` layers and their tests. Does not
apply to `src/shared/` code without business meaning (base errors, types, pure utils, design
system), to build tooling, nor to disposable prototypes with a declared expiry date. Stack- or
topology-specific rules (DI mechanism, routing, state library, server/client boundary, features)
are extensions declared elsewhere and never relax the rules below.

Rule IDs: `HEX-FE-NN` — unique across this project's guardrails, immutable once published:
never renumbered, never reused.

## Mandatory rules

**On breach:** `(error)` blocks delivery — stop, name the rule id, fix it before continuing.
`(warn)` does not block — apply it, or state why you did not. A semantic rule that fails is raised
for human judgement; never resolve one silently.

### Deterministic rules (dependency-cruiser / grep / find / node)

The `HEX-FE-NN` ids are the rule names declared in `.dependency-cruiser.cjs` and the labels the shell
checks print, both defined in full under *How to run the validation*. Every check accepts a flat
layout (`src/domain/`) and a per-feature layout (`src/<feature>/domain/`) alike.

#### Dependency direction

- [ ] **HEX-FE-01** `domain/**` imports nothing from `application/**`, `adapters/**` or `composition/**` — dependency-cruiser (error)
- [ ] **HEX-FE-02** `domain/**` imports no external package at all (nothing resolved under `node_modules/`) — dependency-cruiser (error)
- [ ] **HEX-FE-03** `application/**` imports nothing from `adapters/**` or `composition/**` — dependency-cruiser (error)
- [ ] **HEX-FE-04** `adapters/out/**` imports nothing from `adapters/in/**` — dependency-cruiser (error)
- [ ] **HEX-FE-05** Only `composition/**` and `adapters/out/**` itself import from `adapters/out/**` — dependency-cruiser (error)
- [ ] **HEX-FE-06** `src/shared/**` imports nothing from `domain/`, `application/`, `adapters/` or `composition/` — dependency-cruiser (error)

#### Minimum layout

- [ ] **HEX-FE-07** Every root holding a `domain/` (`src/` or `src/<feature>/`) also holds `application/`, `adapters/in/`, `adapters/out/` and `composition/` — find (error)
- [ ] **HEX-FE-08** Every such root holds `application/ports/in/` and `domain/ports/out/` — find (error)
- [ ] **HEX-FE-09** No layer-level directory is named `core/`, `business/` or `model/` in place of `domain/` (`domain/model/` is fine) — find (error)
- [ ] **HEX-FE-10** `.dependency-cruiser.cjs` declares rules named `HEX-FE-01` … `HEX-FE-06` and `package.json` declares an `arch:check` script that runs `depcruise` — node (error)

> The NestJS backend guardrail names its port folders `ports/incoming` and `ports/outgoing`. This
> guardrail uses `ports/in` and `ports/out`, as the frontend invariants policy does. Do not carry
> the backend names over.

#### Ports, use cases and purity

- [ ] **HEX-FE-11** Every `application/ports/in/*.ts` exports `interface I<Action>UseCase` (or a `type` of that name) — grep (error)
- [ ] **HEX-FE-12** Every `application/use-cases/*.use-case.ts` declares `class <Action>UseCase implements I<Action>UseCase` — grep (error)
- [ ] **HEX-FE-13** No `IRepository<` generic port and no `IService` port is declared anywhere — grep (error)
- [ ] **HEX-FE-14** No `new <X>Repository(` / `<X>Gateway(` / `<X>Adapter(` / `<X>Client(` / `<X>Store(` / `<X>Storage(` appears in `application/**` or `adapters/in/**` outside tests — grep (error)
- [ ] **HEX-FE-15** Non-test files in `domain/**` contain no `window.`, `document.`, `localStorage.`, `sessionStorage.`, `indexedDB.`, `globalThis.`, `fetch(`, `Date.now(`, `new Date()` or `Math.random(` — grep (error)
- [ ] **HEX-FE-16** Specs under `domain/` and `application/` import nothing from `adapters/` or `composition/` and call no `vi.mock(` / `jest.mock(` — grep (error)

> `HEX-FE-15` is a proxy for purity, not a proof of it: a clock or id generator injected as a port
> is fine, a hidden side effect through a sibling module is not. Purity is confirmed in
> `HEX-FE-22`.

---

### Semantic rules (AI / human review)

- [ ] **HEX-FE-17** Use cases only orchestrate: every business decision (`if` on domain state, calculation, invariant) lives in an entity, value object or domain service, never in a use case, UI component, hook, adapter or mapper.
- [ ] **HEX-FE-18** Adapters translate, never decide: an outgoing adapter converts between the external model and the core model, an incoming adapter converts between the external input and the use-case input, and neither contains a business branch.
- [ ] **HEX-FE-19** Every outgoing port lives in `domain/ports/out/` when it names a business concept (a repository of an aggregate) and in `application/ports/out/` only when it is purely technical (clock, analytics, storage); no port is declared inside an adapter.
- [ ] **HEX-FE-20** Every port is role-specific and its method names use the business language (`findByEmail`, `publishOrder`), never the infrastructure language (`getUserFromApi`, `postJson`).
- [ ] **HEX-FE-21** Each use case is one business operation with one incoming port and one implementation; an incoming port with several unrelated methods is several use cases.
- [ ] **HEX-FE-22** The core is pure: no I/O, no real clock, no real randomness, no framework API; whatever it needs from the outside enters through an outgoing port injected at construction.
- [ ] **HEX-FE-23** There is exactly one composition point per execution context (one for a SPA; a second one only for a second context such as the server side of a meta-framework), and nothing outside it names a concrete implementation of a port.
- [ ] **HEX-FE-24** Use-case tests use in-memory fakes of the outgoing ports, reusable across tests; they never mock an HTTP client, a store or an SDK. Domain tests need no UI framework, DOM, network or storage.
- [ ] **HEX-FE-25** Nothing in `src/shared/` names a business concept: a concept shared by two features is extracted into a feature or a shared core package, or duplicated — never moved to `shared/`.
- [ ] **HEX-FE-26** A project that uses stack-specific folder names (`ui/`, `infra/`, `api/`) declares which folder plays each role in `.dependency-cruiser.cjs`, keeps the `HEX-FE-NN` rule names, and no stack or topology extension contradicts or relaxes any rule of this file.

## Minimum expected structure

```text
src/                                          # or src/<feature>/ — same shape inside each feature
├── domain/model/<entity>.entity.ts           # decides: invariants validated in the constructor
├── domain/ports/out/<entity>.repository.ts   # export interface I<Entity>Repository
├── domain/{services,events,exceptions}/
├── application/ports/in/<action>.use-case.ts # export interface I<Action>UseCase
├── application/use-cases/<action>.use-case.ts# class <Action>UseCase implements I<Action>UseCase
├── application/{dtos,mappers}/
├── adapters/in/<stack>/                      # components, hooks, composables, actions, handlers
├── adapters/out/<http|storage|analytics>/    # implements one outgoing port each; translates only
├── composition/container.ts                  # the only file that names implementations
├── test/fakes/                               # in-memory fakes of outgoing ports
└── shared/{errors,types,utils}/              # no business meaning
```

```typescript
// application/ports/in/login.use-case.ts — the contract the incoming adapter consumes
export interface ILoginUseCase {
  execute(input: LoginInput): Promise<Result<LoginOutput, DomainError>>;
}

// application/use-cases/login.use-case.ts — receives ports, never implementations
export class LoginUseCase implements ILoginUseCase {
  constructor(private readonly users: IUserRepository, private readonly clock: IClock) {}
  async execute(input: LoginInput): Promise<Result<LoginOutput, DomainError>> { /* orchestrate only */ }
}
```

```typescript
// composition/container.ts — the single wiring point: port → implementation
export const buildDependencies = (): Dependencies => {
  const users: IUserRepository = new UserHttpRepository(httpClient);
  const clock: IClock = new SystemClock();
  return { login: new LoginUseCase(users, clock) };
};
```

## How to run the validation

Requires Node ≥ 20.12, dependency-cruiser ≥ 17 and TypeScript 5.x (`npm i -D dependency-cruiser
typescript@5`) — dependency-cruiser 17 does not accept TypeScript 7 and then cruises zero `.ts`
files. Verified with dependency-cruiser 17.4.3 / TypeScript 5.9.3 against a canonical fixture
(0 findings) and a fixture with one breach per rule (every id fired). No published preset covers
these rules; the ruleset below is the norm.

```js
// .dependency-cruiser.cjs — L(x) matches a flat layout (src/<x>/) and a per-feature layout
// (src/<feature>/<x>/) alike. A project using stack names substitutes `ui` for `adapters/in`
// and `infra` for `adapters/out` here; the rule names do not change.
const L = (x) => `^src/(${x}|[^/]+/(${x}))/`;
module.exports = {
  forbidden: [
    { name: 'HEX-FE-01', severity: 'error',
      from: { path: L('domain') },
      to:   { path: L('application|adapters|composition') } },
    { name: 'HEX-FE-02', severity: 'error',
      from: { path: L('domain') },
      to:   { path: '^node_modules/' } },
    { name: 'HEX-FE-03', severity: 'error',
      from: { path: L('application') },
      to:   { path: L('adapters|composition') } },
    { name: 'HEX-FE-04', severity: 'error',
      from: { path: L('adapters/out') },
      to:   { path: L('adapters/in') } },
    { name: 'HEX-FE-05', severity: 'error',
      from: { path: '^src/', pathNot: L('composition|adapters/out') },
      to:   { path: L('adapters/out') } },
    { name: 'HEX-FE-06', severity: 'error',
      from: { path: '^src/shared/' },
      to:   { path: '^src/', pathNot: '^src/shared/' } },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    exclude: { path: '\\.(spec|test)\\.tsx?$' },
    tsConfig: { fileName: 'tsconfig.json' },
    tsPreCompilationDeps: true,
  },
};
```

```bash
npx depcruise src --config .dependency-cruiser.cjs      # HEX-FE-01 … HEX-FE-06
# package.json → "scripts": { "arch:check": "depcruise src --config .dependency-cruiser.cjs" }

# grep / find / node checks — each prints its rule id followed by the offending paths
fail=0
chk() { [ -z "$2" ] || { printf '%s\n%s\n' "$1" "$2"; fail=1; }; }
roots="$( [ -d src/domain ] && echo src; find src -mindepth 2 -maxdepth 2 -type d -name domain -exec dirname {} \; )"
for r in $roots; do
  for l in domain application composition adapters/in adapters/out; do [ -d "$r/$l" ] || chk HEX-FE-07 "$r/$l"; done
  [ -d "$r/application/ports/in" ] || chk HEX-FE-08 "$r/application/ports/in"
  [ -d "$r/domain/ports/out" ]     || chk HEX-FE-08 "$r/domain/ports/out"
done
chk HEX-FE-09 "$(find src -maxdepth 2 -type d \( -name core -o -name business -o -name model \) -not -path '*/domain/*')"
chk HEX-FE-10 "$(node -e "
const m=[];try{const n=require('./.dependency-cruiser.cjs').forbidden.map(r=>r.name);
for(let i=1;i<=6;i++){const id='HEX-FE-0'+i;n.includes(id)||m.push('.dependency-cruiser.cjs: missing rule '+id)}}
catch(e){m.push('.dependency-cruiser.cjs: '+e.message)}
const s=(require('./package.json').scripts||{})['arch:check']||'';/depcruise/.test(s)||m.push('package.json: scripts.arch:check must run depcruise');
console.log(m.join('\n'))")"
chk HEX-FE-11 "$(for p in $(find src -path '*/application/ports/in/*.ts' ! -name '*.spec.ts'); do grep -qE 'export (interface|type) I[A-Z][A-Za-z0-9]*UseCase\b' "$p" || echo "$p"; done)"
chk HEX-FE-12 "$(for u in $(find src -path '*/application/use-cases/*.use-case.ts'); do grep -qE 'class [A-Z][A-Za-z0-9]*UseCase implements I[A-Z][A-Za-z0-9]*UseCase\b' "$u" || echo "$u"; done)"
chk HEX-FE-13 "$(grep -rnE '\bIRepository<|\bIService\b' --include='*.ts' --include='*.tsx' src)"
chk HEX-FE-14 "$(grep -rnE 'new [A-Z][A-Za-z0-9]*(Repository|Gateway|Adapter|Client|Store|Storage)\(' --include='*.ts' --include='*.tsx' --exclude='*.spec.ts' --exclude='*.test.ts' src | grep -E '/(application|adapters/in)/')"
chk HEX-FE-15 "$(grep -rnE '\b(window|document|localStorage|sessionStorage|indexedDB|globalThis)\.|\bfetch\(|Date\.now\(|new Date\(\)|Math\.random\(' --include='*.ts' --include='*.tsx' --exclude='*.spec.ts' --exclude='*.test.ts' $(find src -type d -name domain) 2>/dev/null)"
chk HEX-FE-16 "$(grep -rnE "from ['\"][^'\"]*/(adapters|composition)/|\b(vi|jest)\.mock\(" --include='*.spec.ts' --include='*.test.ts' --include='*.spec.tsx' --include='*.test.tsx' $(find src -type d \( -name domain -o -name application \)) 2>/dev/null)"
exit $fail
```

## Verification

| Level | Action |
|-------|--------|
| Deterministic | `npm run arch:check` and the shell block above finish with exit code 0 and print no `HEX-FE-NN` id. |
| Semantic | Review the semantic checklist against the diff (AI or human), citing the `HEX-FE-NN` id of each finding, and attach the result to the PR. |

## Source of truth

This guardrail **summarises** the framework- and topology-independent invariants of a hexagonal
frontend. The authoritative expansion — definitions, the rationale behind each invariant, the
extension model by stack and topology and the operational steps — lives in
[policies/hexagonal-frontend-policy.md](../policies/hexagonal-frontend-policy.md), itself grounded
in Alistair Cockburn's *Hexagonal Architecture*, Robert C. Martin's *Clean Architecture* and Eric
Evans' *Domain-Driven Design*. Where this file and that policy disagree, the policy prevails.
