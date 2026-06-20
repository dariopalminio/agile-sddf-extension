# AGENTS.md

This file provides guidance to AI coding agents (Claude Code, Cursor, GitHub Copilot, etc.) when working in this repository.

## 🎯 Repository Purpose

This repository is a collection of **reusable Agent Skills** for software engineering tasks. Skills are self-contained bundles of instructions (and optionally scripts) that extend AI agent capabilities.

**Core focus areas**: Test-Driven Development (TDD), code quality, security, CI/CD, and general software engineering best practices.

## 🧠 Core Principles for Skills

Every skill in this repository must adhere to these principles:

1.  **Single Responsibility**: Each `SKILL.md` should cover **one specific concern** (e.g., "orchestrating TDD", not "TDD and deployment").
2.  **Progressive Disclosure**: Keep the main `SKILL.md` **under 500 lines**. Put detailed reference material, examples, and long-form documentation in the `references/` directory.
3.  **Script over Explanation**: For repetitive or deterministic tasks, prefer executable scripts (`scripts/`) over long inline instructions. Scripts run outside the agent's context, saving tokens.
4.  **Clarity for Agents**: The `description` in the skill's frontmatter must be specific and include trigger phrases so the agent knows exactly when to use it.
5.  **English Only**: All `SKILL.md` files and their references must be written in English.

## 🏗️ Repository Structure

Please follow this structure when adding or modifying skills:

```
.
├── skills/                     # Root directory for all skills
│   ├── my-skill-1/             # kebab-case for the skill name
│   │   ├── SKILL.md            # REQUIRED: Main instruction file
│   │   ├── scripts/            # (Optional) Executable scripts
│   │   ├── references/         # (Optional) Supporting docs (loaded on demand)
│   │   └── lib/                # (Optional) Shared code for scripts
│   └── my-skill-2/
│       └── SKILL.md
├── template/                   # (Optional) Template for new skills
├── README.md                   # Documentation for humans
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
    *(Optional fields like `metadata.version` can also be included.)*
3.  **Write concise instructions**: Focus on the core workflow. Keep it actionable.
4.  **Add references (if needed)**: Move detailed guides, rules, or long examples to `references/`.
5.  **Add scripts (if needed)**: For any deterministic actions.
6.  **Validate**: Ensure the skill works as expected.

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

*   [Agent Skills Specification](spec/agent-skills-spec.md) (if available)
*   [Skill Template](template/SKILL.md)
*   [Anthropic Skills Repository](https://github.com/anthropics/skills) for examples


