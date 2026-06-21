# openspec-init-config

Initialize or update the OpenSpec project context in `openspec/config.yaml` from existing docs.

## What it does

Loads project context into `openspec/config.yaml` by exhaustively reading the project's
documentation (`README.md`, `CLAUDE.md`, `AGENTS.md`, and manifests like `package.json`). It
writes only the `context:` field — capturing stack, architecture, conventions, and domain — while
leaving the `schema:` and `rules:` fields untouched.

## When to use

- Initializing the OpenSpec context for a project
- Updating the OpenSpec context after the project's docs or stack have changed

## Installation

Install only this skill:

```bash
npx skills add dariopalminio/agile-sddf-extension --skill openspec-init-config
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
