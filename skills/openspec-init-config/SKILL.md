---
name: openspec-init-config
description: Loads the project context into openspec/config.yaml by exhaustively reading the project documentation (README.md, CLAUDE.md, AGENTS.md). Use when you want to initialize or update the OpenSpec context for a project.
license: MIT
metadata:
  owner: dariopalminio/agile-sddf-extension
---

# OpenSpec Context Initialization

## Overview

Loads the project context into `openspec/config.yaml` by exhaustively reading the project's existing documentation, so that OpenSpec has an accurate context (stack, architecture, conventions, and domain).

**Capabilities:**
- Reads the project documentation (`README.md`, `CLAUDE.md`, `AGENTS.md`, and other root files).
- Infers stack and dependencies from manifests (`package.json`, `pyproject.toml`, etc.).
- Writes or updates **only** the `context:` field in `openspec/config.yaml`.

**Limitations:**
- Does not modify the `schema:` or `rules:` fields (or their comments) in `openspec/config.yaml`.
- The resulting context is only as good as the documentation that exists in the project.

## Prerequisites

- The `openspec/config.yaml` file must exist in the project.
- Ideally one or more documentation files exist (`README.md`, `CLAUDE.md`, `AGENTS.md`).
- The **Edit** tool is available to update the configuration file.

## Execution

1. **Exhaustively read the project documentation**

   Read the following files in order, if they exist:
   - `README.md` — primary source: project purpose, technology stack, architecture, conventions
   - `CLAUDE.md` — project instructions, directory structure, agent and skill patterns
   - `AGENTS.md` — agent definitions, roles, and capabilities
   - Other relevant files you find in the project root (for example `package.json`, `pyproject.toml`, etc.) to infer stack and dependencies

   **IMPORTANT**: Do not skip any of these files if they exist. The context you write will be only as good as the documentation you read.

2. **Read the `openspec/config.yaml` file**

   Read the whole file to understand its current structure and the comment template that indicates how to fill in the `context:` field.

3. **Write the `context:` field in `openspec/config.yaml`**

   Use the **Edit** tool to update **only** the `context:` field in `openspec/config.yaml`.

   - If the `context:` field already exists, replace it with the new content
   - If the `context:` field does not exist, add it after the `schema: spec-driven` line
   - **Keep intact** the `schema:` field and the `rules:` field (and their comments) — only modify `context:`

   The content of the `context:` field must include (in YAML multiline format with `|`):
   - **Technology stack**: languages, frameworks, main tools
   - **Architecture**: project structure, patterns used, key modules
   - **Conventions**: naming, commits, file organization, code style
   - **Domain**: what the project does, for whom, what its purpose is

   Example format:
   ```yaml
   context: |
     Stack: Python, Markdown, YAML
     Architecture: multi-agent system with specialized skills and agents
     Conventions: kebab-case for file names, conventional commits
     Domain: agile specification framework for software projects
   ```

## Output

- The `context:` field of `openspec/config.yaml` created or updated, in YAML multiline format (`|`), with stack, architecture, conventions, and domain.
- The `schema:` and `rules:` fields remain intact.
- The final content of the `context:` field is shown to the user, confirming the file was updated correctly.

## Examples

**Manual invocation:**
`/openspec-init-config`
→ Reads `README.md`, `CLAUDE.md`, and `AGENTS.md`, infers the stack from `package.json`, and writes the `context:` field in `openspec/config.yaml`, showing the final result.
