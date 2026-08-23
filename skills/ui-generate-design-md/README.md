# ui-generate-design-md

Create or update a `DESIGN.md` from an existing product repository or a public website.

## What it does

Produces a `DESIGN.md` — machine-readable design tokens in YAML frontmatter plus human-readable
design rules in prose — so coding agents keep persistent UI context instead of re-deciding colors,
type, and spacing on every session. It works in two modes: **repository mode**, where tokens,
themes, shared primitives, and documented guidance establish normative values; and **URL mode**,
where the rendered DOM, computed styles, and loaded stylesheets are sampled to reconstruct a draft.
Every candidate passes an evidence gate before it is written, the document is instantiated from
`assets/DESIGN.template.md`, and the result is validated with `npx @google/design.md lint` plus one
compatibility export (`css-tailwind`, `json-tailwind`, or `dtcg`).

## When to use

- Documenting the design language that governs an existing product
- Reconstructing the visual system of a public website from rendered evidence
- Extracting design tokens, typography scales, and shape rules from current sources
- Updating an existing `DESIGN.md` while preserving its accepted decisions
- Giving coding agents persistent UI context before they build or restyle screens

It modifies only `DESIGN.md` — never product source, dependencies, or configuration — and never
invents tokens, brand personality, or values the evidence does not support. URL mode requires
rendered browser inspection; screenshots, copy, or HTML structure alone are not enough.

## Installation

Install only this skill:

```bash
npx skills add dariopalminio/agile-sddf-extension --skill ui-generate-design-md
```

Or install all skills in the repository:

```bash
npx skills add dariopalminio/agile-sddf-extension --all
```

After installation the skill is invoked automatically by context or directly by name.

## Usage

### Repository mode, end to end

Ask for the document. Nothing else is required — no configuration, no flags:

```text
> Generate a DESIGN.md for this repository
> Update DESIGN.md — the theme tokens changed
> Generate a DESIGN.md for apps/storefront
```

The third form matters in a monorepo. If the repository ships more than one deployable product and
the request does not name one, the skill asks which product to audit before writing anything.

What happens next, in order:

1. **Traces the evidence.** An existing `DESIGN.md` and explicit repository guidance first, then
   tokens, themes, variables and global styles, then shared primitives and their variants, then
   representative routes, and finally surface-local implementations.
2. **Scopes the audit.** A source counts only when the selected product imports, references,
   inherits, or renders it. Proposals, migrations, examples, generated output, legacy code, and
   similarly named packages are excluded.
3. **Picks the export target** from the stack: `css-tailwind` for Tailwind v4, `json-tailwind` for
   Tailwind v3, `dtcg` otherwise.
4. **Checks the installed specification** with `npx @google/design.md spec` before encoding themes.
   When the spec cannot represent modes, default-theme values go into the tokens and the alternate
   theme is preserved in a fallback `## Themes` table.
5. **Instantiates the template** at `assets/DESIGN.template.md`, filling only what the evidence
   supports and deleting every section it does not.
6. **Validates** with `npx @google/design.md lint` and one compatibility export, rewriting the
   frontmatter until every populated category appears in the export output.

You get a `DESIGN.md` at the root of the audited product, plus a report covering: the mode and the
product audited, whether the file was created or updated, the governing sources used, any conflict
or area left out, and the final lint and export results.

The result carries exact values in the frontmatter and the reasoning in prose:

```markdown
---
version: alpha
name: Storefront
description: Commerce surface for a single-brand catalog.
colors:
  background-primary: "#ffffff"
  foreground-primary: "#111827"
  accent: "#2563eb"
typography:
  sans:
    fontFamily: Inter, system-ui, sans-serif
  display:
    fontFamily: Inter, system-ui, sans-serif
    fontSize: 3rem
    lineHeight: 1.1
    fontWeight: 600
rounded:
  base: 0.5rem
---

## Colors

- **accent:** the only fill permitted on a primary action; never used for surfaces or borders.
```

Two things it will not do: it writes `DESIGN.md` and nothing else — never product source,
dependencies, or configuration — and it will not promote a value into a token unless a governing
source already names it, no matter how often the value repeats across components.

URL mode runs the same pipeline against a public site, but it needs rendered browser inspection and
it labels its output as a reconstructed draft.

## Contents

- `SKILL.md` — main instructions
- `assets/DESIGN.template.md` — output template: frontmatter schema, canonical section order,
  per-section rules, and the pre-save checklist
- `examples/` — reference documents: `DESIGN-vercel.md`, `DESIGN-hero-centric.md`,
  `DESIGN-general-intelligence.md`

## License

MIT © Dario Palminio
