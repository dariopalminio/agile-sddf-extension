# Guardrail: React Hexagonal architecture for frontend

This guardrail is written for a React SPA (React 18+, Vite or equivalent, React Router 6+).

Applies to every business feature under `src/features/<feature>/` of a frontend built with
Hexagonal Architecture (Ports & Adapters) on React + TypeScript — its `ui/`, `application/`,
`domain/` and `infra/` layers, its single `composition/` root and its tests. The router
configuration (`src/routes.tsx`, `src/router.tsx`) is treated as the outermost incoming adapter and
is subject to its own rules. Does not apply to `src/shared/` cross-cutting code (design-system
primitives, base errors, pure utils), to `packages/ui` presentational components, to build tooling,
nor to disposable prototypes with a declared expiry date.

Rule IDs: `HEX-FE-NNN` — unique across this project's guardrails, immutable once published:
never renumbered, never reused.

Ranges: this extension owns `HEX-FE-200…299`; `HEX-FE-001…099` are the framework-agnostic base
rules of `hexagonal-frontend-checklist.md`, and `HEX-FE-100…199` belong to the Next.js extension
(`nextjs-hexagonal-frontend-checklist.md`).

## Mandatory rules

**On breach:** `(error)` blocks delivery — stop, name the rule id, fix it before continuing.
`(warn)` does not block — apply it, or state why you did not. A semantic rule that fails is raised
for human judgement; never resolve one silently.

### Deterministic rules (dependency-cruiser / grep / find / node)

The `HEX-FE-NNN` ids are the rule names declared in `.dependency-cruiser.cjs` and the labels the
shell checks print, both defined in full under *How to run the validation*.

#### Layer dependencies

- [ ] **HEX-FE-201** `domain/**` imports nothing from `application/**`, `ui/**`, `infra/**`, `composition/**` or routing files — dependency-cruiser (error)
- [ ] **HEX-FE-202** `domain/**` imports no external package at all (nothing resolved under `node_modules/`) — dependency-cruiser (error)
- [ ] **HEX-FE-203** `application/**` imports nothing from `ui/**`, `infra/**`, `composition/**` or routing files — dependency-cruiser (error)
- [ ] **HEX-FE-204** `infra/**` imports nothing from `ui/**` — dependency-cruiser (error)
- [ ] **HEX-FE-205** Only `composition/**` and `infra/**` itself import from `infra/**` — dependency-cruiser (error)
- [ ] **HEX-FE-206** No feature imports `domain/**` or `infra/**` of another feature — dependency-cruiser (error)
- [ ] **HEX-FE-207** `src/shared/**` imports nothing from `src/features/**` — dependency-cruiser (error)
- [ ] **HEX-FE-208** Router configuration files (`src/routes.tsx`, `src/router.tsx`) import only from `ui/**`, `composition/**` or `src/shared/**` — no direct `domain/**`, `application/**` or `infra/**` imports — dependency-cruiser (error)

#### Minimum layout

- [ ] **HEX-FE-209** Every feature directory holding a `domain/` also holds `application/`, `ui/`, `infra/` and `composition/` — find (error)
- [ ] **HEX-FE-210** Every feature holds `application/ports/in/` and `domain/ports/out/` — find (error)
- [ ] **HEX-FE-211** Every feature holds a `README.md` — find (error)
- [ ] **HEX-FE-212** Every `.ts`/`.tsx` file name is kebab-case with dotted role suffixes (`login.use-case.ts`, `email.vo.ts`, `order.http-adapter.ts`) — find (error)
- [ ] **HEX-FE-213** Files under `model/entities/`, `model/value-objects/`, `model/aggregates/`, `application/use-cases/`, `domain/events/` and `ui/hooks/` carry their role suffix (`.entity.ts`, `.vo.ts`, `.aggregate.ts`, `.use-case.ts`, `.event.ts`, `.hook.ts`) — find (error)
- [ ] **HEX-FE-214** Every `infra/http/<x>.http-adapter.ts` has a sibling `<x>.mapper.ts` — find (error)
- [ ] **HEX-FE-215** Every feature declares `composition/container.ts` — find (error)
- [ ] **HEX-FE-216** `package.json` declares an `arch:check` script that runs `depcruise` — node (error)

#### React boundary and purity

