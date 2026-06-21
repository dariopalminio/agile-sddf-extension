# openspec-generate-baseline

Generate an OpenSpec baseline by reverse-engineering existing code and docs, then archive it.

## What it does

Reverse-engineers a baseline set of OpenSpec specifications from existing source code (`src/`),
`README.md`, and `AGENTS.md`, and archives it directly as a historical reference point of the
system's current behavior. It runs `/opsx:propose baseline` (reverse engineering) followed by
`/opsx:archive` — without an apply phase, since the code already exists.

## When to use

- A project has code but no OpenSpec specifications yet
- You want to capture the current system behavior, business rules, and capabilities as a baseline
- You are adopting OpenSpec on an existing codebase

## Installation

Install only this skill:

```bash
npx skills add dariopalminio/agile-sddf-extension --skill openspec-generate-baseline
```

Or install all skills in the repository:

```bash
npx skills add dariopalminio/agile-sddf-extension --all
```

After installation the skill is invoked automatically by context or directly by name.

## Contents

- `SKILL.md` — main instructions

## License

MIT © Dario Palminio
