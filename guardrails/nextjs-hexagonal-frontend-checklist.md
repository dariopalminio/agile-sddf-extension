# Guardrail: Next.js Hexagonal architecture for frontend

This guardrail is written for a Next.js (App Router) frontend.

Applies to every business feature under `src/features/<feature>/` of a frontend built with
Hexagonal Architecture (Ports & Adapters) on Next.js + TypeScript — its `ui/`, `application/`,
`domain/` and `infra/` layers, its two `composition/` roots (server and client) and its tests. The
Next.js `src/app/` router directory is treated as the outermost incoming adapter and is subject to
its own rules. Does not apply to `src/shared/` cross-cutting code (design-system primitives, base
errors, pure utils), to `packages/ui` presentational components, to build tooling, nor to
disposable prototypes with a declared expiry date.

Rule IDs: `HEX-FE-NNN` — unique across this project's guardrails, immutable once published:
never renumbered, never reused.

Ranges: this extension owns `HEX-FE-100…199`; `HEX-FE-001…099` are the framework-agnostic base
rules of `hexagonal-frontend-checklist.md`, and `HEX-FE-200…299` belong to the React SPA extension
(`react-hexagonal-frontend-checklist.md`).

## Mandatory rules

**On breach:** `(error)` blocks delivery — stop, name the rule id, fix it before continuing.
`(warn)` does not block — apply it, or state why you did not. A semantic rule that fails is raised
for human judgement; never resolve one silently.

### Deterministic rules (dependency-cruiser / grep / find / node)

The `HEX-FE-NNN` ids are the rule names declared in `.dependency-cruiser.cjs` and the labels the
shell checks print, both defined in full under *How to run the validation*.

#### Layer dependencies

- [ ] **HEX-FE-101** `domain/**` imports nothing from `application/**`, `ui/**`, `infra/**`, `composition/**` or `app/**` — dependency-cruiser (error)
- [ ] **HEX-FE-102** `domain/**` imports no external package at all (nothing resolved under `node_modules/`) — dependency-cruiser (error)
- [ ] **HEX-FE-103** `application/**` imports nothing from `ui/**`, `infra/**`, `composition/**` or `app/**` — dependency-cruiser (error)
- [ ] **HEX-FE-104** `infra/**` imports nothing from `ui/**` — dependency-cruiser (error)
- [ ] **HEX-FE-105** Only `composition/**`, `app/api/**/route.ts` and `infra/**` itself import from `infra/**` — dependency-cruiser (error)
- [ ] **HEX-FE-106** No feature imports `domain/**` or `infra/**` of another feature — dependency-cruiser (error)
- [ ] **HEX-FE-107** `src/shared/**` imports nothing from `src/features/**` — dependency-cruiser (error)
- [ ] **HEX-FE-108** `app/**` imports only from `ui/**`, `composition/**` or `src/shared/**` — no direct `domain/**`, `application/**` or `infra/**` imports — dependency-cruiser (error)

#### Minimum layout

- [ ] **HEX-FE-109** Every feature directory holding a `domain/` also holds `application/`, `ui/`, `infra/` and `composition/` — find (error)
- [ ] **HEX-FE-110** Every feature holds `application/ports/in/` and `domain/ports/out/` — find (error)
- [ ] **HEX-FE-111** Every feature holds a `README.md` — find (error)
- [ ] **HEX-FE-112** Every `.ts`/`.tsx` file name is kebab-case with dotted role suffixes (`login.use-case.ts`, `email.vo.ts`, `order.http-adapter.ts`) — find (error)
- [ ] **HEX-FE-113** Files under `model/entities/`, `model/value-objects/`, `model/aggregates/`, `application/use-cases/`, `domain/events/` and `ui/actions/` carry their role suffix (`.entity.ts`, `.vo.ts`, `.aggregate.ts`, `.use-case.ts`, `.event.ts`, `.action.ts`) — find (error)
- [ ] **HEX-FE-114** Every `infra/http/<x>.http-adapter.ts` has a sibling `<x>.mapper.ts` — find (error)
- [ ] **HEX-FE-115** Every feature declares `composition/server.ts` and, when it has client-side interactivity, `composition/client.ts` — find (error)
- [ ] **HEX-FE-116** `package.json` declares an `arch:check` script that runs `depcruise` — node (error)

#### Next.js server/client boundary and purity

