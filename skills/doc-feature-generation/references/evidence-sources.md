# Evidence sources

Read at step 3. It says where a product's behavior enters the code, how to read the scanner output,
how to inventory by hand when Node.js is not available, how much each source can prove, and how to
analyze tests without running them.

## Contents

1. Entry points by product type
2. Reading the scanner output
3. Manual inventory without Node.js
4. Weighing the sources
5. Citing evidence
6. Analyzing tests without running them

## 1. Entry points by product type

Use the categories that fit the product; most products combine several.

| Product type | Entry points (where behavior starts) | Where its rules usually live |
|---|---|---|
| Web application | Routes and pages, forms and their submit handlers, client-side guards | Component handlers, state stores, the API it calls |
| HTTP API | Controllers and route handlers, middleware, OpenAPI contract | Services or use cases, domain objects, validators |
| GraphQL or RPC API | Resolvers, schema `Query` and `Mutation`, `.proto` services | The services behind the resolvers, domain objects |
| Event-driven service | Message consumers and their topics, webhooks | Handlers, sagas, state transitions |
| Scheduled work | Cron expressions, schedulers, Kubernetes `CronJob` | The job body and the queries it runs |
| Library | Package `exports` and `main`, public modules, type declarations, README usage | Exported functions and classes, their options and errors |
| Command-line tool | `bin` entries, command and option definitions, help text | Command actions and the modules they call |

The actor follows from the entry point: a person behind a screen, a client system behind an API, a
message producer, a scheduler, or a developer who calls a library or runs a CLI.

## 2. Reading the scanner output

`scripts/scan-entry-points.mjs --root <scope>` prints one JSON object. It redacts credential-like
values, email addresses and absolute host paths from the evidence it prints:

| Field | Use it to |
|---|---|
| `manifests`, `frameworks`, `languages` | Name the stack and decide where to look first |
| `workspaces` | Detect a monorepo: the products and shared packages to tell apart in step 2 |
| `docs`, `contracts` | Read purpose, vocabulary and public promises |
| `entryPoints.http`, `.ui`, `.cli`, `.events`, `.jobs`, `.graphql`, `.rpc`, `.library` | Start the flows of step 4; each entry is `path:line detail` |
| `access` | Find access restrictions to trace into the features they protect |
| `tests` | Each test file with its number of cases, skipped cases and test doubles: how close to production it runs |
| `testCases` | Each test name with its line: map the tests to the rules they assert |
| `reports` | Results of past runs (coverage, JUnit, Cucumber reports): a run on the current code only if the user confirms it |
| `features` | Existing Gherkin files and their dialect: evidence and conventions to reuse |
| `runners` | Cucumber configuration that may already load the output directory |
| `excluded` | What was set aside as example, fixture, mock or generated code |
| `stats.truncated`, `notes` | Limits that were hit: narrow `--scope` or raise `--max-per-kind` |

The patterns are heuristics. They miss custom routers and dynamic registration and may catch a false
positive, so treat each entry as a lead to confirm by reading the code, and look for the entry points
a scanner cannot see: framework conventions, dependency-injected handlers, configuration files.

## 3. Manual inventory without Node.js

Search the scope with the tools at hand, skipping `node_modules`, `vendor`, build output and hidden
folders.

| Category | Search for |
|---|---|
| HTTP routes | `app.get(`, `router.post(` and similar; `@Get(`, `@PostMapping`, `@app.route(`, `path(` in `urls.py`, `Route::get(`, `[HttpGet`, `MapGet(`, `HandleFunc(`; `pages/api/`, `app/**/route.ts` |
| Screens | `<Route path=`, `createBrowserRouter`, `Routes = [`, `pages/**`, `app/**/page.tsx`, `+page.svelte` |
| CLI | `bin` in `package.json`, `[project.scripts]`, `.command(`, `@click.command`, `add_parser(`, `cobra.Command{` |
| Events | `@EventPattern`, `@MessagePattern`, `@KafkaListener`, `@RabbitListener`, `subscribe("topic"`, `eachMessage` |
| Jobs | `@Cron(`, `cron.schedule(`, `@Scheduled(`, `beat_schedule`, `kind: CronJob` |
| GraphQL and RPC | `@Resolver`, `type Query`, `type Mutation`, `rpc ` in `.proto`, `publicProcedure` |
| Library | `exports`, `main` and `types` in `package.json`; `export function` and `export class` in entry modules; `__all__` |
| Access | `@UseGuards`, `@Roles`, `@PreAuthorize`, `@login_required`, `[Authorize`, `requireRole(` |
| Tests | Files: `*.test.*`, `*.spec.*`, `test_*.py`, `*_test.go`, `*Test.java`, `tests/`, `__tests__/`, `e2e/`, `*.feature`. Cases: `it(`, `test(`, `def test_`, `@Test`, `func Test`, `[Fact]`. Skips: `.skip(`, `xit(`, `@Disabled`, `@pytest.mark.skip`. Doubles: `jest.mock(`, `vi.mock(`, `Mockito`, `MagicMock`, `nock(` |

