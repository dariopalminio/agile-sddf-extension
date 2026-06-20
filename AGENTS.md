# AGENTS.md

This file provides guidance to AI coding agents (Claude Code, Cursor, GitHub Copilot, etc.) when working in this repository.

## 🎯 Repository Purpose

This repository is a collection of **reusable Agent Skills** for software engineering tasks. Skills are self-contained bundles of instructions (and optionally scripts) that extend AI agent capabilities. They can be invoked directly by users, triggered by context, or called by other skills/agents as part of a larger workflow.

**Core focus areas**: Test-Driven Development (TDD), code quality, security, CI/CD, and general software engineering best practices.

For the list of skills currently published in this repo and how end users install them, see [README.md](README.md).

## 🧠 Core Principles for Skills

Every skill in this repository must adhere to these principles:

1.  **Single Responsibility**: Each `SKILL.md` should cover **one specific concern** (e.g., "orchestrating TDD", not "TDD and deployment").
2.  **Progressive Disclosure**: Keep the main `SKILL.md` **under 500 lines**. Put detailed reference material, examples, and long-form documentation in `references/`, loaded only on demand. If `SKILL.md` keeps growing, split its content into separate files inside `references/` rather than letting it become unwieldy.
3.  **Script over Explanation**: For repetitive or deterministic tasks, prefer executable scripts (`scripts/`) over long inline instructions. Scripts run outside the agent's context, saving tokens.
4.  **Clarity for Agents**: The `description` in the skill's frontmatter must be specific and include trigger phrases so the agent knows exactly when to use it.
5.  **English Only**: All `SKILL.md` files and their references must be written in English.

## 🏗️ Repository Structure

Please follow this structure when adding or modifying skills:

```
.
├── skills/                     # Root directory for all skills
│   └── <skill-name>/           # kebab-case, e.g. code-backend-nestjs
│       ├── SKILL.md            # REQUIRED: Main instruction file
│       ├── scripts/            # (Optional) Executable scripts
│       ├── references/         # (Optional) Supporting docs (loaded on demand)
│       ├── assets/             # (Optional) Static files used by the skill
│       └── lib/                # (Optional) Shared code for scripts
├── template/
│   └── SKILL.md                # Base template for new skills
├── spec/
│   └── agent-skills-spec.md    # Agent Skills specification
├── README.md                   # Documentation for end users
└── AGENTS.md                   # This file (documentation for agents)
```

## ✍️ Skill Creation Checklist

When creating a new skill, follow this checklist:

1.  **Create the directory**: `skills/<skill-name>/` (use `kebab-case`).
2.  **Create `SKILL.md`**: Start with the required YAML frontmatter:
    ```yaml
    ---
    name: my-skill-name
    description: Clear description of what it does and when to use it.
    ---
    ```
    | Field | Required | Description |
    |-------|----------|-------------|
    | `name` | Yes | Unique skill identifier (lowercase, hyphens for spaces) |
    | `description` | Yes | Full description of what it does and when to use it, with trigger phrases |
    | `metadata.version` | No (Vercel extension) | Skill version, e.g. `"1.2.0"` |
3.  **Write concise instructions**: Focus on the core workflow. Keep it actionable.
4.  **Add references (if needed)**: Move detailed guides, rules, or long examples to `references/`.
5.  **Add scripts (if needed)**: For any deterministic actions.
6.  **Validate**: Ensure the skill works as expected.
7. **Skill worker**: Ensure that the skill is of type worker, meaning it does not invoke sub-agents nor is it an orchestrator skill. The skill remains autonomous and atomic.

### Naming Conventions

| Element | Convention | Example |
|----------|------------|---------|
| Skill directory | `kebab-case` | `code-backend-nestjs` |
| `SKILL.md` | Always exactly this name | `SKILL.md` |
| Scripts | `kebab-case.sh` or `.mjs` | `deploy.sh`, `collect-signals.mjs` |
| Skill name (frontmatter) | Lowercase, hyphens | `code-backend-nestjs` |

Gerund form (verb + *-ing*, e.g. `testing-react-components`) is an optional community convention some skill names follow.

## 🧪 Quality and Testing Standards

*   **Validate Your Skills**: Use tools like [`skillgrade`](https://github.com/mgechev/skillgrade) to evaluate skill quality and prevent regressions.
*   **Script Requirements**:
    *   **Bash**: Use `#!/bin/bash` and `set -e`.
    *   **Node.js**: Use `#!/usr/bin/env node` and the `.mjs` extension.
    *   **Output**: Send status messages to `stderr` and machine-readable output (e.g., JSON) to `stdout`.
    *   **Cleanup**: Include a trap for cleaning up temporary files.

## 🤝 Contributing and Collaboration

When contributing to this repository:
*   **Propose changes**: For significant changes, open an issue or pull request for discussion.
*   **Maintain consistency**: New skills should mirror the style and structure of existing ones.
*   **Keep it simple**: Avoid over-engineering. The goal is to make skills easy to understand and use.

## 🔗 Useful References

*   [Agent Skills Specification](spec/agent-skills-spec.md)
*   [Skill Template](template/SKILL.md)
*   [Anthropic Skills Repository](https://github.com/anthropics/skills) for examples
*   [Best Practices for Skills](https://github.com/dariopalminio/agile-sddf/blob/main/docs/knowledge/guides/best-practices-for-skills.md)
*   [Best Practices for Skill Testing](https://github.com/dariopalminio/agile-sddf/blob/main/docs/knowledge/guides/best-practices-for-skill-testing.md)