- [ ] **HEX-FE-117** No `"use client"` or `"use server"` directive appears in `domain/**` or `application/**` — grep (error)
- [ ] **HEX-FE-118** `domain/**` and `application/**` import nothing from `next/*`, `react`, `react-dom` — dependency-cruiser (error)
- [ ] **HEX-FE-119** `"use client"` appears only at the top of files under `ui/**` or `composition/client.ts` — grep (error)
- [ ] **HEX-FE-120** `"use server"` appears only at the top of files under `ui/actions/**` — grep (error)
- [ ] **HEX-FE-121** `cookies(`, `headers(`, `draftMode(` imported from `next/headers` appear only in `infra/**`, `ui/actions/**` or `app/**` server files — grep (error)
- [ ] **HEX-FE-122** `NEXT_PUBLIC_*` env vars are read only in `ui/**` files with `"use client"`; non-prefixed `process.env.*` are read only in `infra/config/**`, `composition/server.ts` and `app/**` server files — grep (error)
- [ ] **HEX-FE-123** `fetch(` appears only in `infra/http/**` and `app/api/**/route.ts`; `domain/**` and `application/**` never call it — grep (error)
- [ ] **HEX-FE-124** `redirect(`, `notFound(`, `revalidatePath(`, `revalidateTag(`, `unstable_cache(` appear only in `ui/**`, `app/**` or `infra/**` — grep (error)
- [ ] **HEX-FE-125** `useState`, `useEffect`, `useReducer`, `useRef`, `useLayoutEffect`, `useContext` appear only in `ui/**` or `composition/client.ts` — grep (error)
- [ ] **HEX-FE-126** `middleware.ts` at the source root contains no business logic beyond redirects, headers, cookies and auth checks — grep (warn)

#### Ports, use cases and adapters

- [ ] **HEX-FE-127** Every `application/ports/in/*.use-case.ts` exports `interface I<Action>UseCase` — grep (error)
- [ ] **HEX-FE-128** Every `application/use-cases/*.use-case.ts` declares `class <Action>UseCase implements I<Action>UseCase` — grep (error)
- [ ] **HEX-FE-129** No `new <X>Repository(` / `<X>Gateway(` / `<X>Adapter(` / `<X>Client(` / `<X>Store(` / `<X>Storage(` / `<X>HttpAdapter(` appears in `application/**` or `ui/**` outside tests — grep (error)
- [ ] **HEX-FE-130** No `IRepository<` generic port and no `IService` port is declared anywhere — grep (error)
- [ ] **HEX-FE-131** `app/api/**/route.ts` files do not import from `domain/**` or `application/use-cases/**` directly; they consume incoming ports or the composition root — dependency-cruiser (error)
- [ ] **HEX-FE-132** `ui/actions/*.action.ts` files do not import from `domain/**` or `application/use-cases/**` directly; they consume incoming ports or the composition root — dependency-cruiser (error)
- [ ] **HEX-FE-133** `composition/server.ts` starts with `import 'server-only'` and `composition/client.ts` starts with `"use client"` — grep (error)

#### Domain model

- [ ] **HEX-FE-134** Non-test files in `domain/**` contain no `window.`, `document.`, `localStorage.`, `sessionStorage.`, `indexedDB.`, `navigator.`, `globalThis.`, `Date.now(`, `new Date()`, `Math.random(` or `crypto.` — grep (error)
- [ ] **HEX-FE-135** Every file in `domain/exceptions/` references `DomainError` (extends it or a subclass) — grep (error)
- [ ] **HEX-FE-136** Every `domain/events/*.event.ts` exports a class whose name ends in `Event` — grep (error)
- [ ] **HEX-FE-137** Specs under `domain/` and `application/` import nothing from `ui/`, `infra/`, `composition/` or `app/` and call no `vi.mock(` / `jest.mock(` — grep (error)

### Semantic rules (AI / human review)