- [ ] **HEX-FE-217** No `import ... from 'react'`, `'react-dom'`, `'react-router'`, `'react-router-dom'` or `'@tanstack/react-query'` appears in `domain/**` or `application/**` — dependency-cruiser (error)
- [ ] **HEX-FE-218** `domain/**` and `application/**` contain no JSX syntax (`.tsx` files) and no `.tsx` extension — find (error)
- [ ] **HEX-FE-219** `window.`, `document.`, `localStorage.`, `sessionStorage.`, `indexedDB.`, `navigator.` appear only in `ui/**`, `infra/**` or `composition/**` — grep (error)
- [ ] **HEX-FE-220** `useState`, `useEffect`, `useReducer`, `useRef`, `useLayoutEffect`, `useContext`, `useMemo`, `useCallback`, `useSyncExternalStore` appear only in `ui/**` or `composition/**` — grep (error)
- [ ] **HEX-FE-221** `useNavigate`, `useParams`, `useSearchParams`, `useLocation`, `Link`, `NavLink`, `Outlet` (from `react-router`) appear only in `ui/**` or router configuration files — grep (error)
- [ ] **HEX-FE-222** `import.meta.env` appears only in `infra/config/**` or `ui/**`; `VITE_*` variables that are secrets are never read in `ui/**` — grep (error)
- [ ] **HEX-FE-223** `fetch(` appears only in `infra/http/**`; `domain/**` and `application/**` never call it — grep (error)
- [ ] **HEX-FE-224** `localStorage.`, `sessionStorage.`, `indexedDB.`, `caches.` appear only in `infra/storage/**` — grep (error)
- [ ] **HEX-FE-225** Query/mutation clients (`useQuery`, `useMutation`, `QueryClient`, `new SWRConfig(`, `createStore(`) appear only in `ui/**`, `infra/**` or `composition/**` — grep (error)
- [ ] **HEX-FE-226** Router configuration files (`src/routes.tsx`, `src/router.tsx`) contain no business logic beyond route definitions, loaders, redirects and layout selection — grep (warn)

#### Ports, use cases and adapters

- [ ] **HEX-FE-227** Every `application/ports/in/*.use-case.ts` exports `interface I<Action>UseCase` — grep (error)
- [ ] **HEX-FE-228** Every `application/use-cases/*.use-case.ts` declares `class <Action>UseCase implements I<Action>UseCase` — grep (error)
- [ ] **HEX-FE-229** No `new <X>Repository(` / `<X>Gateway(` / `<X>Adapter(` / `<X>Client(` / `<X>Store(` / `<X>Storage(` / `<X>HttpAdapter(` appears in `application/**` or `ui/**` outside tests — grep (error)
- [ ] **HEX-FE-230** No `IRepository<` generic port and no `IService` port is declared anywhere — grep (error)
- [ ] **HEX-FE-231** `ui/hooks/*.hook.ts` do not import from `domain/**` or `application/use-cases/**` directly; they consume incoming ports or the composition root — dependency-cruiser (error)
- [ ] **HEX-FE-232** UI components in `ui/components/**` do not instantiate use cases; they receive them through props or a hook from `ui/hooks/**` — dependency-cruiser (error)
- [ ] **HEX-FE-233** `composition/container.ts` is the only file that names concrete implementations of ports; it exports a builder or a React provider — grep (error)

#### Domain model

- [ ] **HEX-FE-234** Non-test files in `domain/**` contain no `window.`, `document.`, `localStorage.`, `sessionStorage.`, `indexedDB.`, `navigator.`, `globalThis.`, `Date.now(`, `new Date()`, `Math.random(` or `crypto.` — grep (error)
- [ ] **HEX-FE-235** Every file in `domain/exceptions/` references `DomainError` (extends it or a subclass) — grep (error)
- [ ] **HEX-FE-236** Every `domain/events/*.event.ts` exports a class whose name ends in `Event` — grep (error)
- [ ] **HEX-FE-237** Specs under `domain/` and `application/` import nothing from `ui/`, `infra/`, `composition/` or router files and call no `vi.mock(` / `jest.mock(` — grep (error)

### Semantic rules (AI / human review)

