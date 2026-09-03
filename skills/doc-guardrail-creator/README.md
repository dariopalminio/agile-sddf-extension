# doc-guardrail-creator

Create a guardrail — the single-pass Markdown file that states the rules of one domain, already
sorted by how each rule is verified.

## What it does

Turns a request like *"we need a guardrail for our GitHub Actions workflows"* into one file an agent
or a reviewer reads in a single pass. A guardrail is neither a skill nor a policy: a skill teaches
how to build and runs to thousands of lines; a policy governs, with owner, version and change
history. A guardrail is ~200 lines of rules, and its value is the split:

- **Deterministic rules** — a named command returns a binary verdict. Each cites its tool and rule
  id and carries `(error)`, which blocks delivery, or `(warn)`, which does not. These run in CI.
- **Semantic rules** — intent, coverage, domain language, sensitive data. Prose, with no rule id and
  no severity, because no tool can decide them. These are reviewed on the PR.

The axis is verifiability, never importance: the most serious rule in a guardrail is usually a
semantic one. Most concerns split across both layers — *presence* is grep, *correctness* is review.

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
npx skills add dariopalminio/agile-sddf-extension --skill doc-guardrail-creator
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
> Add a rule about force-pushing to guardrails/using-git-tbd-checklist.md --update
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
5. **Fills the template**, grouping deterministic rules into themed sets of 4–8, keeping the minimum
   structure to the fragments where breaches concentrate, and making every validation command
   copyable as written.
6. **Validates before saving**: no placeholder, no template comment, a tool and a severity on every
   deterministic rule, none on any semantic one, every tool named also present in the commands, and a
   file that stays near ~200 lines.

You get the guardrail file plus a report: the path, the scope it binds, the rule count per layer with
the `(error)` / `(warn)` split, which sections were dropped and why, and anything you still need to
decide.

The result reads like this:

```markdown
**On breach:** `(error)` blocks delivery — stop, name the rule id, fix it before continuing.
`(warn)` does not block — apply it, or state why you did not. A semantic rule that fails is raised
for human judgement; never resolve one silently.

### Deterministic rules (eslint-plugin-cypress / ESLint / tsc)

- [ ] No `cy.xpath()` — `cypress/no-xpath` (error)
- [ ] Every scenario carries one domain tag and one run-level tag — grep (error)

### Semantic rules (AI / human review)

- [ ] The assigned run-level tag matches the real scope of the scenario.
```

### Flags

| Flag | Behavior |
|------|----------|
| `--dry-run` | Report the target path and the rules classified into each layer. Write nothing. |
| `--force` | Overwrite an existing guardrail without asking. |
| `--update` | Amend in place, preserving the rules and ids already there. |
| `--interactive` | Confirm the name, path and rule set before writing. |

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