- [ ] **HEX-FE-138** Use cases only orchestrate: every business decision (`if` on domain state, calculation, invariant) lives in an entity, value object or domain service, never in a use case, UI component, hook, Server Action, Route Handler or mapper.
- [ ] **HEX-FE-139** UI components and hooks are thin: they render state, forward user intent to an incoming port and contain no business branching beyond presentation logic (loading, empty, error).
- [ ] **HEX-FE-140** Server Actions in `ui/actions/**` are incoming adapters: they validate format with the shared Zod schema, map to the use-case input, delegate to the incoming port and translate the result to a serialisable shape — never contain business logic.
- [ ] **HEX-FE-141** Route Handlers in `app/api/**/route.ts` are incoming adapters: same rules as Server Actions — validate, delegate, translate — and never touch `domain/**` or `application/use-cases/**` directly.
- [ ] **HEX-FE-142** Entities carry identity and lifecycle; value objects are immutable and validate their invariants in the constructor, so an invalid instance cannot exist.
- [ ] **HEX-FE-143** Every outgoing port is role-specific and its method names use the business language (`findOrderById`, `publishConfiguration`) — never the transport language (`getJson`, `postApi`).
- [ ] **HEX-FE-144** Every adapter implements exactly one outgoing port; the HTTP adapter returns domain entities and its mapper only translates — no DTO, JSON or HTTP error crosses the `infra/` boundary untranslated.
- [ ] **HEX-FE-145** `DomainError` and HTTP errors are translated to user-facing messages by a presentation mapper inside `ui/**`; the domain never carries UI copy and the UI never leaks transport errors.
- [ ] **HEX-FE-146** The `"use client"` boundary is pushed to the lowest possible leaf: a page or layout is a Server Component unless proven otherwise; a Client Component is introduced only where interactivity is required.
- [ ] **HEX-FE-147** Two composition roots exist per feature: `composition/server.ts` wires server-only implementations (HTTP adapters using `next/headers`, server-side use cases) and `composition/client.ts` wires browser-only implementations (localStorage, analytics). A use case is never wired in both with the same port implementation.
- [ ] **HEX-FE-148** Cache and revalidation are infrastructure concerns: `revalidatePath`, `revalidateTag`, `unstable_cache` and `fetch` `cache` options live in `infra/**` or `ui/**` — never in `domain/**` or `application/**`.
- [ ] **HEX-FE-149** The domain knows no routing: no route, path, slug or URL concept appears in `domain/**` or `application/**`; route params enter the system through the incoming adapter (`app/**`, `ui/actions/**`) and are translated there.
- [ ] **HEX-FE-150** Forms use `react-hook-form` (or equivalent) in `ui/**`, and validation schemas come from `packages/validation` (Zod) shared with the backend — never duplicated.
- [ ] **HEX-FE-151** Design-system components live in `packages/ui` and are pure presentational: they import nothing from `src/features/**` and receive all data through props.
- [ ] **HEX-FE-152** Feature public surface is explicit: cross-feature imports (if any) go through the target feature's `index.ts` — never through deep paths into `domain/**` or `infra/**`.
- [ ] **HEX-FE-153** Use-case tests use in-memory fakes of the outgoing ports, reusable across tests; they never mock `fetch`, `next/navigation`, `next/headers` or an SDK. Domain tests need no React, DOM, network or storage.
- [ ] **HEX-FE-154** Nothing in `src/shared/` names a business concept; whatever is specific to one feature lives in that feature.
- [ ] **HEX-FE-155** The feature `README.md` lists its ports, use cases, adapters and ADR, and any deviation from these rules is recorded as an ADR under `docs/adr/` with context, decision, consequences and review date.
- [ ] **HEX-FE-156** A project that uses different folder names (`components/`, `hooks/`, `services/`) declares the mapping in `.dependency-cruiser.cjs`, keeps the `HEX-FE-NNN` rule names, and no stack or topology extension contradicts or relaxes any rule of this file.

## Minimum expected structure

```text
src/
├── app/                                        # Next.js router — outermost incoming adapter
│   ├── (shop)/
│   │   ├── layout.tsx                          # Server Component by default
│   │   ├── page.tsx
│   │   └── product/[slug]/page.tsx
│   ├── api/
│   │   └── <endpoint>/route.ts                 # Route Handler — incoming adapter
│   ├── providers.tsx                           # mounts composition/client at the root
│   └── layout.tsx
├── features/
│   └── <feature>/                              # business capability or module
│       ├── ui/
│       │   ├── components/                     # presentational + container components
│       │   ├── hooks/                          # client hooks
│       │   ├── actions/<name>.action.ts        # "use server" — incoming adapter
│       │   └── mappers/                        # domain → view-model
│       ├── application/
│       │   ├── ports/in/<action>.use-case.ts   # export interface I<Action>UseCase
│       │   ├── ports/out/{clock,analytics,storage}.ts
│       │   └── use-cases/<action>.use-case.ts  # class <Action>UseCase implements I<Action>UseCase
│       ├── domain/
│       │   ├── model/{entities,value-objects,aggregates}/
│       │   ├── ports/out/<entity>.repository.ts
│       │   ├── services/
│       │   ├── events/
│       │   └── exceptions/
│       ├── infra/
│       │   ├── http/<x>.http-adapter.ts + <x>.mapper.ts
│       │   ├── storage/                        # localStorage, IndexedDB
│       │   ├── analytics/
│       │   ├── clock/
│       │   └── config/
│       ├── composition/
│       │   ├── server.ts                       # import 'server-only'
│       │   └── client.ts                       # "use client"
│       └── README.md
├── shared/
│   ├── errors/
│   ├── types/
│   └── utils/
└── middleware.ts                               # auth, redirects, headers only
```