- [ ] **HEX-FE-238** Use cases only orchestrate: every business decision (`if` on domain state, calculation, invariant) lives in an entity, value object or domain service, never in a use case, component, hook, adapter or mapper.
- [ ] **HEX-FE-239** UI components are thin: they render state, forward user intent to an incoming port through a hook or a passed callback, and contain no business branching beyond presentation logic (loading, empty, error, disabled).
- [ ] **HEX-FE-240** Hooks in `ui/hooks/**` are incoming adapters: they select state, wire the incoming port, translate the result to a view-model and expose it to the component — never contain business logic.
- [ ] **HEX-FE-241** Container components and hooks delegate to `application/ports/in/**`; presentational components receive already-computed data through props and know nothing about ports, use cases or the composition root.
- [ ] **HEX-FE-242** Entities carry identity and lifecycle; value objects are immutable and validate their invariants in the constructor, so an invalid instance cannot exist.
- [ ] **HEX-FE-243** Every outgoing port is role-specific and its method names use the business language (`findOrderById`, `publishConfiguration`) — never the transport language (`getJson`, `postApi`).
- [ ] **HEX-FE-244** Every adapter implements exactly one outgoing port; the HTTP adapter returns domain entities and its mapper only translates — no DTO, JSON or HTTP error crosses the `infra/` boundary untranslated.
- [ ] **HEX-FE-245** `DomainError` and HTTP errors are translated to user-facing messages by a presentation mapper inside `ui/**`; the domain never carries UI copy and the UI never leaks transport errors.
- [ ] **HEX-FE-246** React contexts, providers and global stores hold only state, wiring and view-model data; they never hold domain entities or use cases named after business operations. Components that need a use case receive it through `ui/hooks/**` or the composition provider.
- [ ] **HEX-FE-247** There is exactly one composition point per execution context: `composition/container.ts` (or `composition/provider.tsx`) wires every feature's ports to their implementations and is mounted once at the application root. No feature builds its own container ad hoc.
- [ ] **HEX-FE-248** Caching, retries, offline and background sync are infrastructure concerns: React Query, SWR, Workbox and equivalent live in `infra/**` or `ui/**`; `domain/**` and `application/**` never import them.
- [ ] **HEX-FE-249** The domain knows no routing: no route, path, slug, search param or URL concept appears in `domain/**` or `application/**`; route params enter through the incoming adapter (`ui/hooks/**`, `ui/components/**`, router files) and are translated there.
- [ ] **HEX-FE-250** Forms use `react-hook-form` (or equivalent) in `ui/**`, and validation schemas come from `packages/validation` (Zod) shared with the backend — never duplicated.
- [ ] **HEX-FE-251** Design-system components live in `packages/ui` and are pure presentational: they import nothing from `src/features/**` and receive all data through props.
- [ ] **HEX-FE-252** Feature public surface is explicit: cross-feature imports (if any) go through the target feature's `index.ts` — never through deep paths into `domain/**` or `infra/**`.
- [ ] **HEX-FE-253** Use-case tests use in-memory fakes of the outgoing ports, reusable across tests; they never mock `fetch`, `react-router`, `react-query` or an SDK. Domain tests need no React, DOM, network or storage.
- [ ] **HEX-FE-254** Nothing in `src/shared/` names a business concept; whatever is specific to one feature lives in that feature.
- [ ] **HEX-FE-255** The feature `README.md` lists its ports, use cases, adapters and ADR, and any deviation from these rules is recorded as an ADR under `docs/adr/` with context, decision, consequences and review date.
- [ ] **HEX-FE-256** A project that uses different folder names (`components/`, `hooks/`, `services/`, `store/`) declares the mapping in `.dependency-cruiser.cjs`, keeps the `HEX-FE-NNN` rule names, and no stack or topology extension contradicts or relaxes any rule of this file.
- [ ] **HEX-FE-257** A project that uses a state library (Redux Toolkit, Zustand, Jotai, XState) declares it as an outgoing port (`IStore`) when business state is involved, and its implementation lives in `infra/store/**`; the domain and application never import the library directly.
- [ ] **HEX-FE-258** A project that uses React Server Components, Suspense boundaries or streaming declares them as incoming adapters in `ui/**`; use cases never suspend, never return promises consumed by React, and remain plain async functions.

## Minimum expected structure

