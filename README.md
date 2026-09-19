![agile-sddf](assets/logo/agile-sddf-extension-logo-v1.png)
# agile-sddf-extension
Public repository of agent skills, guardrails and policies to extend agile-sddf o coding harnesses.


### The Problem
Adopting AI agents to build software is easy; getting them to work with method, security, and traceability is not. Teams end up with scattered prompts, inconsistent rules, and zero governance over what the agent reads or executes.

### The Solution
agile-sddf-extension is the public repository of skills, guardrails, and policies that extends the agile-sddf framework or your own agent harness — a minimalist multi-agent system that automates the entire specification cycle using only Markdown files as agents, skills, and templates. Installable with a single command (`npx skills add`), it brings production-ready capabilities across the entire SDD cycle: DDD domain document generation, design, changelogs, OWASP security auditing, BDD end-to-end testing, backend/frontend patterns, and OpenSpec support.

### The Differential Value
These are not generic prompts. Each skill is a versioned, tested, and auditable artifact: it includes deterministic guardrails with rule IDs and semantic guardrails for human review. It also incorporates a dual security layer — auditing both the application code (`SEC-*`) and the very artifacts the agent reads (`AI-*`: SKILL.md, AGENTS.md, references) — something no other skills ecosystem offers today. And it ships `skill-master` and `skill-test-evals` so your team can create, benchmark, and maintain its own skills with statistical metrics (mean ± stddev).

## Available Skills

### Meta-framework of skills

- **`skill-master`**: creates and benchmarks new skills with an iterative cycle — `skill-master` orchestrates the complete creation flow;

- **`skill-test-evals`**: manages the lifecycle of evals (generate, execute, benchmark) with three modes: `generate` (creates `evals/evals.json` + skeleton SKILL.md from free description or existing SKILL.md), `evals` (1 run → pass/fail report with evidence) and `benchmark` (N runs × case → statistical metrics mean ± stddev);

### Documents

- **`doc-domain-generation`** — Generate and maintain a living, DDD-oriented domain knowledge document from business context or repository evidence
- **`doc-guardrail-generation`** — Create a guardrail file for one domain: rules split into deterministic (tool + rule id + error/warn) and semantic (AI / human review)
- **`doc-policy-generation`** — Create a `<domain>-policy.md`: guardrails, best practices and operational directives that govern AI agents in one SDD domain
- **`doc-changelog-generation`** — Generate changelog and release notes (user-facing + technical) from git commits, updates, or feature lists

### UX/UI Design

- **`doc-design-generation`** — Create or update a DESIGN.md (design tokens + UI rules) from a product repository or a public website

### Implementation

- **`code-backend-nestjs`** — NestJS best practices and architecture patterns for production-ready applications
- **`code-frontend-library-react`** — React UI library components: CSS pure + BEM + design tokens, TypeScript strict, tsup, Turborepo

### Testing

- **`test-playwright-cucumber`** — E2E tests (E2E) with Cucumber BDD + Playwright (feature files, step definitions, hooks, CI/CD)
- **`test-cypress-cucumber`** — E2E tests (E2E) with Cucumber BDD + Cypress (feature files, step definitions, hooks, CI/CD)
- **`test-nestjs-jest-testing-module`** — Unit tests (UT) for NestJS apps using the Testing Module and Jest
- **`test-nestjs-supertest`** — API integration tests (API/IT) for NestJS with Supertest (routing, guards, pipes, DB isolation)
- **`test-react-testing-library`** — React components tested (CT) with Vitest + Testing Library + happy-dom + axe-core

### Security

- **`security-audit`** — Conditional security audit of a repository: detects the tech stack, evaluates the OWASP-based checklist rules that apply to it, and generates `audit-report.md` (and optional JSON) with findings, code evidence and recommendations. Supports full, release-readiness, story and changed-files scopes.

  It audits two dimensions, selectable with `--checklist code|ai|all`:
  - **`code`** (`SEC-*`) — the application's own code: JWT, XSS, SQLi, CSRF, secrets, uploads, GraphQL, multi-tenancy, crypto, supply chain, plus the runtime risks of apps that call an LLM (OWASP LLM & API Top 10).
  - **`ai`** (`AI-*`) — the artefacts an agent reads and executes: `SKILL.md`, `*.agent.md`, `AGENTS.md`, `references/`, `assets/`, `skills-lock.json`. It is the executable mirror of [guardrails/ai-security-checklist.md](guardrails/ai-security-checklist.md), and it triggers on the presence of those artefacts rather than on an LLM SDK in the dependencies — so a skills repository with no application code at all still gets audited. Its 12 semantic rules are reported as non-blocking `REVIEW` items instead of being judged by the model.

### OpenSpec support

