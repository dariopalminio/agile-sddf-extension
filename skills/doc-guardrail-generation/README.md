# doc-guardrail-generation

Create a guardrail — the single-pass Markdown file that states the rules of one domain, already
sorted by how each rule is verified.

## What it does

Turns a request like *"we need a guardrail for our GitHub Actions workflows"* into one file an agent
or a reviewer reads in a single pass. A guardrail is neither a skill nor a policy: a skill teaches
how to build and runs to thousands of lines; a policy governs, with owner, version and change
history. A guardrail is ~200 lines of rules, and its value is the split:

- **Deterministic rules** — a named command returns a binary verdict. Each cites its tool and
  carries `(error)`, which blocks delivery, or `(warn)`, which does not. These run in CI.
- **Semantic rules** — intent, coverage, domain language, sensitive data. Prose with no severity,
  because no tool can decide them. These are reviewed on the PR.

The axis is verifiability, never importance: the most serious rule in a guardrail is usually a
semantic one. Most concerns split across both layers — *presence* is grep, *correctness* is review.

Every rule in both layers carries an id of the form `<PREFIX>-NN` — `SEC-01`, `HEX-BE-07` — unique
across the project's guardrails, not just within the file, so an `AGENTS.md` can point at several
checklists and an agent can cite `HEX-BE-03` without naming the file. The prefix names the domain;
the number is two digits and immutable: never renumbered, never reused. A check the guardrail
defines itself prints that id on failure, so one grep on the CI output finds the rule.

The document is never written from memory. The skill reads `assets/guardrail.template.md` at run
time and instantiates it: filling every placeholder, keeping the headings and the on-breach
paragraph verbatim, dropping the sections the domain does not support, and stripping every
instructional comment. Change the template and every future guardrail follows.

## When to use

- Writing the rules for a stack, a standard or a testing framework as a file instead of a chat answer
- Turning a long skill into the short gate that can actually be checked on every change
- Adding rules to an existing guardrail while preserving the rules and ids already there
- Capturing the lint configuration and the review checklist for a domain in one place

It writes one guardrail file and nothing else — never source, configuration, CI, or another
guardrail. It does not invent rules: every rule traces to your request, a repository document, or a
standard you named. If the request identifies no domain, it asks before writing.

## Installation

Install only this skill:

```bash
npx skills add dariopalminio/agile-sddf-extension --skill doc-guardrail-generation
```

Or install all skills in the repository:

```bash
npx skills add dariopalminio/agile-sddf-extension --all
```

After installation the skill is invoked automatically by context or directly by name.

## Usage

Every argument is optional — the name, the output folder, and the subject with its candidate rules
and sources:

```text
> Create a guardrail named docker-compose-services in guardrails/: every service pins an image
  digest, no container runs as root, secrets are never plain environment values
> I need a guardrail for our GitHub Actions workflows
> Add a rule about force-pushing to guardrails/git-tbd-custom-use-checklist.md --update
```

What happens next, in order:

1. **Resolves the arguments.** The name is the domain in kebab-case and the file is
   `<name>-checklist.md` — the suffix is idempotent, so a name already ending in `-checklist` is not
   suffixed twice, and there is no `-guardrail` suffix. The folder is the one you gave, an existing
   `guardrails/` or `docs/guardrails/`, or a new `guardrails/`. A name alone or a subject alone is
   enough to proceed; neither means it asks.
2. **Protects what exists.** If the target is already there, it offers regenerate, skip, or compare
   rather than overwriting.
3. **Gathers evidence** from the request and from the source-of-truth files you named. A source that
   does not exist is reported, never quietly ignored and never used to justify an invented rule.
4. **Classifies every rule** with one test — *can you name the command that fails when this rule is
   broken?* Yes goes to the deterministic layer with the command cited; no goes to the semantic layer
   as prose.
5. **Assigns the ids.** It takes the prefix you gave or derives one from the domain, checks it
   against the sibling guardrails in the folder so no two files share a prefix, and numbers the
   rules in one sequence. Under `--update` existing ids are untouched: a new rule takes the next
   free number and a removed one is retired, never reassigned.
6. **Fills the template**, grouping deterministic rules into themed sets of 4–8, keeping the minimum
   structure to the fragments where breaches concentrate, and making every validation command
   copyable as written — each self-defined check printing the id of the rule it enforces.
7. **Validates before saving**: no placeholder, no template comment, one id on every rule, a tool
   and a severity on every deterministic rule, no severity on any semantic one, every tool named
   also present in the commands, and a file that stays near ~200 lines.

You get the guardrail file plus a report: the path, the scope it binds, the prefix and id range, the
rule count per layer with the `(error)` / `(warn)` split, which sections were dropped and why, and
anything you still need to decide.

The result reads like this:

```markdown
Rule IDs: `CYB-NN` — unique across this project's guardrails, immutable once published:
never renumbered, never reused.

**On breach:** `(error)` blocks delivery — stop, name the rule id, fix it before continuing.
`(warn)` does not block — apply it, or state why you did not. A semantic rule that fails is raised
for human judgement; never resolve one silently.

### Deterministic rules (eslint-plugin-cypress / ESLint / tsc)

- [ ] **CYB-01** No `cy.xpath()` — eslint: `cypress/no-xpath` (error)
- [ ] **CYB-02** Every scenario carries one domain tag and one run-level tag — grep (error)

### Semantic rules (AI / human review)

- [ ] **CYB-03** The assigned run-level tag matches the real scope of the scenario.
```

### Flags

| Flag | Behavior |
|------|----------|
| `--dry-run` | Report the target path, the proposed id prefix and the rules classified into each layer. Write nothing. |
| `--force` | Overwrite an existing guardrail without asking. |
| `--update` | Amend in place, preserving the rules and ids already there; new rules take the next free number, removed ones are retired. |
| `--interactive` | Confirm the name, path, id prefix and rule set before writing. |

## Contents

- `SKILL.md` — main instructions
- `assets/guardrail.template.md` — output template: section order, headings, verbatim paragraphs and
  the mandatory rule line format of each layer
- `examples/code-security-checklist.md` — a completed guardrail, with both layers filled and a validation
  section whose grep and git checks are defined in full, so it depends on no external scanner
- `evals/evals.json` — test cases covering the happy path, a topic with no name, a missing domain, an
  existing target file, rule classification, a missing source of truth, `--dry-run`, and template
  decoupling

## License

MIT © Dario Palminio
