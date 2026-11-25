# Writing the feature files

Read at step 8, together with `assets/feature-template.feature`: the template gives the shape of a
file, and this reference explains each part.

## Contents

1. Evidence header
2. Tags
3. Feature title and description
4. Rules and scenarios
5. Step style
6. Dialects
7. `Rule:` support in older runners
8. Proposed behavior and open questions

## 1. Evidence header

The comment lines at the top of each file keep the feature traceable without cluttering what a
business reader sees:

```gherkin
# Evidence: src/orders/order-service.js — cancelOrder()
# Evidence: src/orders/orders.routes.js — POST /orders/:id/cancel
# Tests: test/order-service.test.js — "cancels a pending order", "does not cancel a shipped order" (unit, in-memory repository)
# Status: Implemented, unverified — covered by 2 tests, analyzed, not run; no test covers the confirmed or cancelled cases
# See also: ordering/manage-orders/check-order-status.feature (owns the order-ownership rule)
```

- Repository-relative paths, each with a symbol, route, command or event rather than a line number.
- `# Tests:` names the pertinent tests with their level and test doubles, or says `no test covers it`.
  Tests are read, never run.
- `# Status:` repeats the status in words and states the limit of the evidence. A confirmed feature
  names its check and who reported it: `Confirmed — CI run on the current code, reported by the
  user; in-memory repository; no test covers the 20-item limit`.
- With a dialect other than English, `# language: <code>` stays the very first line, above the header.

## 2. Tags

| Tag | Where | Meaning |
|---|---|---|
| `@confirmed`, `@implemented-unverified`, `@partial`, `@proposed` | Feature, exactly one | Verification status, as defined in SKILL.md step 5 |
| `@proposed` | Scenario | Behavior described only by docs or backlog, inside an implemented feature |
| `@open-question` | Scenario | The sources conflict or the trace stopped; a `# Question:` comment says what to confirm |
| `@ui`, `@api`, `@cli`, `@event`, `@job`, `@library` | Feature, optional | Channel through which the actor reaches the behavior |
| `@access-control`, `@audit`, `@i18n`, `@accessibility` | Feature or scenario, optional | Cross-cutting concern worth filtering by |
| `@auth`, `@checkout`, `@catalog`, `@profile`, `@orders` | Feature, optional | Domain, Capability, What area the test covers |
| `@smoke`, `@sanity`, `@regression` | Scenario, optional |  Regression testing type, Run level  |
| `@happy`, `@negative`, `@edge` | Scenario, optional | Nature of the test case, Scenario type |


- Tags are lowercase kebab-case English in every dialect: they are a filtering vocabulary for tools.
- Every tag except the status tag is optional: add one when it helps a reader or a runner filter.
  Take run levels (`@smoke`, `@sanity`, `@regression`) from the project's existing features or CI
  instead of inventing them, because placing a scenario in a run is the team's decision.
- Area tags (`@orders`, `@checkout`) reuse the domain or capability names of the tree, so that tags
  and folders never disagree.
- In update mode, keep the project's existing tags and add a status tag only to the files you write.
- The status tags let a runner skip what is not implemented, for example `--tags "not @proposed"`.

## 3. Feature title and description

- The title names the behavior in the actor's words and matches the file name
  (`cancel-order.feature` holds `Feature: Cancel an order`).
- The description takes two short lines: who uses it and the observable result they get; then the
  rules that distinguish it. Describe the result the evidence shows and never invent a motivation.
- In update mode, follow the narrative style of the existing files (for example *As a / I want / So
  that*), under the same rule about motivation.

## 4. Rules and scenarios

- One `Rule:` per distinct business rule, stated as a constraint (`Only orders that have not shipped can be cancelled`).
- Under each rule, at least one scenario where the rule holds and, when the code has that branch, one
  where it is enforced: a rejection or an alternative result.
- An access restriction is a scenario of the feature it protects. A restriction shared by many
  features is documented once, in the feature that owns it, and referenced with `# See also:`.
- Use a `Scenario Outline` with `Examples` when one flow varies only by data, instead of copying a
  scenario with other values.
- `Background` holds one to three preconditions shared by every scenario of the file; otherwise leave
  it out.
- Leave out framework behavior (routing, JSON parsing), internal steps (logging, caching) and dead
  code. Every scenario states something an actor can observe.

## 5. Step style

| Do | Avoid |
|---|---|
| `Given a pending order of the customer` | `Given the orders table has a row with status 'pending'` |
| `When the customer cancels the order` | `When the client sends POST /orders/o-1/cancel` |
| `Then the order is cancelled` | `Then the response status is 200` |
| One action per `When`, outcomes only in `Then` | `When the customer cancels the order and checks its status` |
| Values the code defines: `more than 20 items` | Values invented for realism |
| Roles: `the customer`, `a warehouse operator` | Real names, emails or identifiers |

When the actor is a developer consuming an API or a library, the public contract is what they
observe, so a returned value, an error code or a thrown error belongs in `Then`
(`Then parsing fails with "unterminated quoted field (line 2)"`). UI mechanics — clicks, selectors,
colors — never belong in a step.

## 6. Dialects

For any dialect other than English, the first line is `# language: <code>`, and keywords, titles,
descriptions and steps use that dialect. Tags stay in English.

| Element | English (`en`) | Spanish (`es`) | Portuguese (`pt`) |
|---|---|---|---|
| Feature | `Feature:` | `Característica:` | `Funcionalidade:` |
| Rule | `Rule:` | `Regla:` | `Regra:` |
| Background | `Background:` | `Antecedentes:` | `Contexto:` |
| Scenario | `Scenario:` | `Escenario:` | `Cenário:` |
| Scenario Outline | `Scenario Outline:` | `Esquema del escenario:` | `Esquema do Cenário:` |
| Examples | `Examples:` | `Ejemplos:` | `Exemplos:` |
| Steps | `Given` `When` `Then` `And` `But` | `Dado` or `Dada`, `Cuando`, `Entonces`, `Y`, `Pero` | `Dado` or `Dada`, `Quando`, `Então`, `E`, `Mas` |

For another dialect, use the keyword list of the project's Gherkin parser. The validator checks the
keywords of `en`, `es`, `pt`, `fr`, `de` and `it`, and only the tree, tags and inventory of others.

## 7. `Rule:` support in older runners

`Rule:` arrived with Gherkin 6. Current Cucumber implementations accept it, but an older parser — for
example behave 1.2.6 — rejects it. When the scanner's `runners` or the project's dependencies show
such a runner, write each rule as a `# Rule: <statement>` comment above its scenarios instead.

## 8. Proposed behavior and open questions

- A `Proposed` feature gets a file only when its source states a concrete rule. Tag the feature
  `@proposed`, cite the source in `# Evidence:` (for example a backlog item) and write the rules it
  states, nothing more.
- Inside an implemented feature, a documented but unimplemented behavior is a scenario tagged
  `@proposed`.
- A doubt is a scenario tagged `@open-question` that states the most likely reading, under a
  `# Question:` comment that names what to confirm. The same question goes to the inventory.