Unless the user put them in scope, leave out of the product inventory every path with an `examples`,
`samples`, `demo`, `fixtures`, `testdata`, `mocks`, `__mocks__`, `stubs` or `generated` segment,
every file marked `Code generated`, `@generated` or `DO NOT EDIT`, minified bundles and vendored
dependencies.

## 4. Weighing the sources

| Source | What it can establish | Caveat |
|---|---|---|
| Implementation reached from an entry point | That a behavior is implemented, with its rules | Not that it works: tracing is not running |
| A check the user reports: a passing CI run or test report on the current code, a manual verification | That the behavior it covers holds where it ran | Mocks and fakes limit the claim to what they simulate |
| A test read in the code | Which rules someone checks, at which level and with which doubles | Coverage, not a pass: the status stays *Implemented, unverified* |
| A test report found in the workspace | That some run happened, at some point | It may predate the code: it counts only if the user confirms it matches the current code |
| Public contract (OpenAPI, GraphQL, proto) | Promised operations, shapes and errors | May be ahead of or behind the code |
| README, docs, backlog, stories, ADRs | Intent, vocabulary, actors, planned behavior | May be outdated; alone they support only *Proposed* |
| Existing `.feature` files | Agreed vocabulary and behaviors | Check them against the code like any other document |
| Configuration and feature flags | Which behaviors are active, and where | A behavior that depends on a flag or an environment is recorded with that limit |

- When sources disagree — a README states one rule and the code enforces another — document the
  implemented behavior, tag the affected scenario `@open-question` when the intent is unclear, and add
  the conflict to the inventory's open questions. Do not pick a winner silently.
- Code that no entry point reaches is not a feature; mention it as a doubt when it looks intentional.
- A class name, a route or an isolated test is a clue. Confirm it against the flow that uses it.

## 5. Citing evidence

Cite repository-relative paths with the symbol, route, command or event that matters
(`src/orders/order-service.js — cancelOrder()`). Add line numbers only when they help a reviewer: they
drift as the code changes. For a test, give its name, the rule it asserts and its environment
(in-memory, mocked, real dependency). Never cite an absolute path, a secret or personal data.

## 6. Analyzing tests without running them

The skill never runs tests: that would execute repository code and make the result depend on an
installed runtime, dependencies, services and the machine. Reading them is reproducible and still
tells a lot.

1. For each candidate feature, find its pertinent tests: the scanner's `testCases`, test names that
   mention the behavior, and tests that import or call the implementing module or entry point.
2. Read each one and note the rule and branch it asserts (the rule holds, or it is enforced), its
   level (unit, integration, end-to-end), its test doubles (mocked repository, stubbed HTTP,
   in-memory fake, real container), and whether it is skipped or only a placeholder (`todo`).
3. Record the coverage in the feature's `# Tests:` line and in the inventory's *Test coverage*
   column: which rules are covered, which rules no test covers, and the skipped tests.
4. A test whose assertion contradicts the implementation is a finding: one of them is wrong. Keep
   the implemented behavior in the scenario, tag it `@open-question`, and add the conflict to the
   inventory's open questions.
5. Coverage does not confirm. A feature becomes *Confirmed* only through a check the user reports —
   a CI run on the current code, a test report they vouch for, a manual verification — and only for
   what that check covers. Cite the check and its reporter in `# Status:`.
