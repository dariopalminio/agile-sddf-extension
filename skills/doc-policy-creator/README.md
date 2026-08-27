# doc-policy-creator

Create a `<domain>-policy.md` — the executable specification that governs how AI agents behave in
one domain of a Spec-Driven Development repository.

## What it does

Turns a request like *"agents must never approve their own PRs"* into a durable, structured file
that agents read at execution time. The output is hierarchical and addressable: blocking
**guardrails** (`G-NN`) that abort a task when violated, **best practices** (`BP-NN`) that only
warn, **performance rules** (`R-NN`) that bound context consumption, ordered **operational
directives**, and a category table that tells a reading agent which action each section demands —
`ABORTAR`, `ADVERTIR / SUGERIR`, or `APLICAR`.

The document is never written from memory. The skill reads `assets/policy.template.md` at run time
and instantiates it: filling every placeholder, deleting the sections the domain does not support,
renumbering what remains, and syncing the category table to the sections that actually exist. Change
the template and every future policy follows.

## When to use

- Writing the agent rules for a domain: code review, security, migrations, commit messages, UI
- Capturing prohibitions or non-negotiable constraints as a file instead of a chat answer
- Turning conventions already scattered across `AGENTS.md` or `README.md` into an addressable policy
- Updating an existing policy while preserving its rule IDs and version history

It writes one policy file and nothing else — never source, configuration, or another policy. It does
not invent guardrails: every rule traces to the request, a repository document, or a standard you
named. If the request does not identify a domain, it asks before writing.

## Installation

Install only this skill:

```bash
npx skills add dariopalminio/agile-sddf-extension --skill doc-policy-creator
```

Or install all skills in the repository:

```bash
npx skills add dariopalminio/agile-sddf-extension --all
```

After installation the skill is invoked automatically by context or directly by name.

## Usage

Ask for the policy and name the domain:

```text
> Create a policy for the agents that review our pull requests
> Write a security policy: agents must never commit secrets or disable TLS verification
> Update docs/policies/code-review-policy.md — add a guardrail about force-pushing to main
```

What happens next, in order:

1. **Resolves the domain and path.** The file name is `<domain>-policy.md`. The directory is the one
   you gave, an existing `docs/policies/` · `policies/` · `spec/policies/`, or a new `docs/policies/`.
2. **Protects what exists.** If the target is already there, it offers regenerate, skip, or compare
   rather than overwriting.
3. **Gathers evidence** from the request and from `AGENTS.md`, `CLAUDE.md`, `README.md`, existing
   specs and policies. Anything it cannot source, it asks about.
4. **Instantiates the template**, writing rules as checkable conditions — *"never open a PR that
   changes more than 400 lines"*, not *"keep PRs small"* — with contiguous IDs per family.
5. **Prunes and renumbers.** Sections the domain does not support are deleted, the rest renumbered,
   and the category table rewritten to match. Guardrails and the category table are never dropped.
6. **Validates before saving**: no placeholder left, no template comment left, no `YYYY-MM-DD`,
   contiguous section numbers and rule IDs, and all four metadata fields filled.

You get the policy file plus a report: the path, the scope it binds, how many `G-NN` / `BP-NN` /
`R-NN` rules were written, which sections were dropped and why, and anything you still need to
decide.

The result reads like this:

```markdown
## 3. [GUARDRAIL - BLOQUEANTE] Reglas No Negociables

- **G-01** – ❌ **Sin auto-aprobación**: el agente no debe aprobar un pull request cuyo autor sea él
  mismo o la sesión que generó el cambio.
- **G-03** – ✅ **Validación obligatoria**: el agente debe ejecutar la suite de pruebas y confirmar
  que termina con código de salida `0` antes de emitir una aprobación.

**Acción ante violación:**
El agente debe **ABORTAR** la tarea y notificar el motivo con el ID de la regla (ej. `G-01`).
```

### Flags

| Flag | Behavior |
|------|----------|
| `--dry-run` | Report the target path, rules and sections to keep or drop. Write nothing. |
| `--force` | Overwrite an existing policy without asking. |
| `--update` | Amend in place: preserve rule IDs, bump the version, add a changelog row. |
| `--interactive` | Confirm domain, path and rule set before writing. |

## Contents

- `SKILL.md` — main instructions
- `assets/policy.template.md` — output template: section order, category tags, rule ID scheme,
  metadata block and changelog
- `examples/code-review-policy.md` — a completed policy, shown with sections pruned and renumbered
- `evals/evals.json` — test cases covering the happy path, section pruning, a missing domain, an
  existing target file, and `--dry-run`

## License

MIT © Dario Palminio
