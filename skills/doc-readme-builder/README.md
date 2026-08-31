# doc-readme-builder

Generate a project `README.md` from the specification artifacts the repository already has.

## What it does

Turns SDDF spec artifacts — or, when there are none, the LLM-context files or the code itself — into
a complete README written to the project root. The structure never comes from the skill: it is read
at run time from `assets/readme-template.md`, where each `##` / `###` heading defines a section and
the `<!-- -->` comment right below it is the generation prompt for that section. Change the template
and every future README follows, including sections that do not exist today.

The skill documents; it does not implement. It writes exactly one file — the README output — and
touches nothing else: not the source code, not the spec artifacts, and never the template, which is
read-only.

## When to use

- Documenting a project right after `/project-discovery` or `/project-planning`
- Producing a first README for a repository that has specs but no front page
- Rebuilding a README so it matches the current spec artifacts again
- Documenting an undocumented repository, where only `package.json` and the entry points exist

If nothing usable is found in any of the three tiers, the skill says so and exits without writing —
it does not invent a project description.

## Installation

Install only this skill:

```bash
npx skills add dariopalminio/agile-sddf-extension --skill doc-readme-builder
```

Or install all skills in the repository:

```bash
npx skills add dariopalminio/agile-sddf-extension --all
```

After installation the skill is invoked automatically by context or directly by name.

## Usage

Ask for the README. No configuration and no flags are required:

```text
> /readme-builder
> Generate a README for this project
> Build a README from the specs
> Document my project
```

What happens next, in order:

1. **Reads the template** at `assets/readme-template.md`. If it is missing, the skill stops and says
   so rather than falling back to a structure of its own.
2. **Extracts the sections** from the template at run time — headings, hierarchy, and the `<!-- -->`
   prompt attached to each. A heading with no comment uses its own text as the prompt.
3. **Discovers the content in three tiers**, stopping at the first that yields something usable:

   | Tier | Source | What it is |
   |------|--------|------------|
   | 1 | `project-intent.md`, `project.md`, `project-plan.md` under `specs/01-projects/` | Formal SDDF spec artifacts — the primary source |
   | 2 | `AGENTS.md`, `CLAUDE.md`, `.specify/memory/constitution.md` | LLM-context files, used to reconstruct purpose and features |
   | 3 | `package.json` · `pyproject.toml` · `Cargo.toml` · `go.mod`, entry points, top-level directories | Shallow reverse-engineering of the repository |

4. **Guards the existing README.** If `README.md` is already there, it shows the first ten lines and
   asks: overwrite, save as `README-new.md`, or cancel. Cancelling writes nothing at all.
5. **Generates each section** in template order, filling it from the artifacts found. No section is
   added that the template does not have, and none is skipped — a section with no available
   information gets a minimal placeholder instead of disappearing.
6. **Writes to the project root**, always — `README.md`, or `README-new.md` when you chose that
   option. Never a subdirectory.

You get the file written, plus a confirmation: which file, its full path, and how many sections were
generated.

Generated `.md` files are saved as UTF-8 without BOM. Characters like `Ã³` or `ðŸ“–` in the output
mean an encoding error, not a content one.

## Invariants

| Rule | What it means |
|------|---------------|
| Template is read-only | The template file is never written to or modified |
| No hardcoded sections | The structure is always extracted from the template at run time |
| 3-tier discovery | Formal specs → LLM-context files → reverse-engineering |
| Write guard | An existing `README.md` is never overwritten without confirmation |
| Root output only | Output lands in the project root, as `README.md` or `README-new.md` |
| Never write other files | Only the README output is created or modified |

## Contents

- `SKILL.md` — main instructions
- `assets/readme-template.md` — the structural source-of-truth: section order, hierarchy and the
  per-section generation prompts

## License

MIT © Dario Palminio
