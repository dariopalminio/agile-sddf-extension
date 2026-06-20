# agile-sddf-extension
Public repository of agent skills to extend agile-sddf

## Structure
```
my-skills-repo/
├── skills/
│   ├── my-skill-1/               # kebab-case for the skill name
│   │   ├── SKILL.md              # REQUIRED main file
│   │   ├── scripts/              # (Optional) Executable scripts
│   │   │   ├── action.sh
│   │   │   └── util.mjs
│   │   ├── references/           # (Optional) Supporting documentation
│   │   │   └── detailed-guide.md
│   │   ├── assets/   
│   │   └── lib/                  # (Optional) Shared code for scripts
│   ├── my-skill-2/
│   │   └── SKILL.md
│   └── ...
├── template/
│   └── SKILL.md                  # Base template for new skills
├── spec/
│   └── agent-skills-spec.md      # (Optional) Skill specification
├── AGENTS.md                     # Guide for AI agents working in the repo
├── README.md                     # Main repository documentation
└── .gitignore
```

## Required frontmatter fields

| Field | Description |
|-------|-------------|
| **`name`** | Unique skill identifier (lowercase, hyphens for spaces) |
| **`description`** | Full description of what it does and when to use it |

### Optional fields (Vercel extension)

| Field | Description |
|-------|-------------|
| **`metadata.version`** | Skill version (e.g. "1.2.0") |

## 🧠 Best Practices and Tips

### 1. Single Responsibility Principle
Each skill should cover **one concern only**. If a `SKILL.md` covers deployment **and** monitoring, split it into two skills.

### 2. Keep `SKILL.md` under 500 lines
The main file is loaded into the agent context when the skill is relevant. Keeping it **under 500 lines** optimizes context usage.

### 3. Progressive Disclosure
Put **only the essential information** in `SKILL.md`. Extended details belong in `references/` and are loaded on demand.

### 4. Prefer Scripts over Inline Code
Scripts run without consuming context (only their output does). Use them for repetitive or computationally intensive tasks.

### 5. Specific Descriptions with Trigger Phrases
The description helps the agent know **exactly when to activate** the skill. Include phrases like *"Optimize my Vercel project"* or *"Review logs"*.

### 6. Consistent Naming

| Element | Convention | Example |
|----------|------------|---------|
| Skill directory | `kebab-case` | `vercel-optimize` |
| `SKILL.md` | Always exactly this name | `SKILL.md` |
| Scripts | `kebab-case.sh` or `.mjs` | `deploy.sh`, `collect-signals.mjs` |
| Skill name (frontmatter) | Lowercase, hyphens | `vercel-optimize` |

### 7. Write in English
Always write `SKILL.md` in English to ensure consistent triggering by agents.

### 8. Use Gerund Verbs (Optional)
Community recommendation: use the **gerund form** (verb + -ing) for skill names, since it clearly describes the activity.

### 9. Validate Your Skills
Tools like [`skillgrade`](https://github.com/mgechev/skillgrade) let you evaluate skill quality and prevent regressions.

### 10. Structure for Scale
When `SKILL.md` becomes manageable, split its content into separate files inside `references/` and reference them.

### 11. Script Requirements

- **Bash**: use `#!/bin/bash` and `set -e`
- **Node**: use `#!/usr/bin/env node` and the `.mjs` extension
- **Status messages**: to `stderr`
- **Machine-readable output**: to `stdout` (JSON)
- **Cleanup**: include a cleanup trap for temporary files
- **Paths**: relative references (e.g. `node scripts/util.mjs`)

### 12. Installation and Distribution

**For end users** (using npx):
```bash
npx skills add your-user/my-skills-repo --skill my-skill
```

Full GitHub URL: 
```bash
npx skills add https://github.com/user/repository --skill my-skill
```
Install all skills from a repository: 
```bash
npx skills add your-user/my-skills-repo --all
```

-s, --skill <skills...>: To install only specific skills by name (e.g. --skill frontend-design). You can use '*' to install all skills in the repository.


-l, --list: To list all available skills in a repository without installing them