```text
src/
├── main.tsx                                    # mounts composition provider and router
├── routes.tsx                                  # outermost incoming adapter: route definitions
├── features/
│   └── <feature>/                              # business capability or module
│       ├── ui/
│       │   ├── components/                     # presentational + container components (.tsx)
│       │   ├── hooks/<name>.hook.ts            # incoming adapter: consumes incoming ports
│       │   ├── mappers/                        # domain → view-model
│       │   └── providers/                      # feature-scoped React contexts (state only)
│       ├── application/
│       │   ├── ports/in/<action>.use-case.ts   # export interface I<Action>UseCase
│       │   ├── ports/out/{clock,analytics,storage,store}.ts
│       │   └── use-cases/<action>.use-case.ts  # class <Action>UseCase implements I<Action>UseCase
│       ├── domain/
│       │   ├── model/{entities,value-objects,aggregates}/
│       │   ├── ports/out/<entity>.repository.ts
│       │   ├── services/
│       │   ├── events/
│       │   └── exceptions/
│       ├── infra/
│       │   ├── http/<x>.http-adapter.ts + <x>.mapper.ts
│       │   ├── storage/                        # localStorage, IndexedDB adapters
│       │   ├── store/                          # Redux/Zustand adapters (only if used)
│       │   ├── analytics/
│       │   ├── clock/
│       │   └── config/
│       ├── composition/
│       │   └── container.ts                    # single wiring point per feature
│       └── README.md
├── shared/
│   ├── errors/
│   ├── types/
│   └── utils/
└── composition/
    └── root-container.ts                       # aggregates every feature container
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
// ui/hooks/use-login.hook.ts — incoming adapter: no business logic
import { useState } from 'react';
import { useRootContainer } from '@/composition/root-container';
import { loginSchema } from '@nebulab/validation';

export function useLogin() {
  const { login } = useRootContainer().auth;
  const [state, setState] = useState<LoginState>({ status: 'idle' });

  const submit = async (input: unknown) => {
    const parsed = loginSchema.safeParse(input);
    if (!parsed.success) return setState({ status: 'invalid', errors: parsed.error.flatten() });

    setState({ status: 'loading' });
    const result = await login.execute(parsed.data);
    setState(
      result.match(
        (output) => ({ status: 'success', user: output.user }),
        (error) => ({ status: 'error', code: error.code }),
      ),
    );
  };

  return { state, submit };
}
```

```typescript
// infra/http/order.http-adapter.ts — implements one outgoing port, translates through the mapper
export class OrderHttpAdapter implements IOrderRepository {
  constructor(private readonly http: HttpClient) {}

  async findById(id: OrderId): Promise<Order | null> {
    const dto = await this.http.get(`/orders/${id}`);
    return dto ? toDomainOrder(dto) : null;
  }
}
```

```typescript
// composition/container.ts — single wiring point per feature
import { OrderHttpAdapter } from '../infra/http/order.http-adapter';
import { PlaceOrderUseCase } from '../application/use-cases/place-order.use-case';

export interface OrderFeatureContainer {
  placeOrder: IPlaceOrderUseCase;
  findOrder: IFindOrderUseCase;
}

export const buildOrderContainer = (deps: SharedDeps): OrderFeatureContainer => {
  const orders: IOrderRepository = new OrderHttpAdapter(deps.http);
  const clock: IClock = deps.clock;
  return {
    placeOrder: new PlaceOrderUseCase(orders, clock),
    findOrder: new FindOrderUseCase(orders),
  };
};
```