```typescript
// application/ports/in/login.use-case.ts — the contract the incoming adapter consumes
export interface ILoginUseCase {
  execute(input: LoginInput): Promise<Result<LoginOutput, DomainError>>;
}

// application/use-cases/login.use-case.ts — receives ports, never implementations
export class LoginUseCase implements ILoginUseCase {
  constructor(
    private readonly users: IUserRepository,
    private readonly clock: IClock,
  ) {}
  async execute(input: LoginInput): Promise<Result<LoginOutput, DomainError>> {
    // orchestrate only
  }
}
```

```typescript
// ui/actions/login.action.ts — "use server": incoming adapter, no business logic
'use server';
import { buildServerDependencies } from '@/features/auth/composition/server';
import { loginSchema } from '@nebulab/validation';

export async function loginAction(formData: FormData) {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, errors: parsed.error.flatten() };

  const { login } = buildServerDependencies();
  const result = await login.execute(parsed.data);

  return result.match(
    (output) => ({ ok: true, user: output.user }),
    (error) => ({ ok: false, code: error.code }),
  );
}
```

```typescript
// infra/http/order.http-adapter.ts — implements one outgoing port, translates through the mapper
export class OrderHttpAdapter implements IOrderRepository {
  async findById(id: OrderId): Promise<Order | null> {
    const dto = await httpClient.get(`/orders/${id}`);
    return dto ? toDomainOrder(dto) : null;
  }
}
```

```typescript
// composition/server.ts — single server wiring point per feature
import 'server-only';
export const buildServerDependencies = (): ServerDependencies => {
  const orders: IOrderRepository = new OrderHttpAdapter(serverHttpClient());
  const clock: IClock = new SystemClock();
  return { placeOrder: new PlaceOrderUseCase(orders, clock) };
};
```

```typescript
// composition/client.ts — single client wiring point per feature
'use client';
export const buildClientDependencies = (): ClientDependencies => {
  const analytics: IAnalytics = new PostHogAnalytics();
  return { trackAddToCart: new TrackAddToCartUseCase(analytics) };
};
```

## How to run the validation

Requires Node ≥ 20.12, dependency-cruiser ≥ 17 and TypeScript 5.x (`npm i -D dependency-cruiser
typescript@5`) — dependency-cruiser 17 does not accept TypeScript 7 and then cruises zero `.ts`
files. Verified with dependency-cruiser 17.4.3 / TypeScript 5.9.3. No published preset covers these
rules; the ruleset below is the norm.

