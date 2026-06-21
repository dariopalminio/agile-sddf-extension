# code-backend-nestjs

NestJS best practices and architecture patterns for building production-ready applications.

## What it does

Provides a comprehensive, impact-prioritized set of best practices for NestJS backend code,
spanning architecture, dependency injection, error handling, security, performance, database &
ORM, API design, microservices, and DevOps. Each rule lives in a `references/` file with a brief
rationale plus incorrect/correct code examples to guide automated refactoring and code generation.

## When to use

- Writing new NestJS modules, controllers, or services
- Implementing authentication and authorization
- Reviewing code for architecture and security issues
- Refactoring existing NestJS codebases
- Optimizing performance or database queries
- Building microservices architectures

## Installation

Install only this skill:

```bash
npx skills add dariopalminio/agile-sddf-extension --skill code-backend-nestjs
```

Or install all skills in the repository:

```bash
npx skills add dariopalminio/agile-sddf-extension --all
```

After installation the skill is invoked automatically by context or directly by name.

## Contents

- `SKILL.md` — main instructions
- `references/` — per-rule guides loaded on demand (architecture, DI, security, performance, …)

## License

MIT © Dario Palminio. Original author: Kadajett (https://github.com/dariopalminio).
