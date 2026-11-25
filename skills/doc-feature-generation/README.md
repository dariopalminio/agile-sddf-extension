# doc-feature-generation

> **Type:** skill · **Category:** worker  
> **Location:** `.claude/skills/doc-feature-generation/SKILL.md`  
> **Status:** beta

---

## What it does

Reverse-engineers a repository — application, API, library or CLI — into a living specification: a
tree of Cucumber `.feature` files grouped by domain and capability, plus an inventory that ties every
feature to its evidence and its verification status. It implements the agile-sddf guide on
[discovering features and grouping them into capabilities](https://github.com/dariopalminio/agile-sddf/blob/main/docs/guides/descubrir-features-y-capabilities.md).

**Produces:**
- `specs/features/<domain>/<capability>/<feature>.feature`, or the same tree under the directory
  passed with `--output-dir`.
- `feature-inventory.md` at the root of that tree: scope, actors, evidence and status per feature,
  shared rules, open questions and untrusted-content findings.

**Does not do:**
- Write step definitions or run the scenarios.
- Run the project's code or its tests: it reads the tests to record which behaviors they cover, so
  it needs no runtime, dependencies or services of the analyzed project.
- Change source code, tests or configuration, or delete any file.
- Mark a feature as confirmed without a check the user reports, such as a passing CI run on the
  current code.

---

## When to use

**Use it when:**
- You need to know what an existing product actually does, organized as features and capabilities.
- You want to bootstrap or retrofit a Gherkin living spec (`specs/features/`) from existing code.
- You want to add the behaviors that are missing from an existing living-spec tree (`--update`).
- The user mentions: `"reverse-engineer the features"`, `"generate feature files from the code"`, `"descubrir features y capabilities"`.

**Do NOT use it when:**
- You need executable E2E tests with step definitions, hooks and a runner → use `[[test-playwright-cucumber]]` or `[[test-cypress-cucumber]]` instead.
- You need the domain model: bounded contexts, ubiquitous language, business rules → use `[[doc-domain-generation]]` instead.
- You are specifying behavior that does not exist yet → write a user story or a change proposal instead.

---

## Installation

```bash
npx skills add dariopalminio/agile-sddf-extension --skill doc-feature-generation
```

Then invoke it in natural language or with your runtime's skill syntax:

```text
/doc-feature-generation Reverse-engineer this repository into feature files.
/doc-feature-generation --output-dir docs/living-spec --scope apps/api
/doc-feature-generation --lang es --dry-run
/doc-feature-generation --update
```

| Flag | Effect |
|---|---|
| `--output-dir <path>` | Workspace-relative root of the tree; `specs/features/` by default |
| `--scope <path>` | Analyze one part of the workspace, such as one app of a monorepo |
| `--lang <code>` | Gherkin dialect: the dialect of existing features, else `en` |
| `--update` | Add the missing features to an existing tree without rewriting its files |
| `--force` | Overwrite the paths this run regenerates |
| `--dry-run` | Propose the tree without writing anything |
| `--auto` | Skip the review checkpoint |

By default the skill stops once, before writing, to show the proposed tree for review. Its two
bundled scripts need Node.js 18 or later; without Node.js it performs the same checks by hand. A
worked example — an input repository and the tree produced from it — lives in [examples/](examples/).