```js
// .dependency-cruiser.cjs
const F = (x) => `^src/features/[^/]+/${x}/`;
module.exports = {
  forbidden: [
    { name: 'HEX-FE-101', severity: 'error',
      from: { path: F('domain') },
      to:   { path: '^src/(features/[^/]+/(application|ui|infra|composition)|app)/' } },
    { name: 'HEX-FE-102', severity: 'error',
      from: { path: F('domain') },
      to:   { path: '^node_modules/' } },
    { name: 'HEX-FE-103', severity: 'error',
      from: { path: F('application') },
      to:   { path: '^src/(features/[^/]+/(ui|infra|composition)|app)/' } },
    { name: 'HEX-FE-104', severity: 'error',
      from: { path: F('infra') },
      to:   { path: F('ui') } },
    { name: 'HEX-FE-105', severity: 'error',
      from: { path: '^src/', pathNot: ['^src/features/[^/]+/composition/', '^src/features/[^/]+/infra/', '^src/app/api/'] },
      to:   { path: F('infra') } },
    { name: 'HEX-FE-106', severity: 'error',
      from: { path: '^src/features/([^/]+)/' },
      to:   { path: '^src/features/[^/]+/(domain|infra)/', pathNot: '^src/features/$1/' } },
    { name: 'HEX-FE-107', severity: 'error',
      from: { path: '^src/shared/' },
      to:   { path: '^src/features/' } },
    { name: 'HEX-FE-108', severity: 'error',
      from: { path: '^src/app/' },
      to:   { path: '^src/features/[^/]+/(domain|application|infra)/' } },
    { name: 'HEX-FE-118', severity: 'error',
      from: { path: F('(domain|application)') },
      to:   { path: '^node_modules/(next|react|react-dom)/' } },
    { name: 'HEX-FE-131', severity: 'error',
      from: { path: '^src/app/api/' },
      to:   { path: '^src/features/[^/]+/(domain|application/use-cases)/' } },
    { name: 'HEX-FE-132', severity: 'error',
      from: { path: '^src/features/[^/]+/ui/actions/' },
      to:   { path: '^src/features/[^/]+/(domain|application/use-cases)/' } },
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
npx depcruise src --config .dependency-cruiser.cjs      # HEX-FE-101 … HEX-FE-108, 118, 131, 132
# package.json → "scripts": { "arch:check": "depcruise src --config .dependency-cruiser.cjs" }

# grep / find / node checks — each prints its rule id followed by the offending paths
fail=0
chk() { [ -z "$2" ] || { printf '%s\n%s\n' "$1" "$2"; fail=1; }; }
warn() { [ -z "$2" ] || printf '%s (warn)\n%s\n' "$1" "$2"; }

# --- HEX-FE-109 … HEX-FE-116 (layout) ---
for f in $(find src/features -mindepth 1 -maxdepth 1 -type d); do
  for l in domain application ui infra composition; do [ -d "$f/$l" ] || chk HEX-FE-109 "$f/$l"; done
  [ -d "$f/application/ports/in" ] || chk HEX-FE-110 "$f/application/ports/in"
  [ -d "$f/domain/ports/out" ]     || chk HEX-FE-110 "$f/domain/ports/out"
  [ -f "$f/README.md" ]            || chk HEX-FE-111 "$f/README.md"
  [ -f "$f/composition/server.ts" ] || chk HEX-FE-115 "$f/composition/server.ts"
done
chk HEX-FE-112 "$(find src -name '*.ts' -o -name '*.tsx' | grep -vE '/[a-z0-9]+(-[a-z0-9]+)*(\.[a-z]+(-[a-z]+)*)*\.tsx?$')"
chk HEX-FE-113 "$(find src -name '*.ts' -o -name '*.tsx' | grep -v '\.spec\.' | grep -v '\.test\.' | grep -E '/(model/entities|model/value-objects|model/aggregates|application/use-cases|domain/events|ui/actions)/' | grep -vE '\.(entity|vo|aggregate|use-case|event|action)\.tsx?$')"
chk HEX-FE-114 "$(for r in $(find src -path '*/infra/http/*.http-adapter.ts'); do [ -f "${r%.http-adapter.ts}.mapper.ts" ] || echo "$r"; done)"
chk HEX-FE-116 "$(node -e "const s=require('./package.json').scripts||{};if(!/depcruise/.test(s['arch:check']||''))console.log('package.json: scripts.arch:check must run depcruise')")"

# --- HEX-FE-117, 119, 120 (directives) ---
chk HEX-FE-117 "$(grep -rnE '^["'\'']use (client|server)["'\'']' --include='*.ts' --include='*.tsx' $(find src/features -type d \( -name domain -o -name application \)) 2>/dev/null)"
chk HEX-FE-119 "$(grep -rlE '^["'\'']use client["'\'']' --include='*.ts' --include='*.tsx' src | grep -vE '/(ui/|composition/client\.ts)')"
chk HEX-FE-120 "$(grep -rlE '^["'\'']use server["'\'']' --include='*.ts' --include='*.tsx' src | grep -vE '/ui/actions/')"

# --- HEX-FE-121 … HEX-FE-125 (Next.js APIs and env) ---
chk HEX-FE-121 "$(grep -rnE "from ['\'']next/headers['\''].*" --include='*.ts' --include='*.tsx' src | grep -vE '/(infra/|ui/actions/|app/)')"
chk HEX-FE-122 "$(grep -rnE 'process\.env\.' --include='*.ts' --include='*.tsx' src | grep -vE '/(infra/config/|composition/server\.ts|app/)' | grep -vE 'NEXT_PUBLIC_.*use client')"
chk HEX-FE-123 "$(grep -rnE '\bfetch\(' --include='*.ts' --include='*.tsx' src | grep -vE '/(infra/http/|app/api/)')"
chk HEX-FE-124 "$(grep -rnE '\b(redirect|notFound|revalidatePath|revalidateTag|unstable_cache)\(' --include='*.ts' --include='*.tsx' src | grep -vE '/(ui/|app/|infra/)')"
chk HEX-FE-125 "$(grep -rnE '\b(useState|useEffect|useReducer|useRef|useLayoutEffect|useContext)\(' --include='*.tsx' --include='*.ts' src | grep -vE '/(ui/|composition/client\.ts)')"

# --- HEX-FE-127 … HEX-FE-130, 133 (ports, use cases, composition) ---
chk HEX-FE-127 "$(for p in $(find src -path '*/application/ports/in/*.use-case.ts'); do grep -qE 'export (interface|type) I[A-Z][A-Za-z0-9]*UseCase\b' "$p" || echo "$p"; done)"
chk HEX-FE-128 "$(for u in $(find src -path '*/application/use-cases/*.use-case.ts'); do grep -qE 'class [A-Z][A-Za-z0-9]*UseCase implements I[A-Z][A-Za-z0-9]*UseCase\b' "$u" || echo "$u"; done)"
chk HEX-FE-129 "$(grep -rnE 'new [A-Z][A-Za-z0-9]*(Repository|Gateway|Adapter|Client|Store|Storage|HttpAdapter)\(' --include='*.ts' --include='*.tsx' --exclude='*.spec.ts' --exclude='*.test.ts' src | grep -E '/(application|ui)/')"
chk HEX-FE-130 "$(grep -rnE '\bIRepository<|\bIService\b' --include='*.ts' --include='*.tsx' src)"
chk HEX-FE-133 "$(for s in $(find src/features -path '*/composition/server.ts'); do head -n1 "$s" | grep -q "server-only" || echo "$s"; done; for c in $(find src/features -path '*/composition/client.ts'); do head -n1 "$c" | grep -qE 'use client' || echo "$c"; done)"

# --- HEX-FE-134 … HEX-FE-137 (domain model) ---
chk HEX-FE-134 "$(grep -rnE '\b(window|document|localStorage|sessionStorage|indexedDB|navigator|globalThis)\.|Date\.now\(|new Date\(\)|Math\.random\(|crypto\.' --include='*.ts' --include='*.tsx' --exclude='*.spec.ts' --exclude='*.test.ts' $(find src/features -type d -name domain) 2>/dev/null)"
chk HEX-FE-135 "$(grep -rL 'DomainError' --include='*.ts' $(find src/features -type d -path '*/domain/exceptions') 2>/dev/null)"
chk HEX-FE-136 "$(grep -rLE 'export class [A-Z][A-Za-z0-9]*Event\b' --include='*.event.ts' $(find src/features -type d -path '*/domain/events') 2>/dev/null)"
chk HEX-FE-137 "$(grep -rnE "from ['\''][^'\'']*/(ui|infra|composition|app)/|\b(vi|jest)\.mock\(" --include='*.spec.ts' --include='*.test.ts' --include='*.spec.tsx' --include='*.test.tsx' $(find src/features -type d \( -name domain -o -name application \)) 2>/dev/null)"

# --- HEX-FE-126 (middleware) ---
warn HEX-FE-126 "$(grep -nE '(prisma|typeorm|mongoose|Repository|UseCase|DomainError)' src/middleware.ts 2>/dev/null)"

exit $fail
```

## Verification

| Level | Action |
|-------|--------|
| Deterministic | `npm run arch:check` and the shell block above finish with exit code 0 and print no `HEX-FE-NNN` id. |
| Semantic | Review the semantic checklist against the diff (AI or human), citing the `HEX-FE-NNN` id of each finding, and attach the result to the PR. |

## Source of truth

This guardrail **summarises** the Ports & Adapters rules enforceable on a Next.js App Router
frontend. The authoritative expansion — layer responsibilities, the server/client boundary,
Server Actions and Route Handlers as incoming adapters, the two composition roots, cache and
revalidation as infrastructure concerns, and the rationale behind each rule, itself grounded in Alistair Cockburn's *Hexagonal
Architecture*, Robert C. Martin's *Clean Architecture*, Eric Evans' *Domain-Driven Design* and
the Next.js App Router documentation. Where this file and that policy disagree, the policy
prevails.

