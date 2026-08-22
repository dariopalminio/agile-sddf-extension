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

## Contents

- `SKILL.md` — main instructions
- `assets/DESIGN.template.md` — output template: frontmatter schema, canonical section order,
  per-section rules, and the pre-save checklist
- `examples/` — reference documents: `DESIGN-vercel.md`, `DESIGN-hero-centric.md`,
  `DESIGN-general-intelligence.md`

## License

MIT 
