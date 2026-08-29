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

## Usage

Using OpenSpec is optional. This section assumes you have OpenSpec configured in your project. SDDF provides skills to integrate the OpenSpec change management process directly into your specification workflow, allowing you to generate change proposals, implement them, and archive them without leaving the SDDF environment.

```bash
# Initialize the project context in openspec/config.yaml
/openspec-init-config

# Generate OpenSpec specification baseline from existing source code
/openspec-generate-baseline

# Explore an idea without implementing it
/openspec-explore

# Propose a change with all generated artifacts
/openspec-propose "agregar soporte para exportar historias a CSV"

# Implement the tasks of a change
/openspec-apply-change

# Archive a completed change
/openspec-archive-change
```

## Contents

- `SKILL.md` — main instructions

## License

MIT © Dario Palminio
