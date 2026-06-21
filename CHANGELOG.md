# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-06-21

Initial public release of **agile-sddf-extension**, a collection of agent skills to extend agile-sddf.

### Added

- **Implementation skills**
  - `code-backend-nestjs` — NestJS best practices and architecture patterns for production-ready applications.
  - `code-frontend-library-react` — React UI library components with pure CSS + BEM + design tokens, TypeScript strict, tsup, and Turborepo.
- **Testing skills**
  - `test-playwright-cucumber` — E2E tests with Cucumber BDD + Playwright (feature files, step definitions, hooks, CI/CD).
  - `test-cypress-cucumber` — E2E tests with Cucumber BDD + Cypress (feature files, step definitions, hooks, CI/CD).
  - `test-nestjs-jest-testing-module` — Unit tests for NestJS apps using the Testing Module and Jest.
  - `test-nestjs-supertest` — API integration tests for NestJS with Supertest (routing, guards, pipes, DB isolation).
  - `test-react-testing-library` — React component tests with Vitest + Testing Library + happy-dom + axe-core.
- **Utility skills**
  - `doc-release-notes` — Generate changelogs and release notes (user-facing and technical) from git commits, updates, or feature lists.
- **OpenSpec support skills**
  - `openspec-generate-baseline` — Reverse-engineers an OpenSpec baseline from existing code and docs (README/AGENTS).
  - `openspec-init-config` — Initializes/updates OpenSpec project context from README.md, CLAUDE.md, AGENTS.md.
- **Project foundation**
  - Agent Skills specification (`spec/agent-skills-spec.md`).
  - Base `SKILL.md` template for authoring new skills.
  - `AGENTS.md` contributor guide and `README.md` repository documentation.
  - Project logo.

[Unreleased]: https://github.com/dariopalminio/agile-sddf-extension/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/dariopalminio/agile-sddf-extension/releases/tag/v0.1.0