```typescript
// composition/root-container.ts — aggregates every feature, mounted once at the app root
export const buildRootContainer = (): RootContainer => {
  const deps = buildSharedDeps();
  return {
    auth: buildAuthContainer(deps),
    order: buildOrderContainer(deps),
    catalog: buildCatalogContainer(deps),
  };
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
    { name: 'HEX-FE-201', severity: 'error',
      from: { path: F('domain') },
      to:   { path: '^src/(features/[^/]+/(application|ui|infra|composition)|composition|routes\\.tsx$|router\\.tsx$)/' } },
    { name: 'HEX-FE-202', severity: 'error',
      from: { path: F('domain') },
      to:   { path: '^node_modules/' } },
    { name: 'HEX-FE-203', severity: 'error',
      from: { path: F('application') },
      to:   { path: '^src/(features/[^/]+/(ui|infra|composition)|composition|routes\\.tsx$|router\\.tsx$)/' } },
    { name: 'HEX-FE-204', severity: 'error',
      from: { path: F('infra') },
      to:   { path: F('ui') } },
    { name: 'HEX-FE-205', severity: 'error',
      from: { path: '^src/', pathNot: ['^src/features/[^/]+/composition/', '^src/features/[^/]+/infra/', '^src/composition/'] },
      to:   { path: F('infra') } },
    { name: 'HEX-FE-206', severity: 'error',
      from: { path: '^src/features/([^/]+)/' },
      to:   { path: '^src/features/[^/]+/(domain|infra)/', pathNot: '^src/features/$1/' } },
    { name: 'HEX-FE-207', severity: 'error',
      from: { path: '^src/shared/' },
      to:   { path: '^src/features/' } },
    { name: 'HEX-FE-208', severity: 'error',
      from: { path: '^src/(routes\\.tsx|router\\.tsx)$' },
      to:   { path: '^src/features/[^/]+/(domain|application|infra)/' } },
    { name: 'HEX-FE-217', severity: 'error',
      from: { path: F('(domain|application)') },
      to:   { path: '^node_modules/(react|react-dom|react-router|react-router-dom|@tanstack/react-query)/' } },
    { name: 'HEX-FE-231', severity: 'error',
      from: { path: '^src/features/[^/]+/ui/hooks/' },
      to:   { path: '^src/features/[^/]+/(domain|application/use-cases)/' } },
    { name: 'HEX-FE-232', severity: 'error',
      from: { path: '^src/features/[^/]+/ui/components/' },
      to:   { path: '^src/features/[^/]+/(domain|application/use-cases|infra|composition)/' } },
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
npx depcruise src --config .dependency-cruiser.cjs      # HEX-FE-201 … HEX-FE-208, 217, 231, 232
# package.json → "scripts": { "arch:check": "depcruise src --config .dependency-cruiser.cjs" }

# grep / find / node checks — each prints its rule id followed by the offending paths
fail=0
chk() { [ -z "$2" ] || { printf '%s\n%s\n' "$1" "$2"; fail=1; }; }
warn() { [ -z "$2" ] || printf '%s (warn)\n%s\n' "$1" "$2"; }

# --- HEX-FE-209 … HEX-FE-216 (layout) ---
for f in $(find src/features -mindepth 1 -maxdepth 1 -type d); do
  for l in domain application ui infra composition; do [ -d "$f/$l" ] || chk HEX-FE-209 "$f/$l"; done
  [ -d "$f/application/ports/in" ] || chk HEX-FE-210 "$f/application/ports/in"
  [ -d "$f/domain/ports/out" ]     || chk HEX-FE-210 "$f/domain/ports/out"
  [ -f "$f/README.md" ]            || chk HEX-FE-211 "$f/README.md"
  [ -f "$f/composition/container.ts" ] || chk HEX-FE-215 "$f/composition/container.ts"
done
chk HEX-FE-212 "$(find src -name '*.ts' -o -name '*.tsx' | grep -vE '/[a-z0-9]+(-[a-z0-9]+)*(\.[a-z]+(-[a-z]+)*)*\.tsx?$')"
chk HEX-FE-213 "$(find src -name '*.ts' -o -name '*.tsx' | grep -v '\.spec\.' | grep -v '\.test\.' | grep -E '/(model/entities|model/value-objects|model/aggregates|application/use-cases|domain/events|ui/hooks)/' | grep -vE '\.(entity|vo|aggregate|use-case|event|hook)\.tsx?$')"
chk HEX-FE-214 "$(for r in $(find src -path '*/infra/http/*.http-adapter.ts'); do [ -f "${r%.http-adapter.ts}.mapper.ts" ] || echo "$r"; done)"
chk HEX-FE-216 "$(node -e "const s=require('./package.json').scripts||{};if(!/depcruise/.test(s['arch:check']||''))console.log('package.json: scripts.arch:check must run depcruise')")"

# --- HEX-FE-218 (no JSX in domain/application) ---
chk HEX-FE-218 "$(find src/features -type d \( -name domain -o -name application \) -exec find {} -name '*.tsx' \; 2>/dev/null)"

# --- HEX-FE-219 … HEX-FE-225 (React / browser / env APIs) ---
chk HEX-FE-219 "$(grep -rnE '\b(window|document|localStorage|sessionStorage|indexedDB|navigator)\.' --include='*.ts' --include='*.tsx' src | grep -vE '/(ui/|infra/|composition/)')"
chk HEX-FE-220 "$(grep -rnE '\b(useState|useEffect|useReducer|useRef|useLayoutEffect|useContext|useMemo|useCallback|useSyncExternalStore)\(' --include='*.ts' --include='*.tsx' src | grep -vE '/(ui/|composition/)')"
chk HEX-FE-221 "$(grep -rnE '\b(useNavigate|useParams|useSearchParams|useLocation|Link|NavLink|Outlet)\b' --include='*.ts' --include='*.tsx' src | grep -vE '/(ui/|^src/routes\.tsx$|^src/router\.tsx$)')"
chk HEX-FE-222 "$(grep -rnE 'import\.meta\.env' --include='*.ts' --include='*.tsx' src | grep -vE '/(infra/config/|ui/)')"
chk HEX-FE-223 "$(grep -rnE '\bfetch\(' --include='*.ts' --include='*.tsx' src | grep -vE '/infra/http/')"
chk HEX-FE-224 "$(grep -rnE '\b(localStorage|sessionStorage|indexedDB|caches)\.' --include='*.ts' --include='*.tsx' src | grep -vE '/infra/storage/')"
chk HEX-FE-225 "$(grep -rnE '\b(useQuery|useMutation|QueryClient|SWRConfig|createStore)\b' --include='*.ts' --include='*.tsx' src | grep -vE '/(ui/|infra/|composition/)')"

# --- HEX-FE-227 … HEX-FE-230, 233 (ports, use cases, composition) ---
chk HEX-FE-227 "$(for p in $(find src -path '*/application/ports/in/*.use-case.ts'); do grep -qE 'export (interface|type) I[A-Z][A-Za-z0-9]*UseCase\b' "$p" || echo "$p"; done)"
chk HEX-FE-228 "$(for u in $(find src -path '*/application/use-cases/*.use-case.ts'); do grep -qE 'class [A-Z][A-Za-z0-9]*UseCase implements I[A-Z][A-Za-z0-9]*UseCase\b' "$u" || echo "$u"; done)"
chk HEX-FE-229 "$(grep -rnE 'new [A-Z][A-Za-z0-9]*(Repository|Gateway|Adapter|Client|Store|Storage|HttpAdapter)\(' --include='*.ts' --include='*.tsx' --exclude='*.spec.ts' --exclude='*.test.ts' src | grep -E '/(application|ui)/')"
chk HEX-FE-230 "$(grep -rnE '\bIRepository<|\bIService\b' --include='*.ts' --include='*.tsx' src)"
chk HEX-FE-233 "$(for c in $(find src/features -path '*/composition/container.ts'); do grep -qE 'export (const|function|interface) ' "$c" || echo "$c"; done)"

# --- HEX-FE-234 … HEX-FE-237 (domain model) ---
chk HEX-FE-234 "$(grep -rnE '\b(window|document|localStorage|sessionStorage|indexedDB|navigator|globalThis)\.|Date\.now\(|new Date\(\)|Math\.random\(|crypto\.' --include='*.ts' --include='*.tsx' --exclude='*.spec.ts' --exclude='*.test.ts' $(find src/features -type d -name domain) 2>/dev/null)"
chk HEX-FE-235 "$(grep -rL 'DomainError' --include='*.ts' $(find src/features -type d -path '*/domain/exceptions') 2>/dev/null)"
chk HEX-FE-236 "$(grep -rLE 'export class [A-Z][A-Za-z0-9]*Event\b' --include='*.event.ts' $(find src/features -type d -path '*/domain/events') 2>/dev/null)"
chk HEX-FE-237 "$(grep -rnE "from ['\''][^'\'']*/(ui|infra|composition)/|^src/(routes|router)|\b(vi|jest)\.mock\(" --include='*.spec.ts' --include='*.test.ts' --include='*.spec.tsx' --include='*.test.tsx' $(find src/features -type d \( -name domain -o -name application \)) 2>/dev/null)"

# --- HEX-FE-226 (router configuration) ---
warn HEX-FE-226 "$(grep -nE '(Repository|UseCase|DomainError|PlaceOrder|Login)' src/routes.tsx src/router.tsx 2>/dev/null)"

exit $fail
```

## Verification

| Level | Action |
|-------|--------|
| Deterministic | `npm run arch:check` and the shell block above finish with exit code 0 and print no `HEX-FE-NNN` id. |
| Semantic | Review the semantic checklist against the diff (AI or human), citing the `HEX-FE-NNN` id of each finding, and attach the result to the PR. |

## Source of truth

This guardrail **summarises** the Ports & Adapters rules enforceable on a React SPA. The
authoritative expansion — layer responsibilities, the incoming-adapter role of hooks and container
components, the single composition root, browser APIs as infrastructure concerns, state libraries
as outgoing ports, and the rationale behind each rule, itself grounded in Alistair Cockburn's *Hexagonal
Architecture*, Robert C. Martin's *Clean Architecture*, Eric Evans' *Domain-Driven Design* and the
React documentation on components and hooks. Where this file and that policy disagree, the policy
prevails.