- **`openspec-generate-baseline`** — Reverse-engineers an OpenSpec baseline from existing code and docs (README/AGENTS)
- **`openspec-init-config`** — Initializes/updates OpenSpec project context from README.md, CLAUDE.md, AGENTS.md

## Installation

**For end users** (using npx):
```bash
npx skills add dariopalminio/agile-sddf-extension --skill my-skill
```

Full GitHub URL:
```bash
npx skills add https://github.com/dariopalminio/agile-sddf-extension --skill my-skill
```

Install all skills from a repository:
```bash
npx skills add dariopalminio/agile-sddf-extension --all
```

| Flag | Description |
|------|-------------|
| `-s, --skill <skills...>` | Install only specific skills by name (e.g. `--skill code-backend-nestjs`). Use `*` to install all skills in the repository. |
| `-l, --list` | List all available skills in a repository without installing them |

## Installing Guardrails

Guardrails are standalone Markdown files, not skills: `npx skills add` does not install them. Each
one is self-contained — copy the file into your project and it works, with no companion skill or
script to fetch alongside it.

| Guardrail | Domain |
|-----------|--------|
| `skill-creation.md` | Creating and reviewing Agent Skills |
| `test-cypress-cucumber.md` | E2E BDD suites with Cypress + Cucumber |
| `test-playwright-cucumber.md` | E2E BDD suites with Playwright + Cucumber |

**One guardrail** — download it straight into your project:

```bash
mkdir -p guardrails
curl -fsSL -o guardrails/skill-creation.md \
  https://raw.githubusercontent.com/dariopalminio/agile-sddf-extension/main/guardrails/skill-creation.md
```

**All of them** — a sparse checkout fetches the folder without cloning the rest of the repository:

```bash
git clone --depth 1 --filter=blob:none --sparse \
  https://github.com/dariopalminio/agile-sddf-extension.git .sddf
git -C .sddf sparse-checkout set guardrails
mkdir -p guardrails && cp .sddf/guardrails/*.md guardrails/ && rm -rf .sddf
```

**Then wire it up.** A guardrail only takes effect when agents are told to read it, so add a pointer
in your `AGENTS.md` (or `CLAUDE.md`) — this repository does the same:

```markdown
## Guardrails
- For detailed guidelines on skill creation, see [guardrails/skill-creation.md](guardrails/skill-creation.md).
```

Each guardrail carries a *How to run the validation* section whose commands are copyable as written;
wire those into CI to enforce the deterministic layer, and review the semantic checklist on the PR.

## Repository Structure
```
agile-sddf-extension/
├── agents/
├── guardrails/
│   └── <domain>-checklist.md               # Standalone rule files (deterministic + semantic)
├── policies/
│   └── <domain>-policy.md        # Governance documents
├── skills/
│   └── <skill-name>/             # kebab-case, e.g. code-backend-nestjs
│       ├── SKILL.md              # REQUIRED main file
│       ├── scripts/              # (Optional) Executable scripts
│       ├── references/           # (Optional) Supporting documentation
│       ├── assets/               # (Optional) Static files used by the skill
│       └── lib/                  # (Optional) Shared code for scripts
├── docs/ # Internal documentation for the repository
│   ├── index.md                                            # punto de entrada wiki (wikilinks [[slug]])
│   ├── specs/{01-projects,02-epics,03-stories}/            # artefactos generados por los skills SDD
│   ├── domain/                                             # modelo de dominio del sistema y reglas de negocio
│   ├── requirements/                                       # especificaciones de requisitos del sistema
│   ├── adr/                                                # decisiones de arquitectura (ADR-NNNN, inmutables)
│   ├── architecture/                                       # Arquitectura del sistema (diagramas, decisiones de alto nivel)
│   ├── guardrails/                                         # Guardrails del sistema (reglas de seguridad y buenas prácticas)
│   ├── policies/                                           # constitution.md, dod-story.md y enlaces a guardrails
│   ├── guides/                                             # guías de referencia, how-to-guides (ver docs/index.md)
│   ├── runbooks/                                           # procedimientos operativos (deploy npm, docker)
│   └── templates/                                          # plantillas de generación (meta-artefactos)
├── AGENTS.md                     # Guide for AI agents working in the repo
├── README.md                     # Main repository documentation
└── .gitignore
```

## Crear una nueva skill

* **Creation skill**

```bash
# Ciclo iterativo de creación y benchmarking
/skill-master
```

* **Running Tests**

El framework no tiene suite de tests automatizados para el pipeline principal. La calidad de los skills se valida con el meta-skill `skill-master` mediante ejecución paralela (con skill vs sin skill) y un viewer HTML de benchmarking:

```bash
/skill-master
```

## Creating or Contributing a Skill

Skill conventions, the required frontmatter, and the contribution checklist live in [AGENTS.md](AGENTS.md) — read that file before adding or modifying a skill.
