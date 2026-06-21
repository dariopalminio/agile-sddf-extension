---
name: code-backend-nestjs
description: NestJS best practices and architecture patterns for building production-ready applications. This skill should be used when writing, reviewing, or refactoring NestJS code to ensure proper patterns for modules, dependency injection, security, and performance.
license: MIT
metadata:
  author: Kadajett, https://github.com/dariopalminio
  owner: dariopalminio/agile-sddf-extension
  version: "1.1.0"
---

# NestJS for backend code

## Overview

Comprehensive best practices guide for backend code or NestJS applications. Contains references across different categories, prioritized by impact to guide automated refactoring and code generation.

**Capabilities:**
- Guide writing of NestJS modules, controllers, and services with proper patterns.
- Apply architecture, dependency injection, error handling, security, and performance best practices.
- Drive automated refactoring and code generation, prioritized by impact.

**Limitations:**
- Guidance/reference only — does not scaffold or run code by itself.
- Focused on NestJS backend code; not for frontend or non-NestJS stacks.

## Prerequisites

Reference these guidelines when:

- Writing new NestJS modules, controllers, or services
- Implementing authentication and authorization
- Reviewing code for architecture and security issues
- Refactoring existing NestJS codebases
- Optimizing performance or database queries
- Building microservices architectures

## Rule Categories by Priority

| Priority | Category | Impact | Prefix |
|----------|----------|--------|--------|
| 1 | Architecture | CRITICAL | `arch-` |
| 2 | Dependency Injection | CRITICAL | `di-` |
| 3 | Error Handling | HIGH | `error-` |
| 4 | Security | HIGH | `security-` |
| 5 | Performance | HIGH | `perf-` |
| 6 | Database & ORM | MEDIUM-HIGH | `db-` |
| 7 | API Design | MEDIUM | `api-` |
| 8 | Microservices | MEDIUM | `micro-` |
| 9 | DevOps & Deployment | LOW-MEDIUM | `devops-` |

## Examples

Read individual reference files as if they were rules and get detailed explanations and code examples:

```
references/arch-avoid-circular-deps.md
references/security-validate-all-input.md
references/_sections.md
```

Each reference file contains:
- Brief explanation of why it matters
- Incorrect code example with explanation
- Correct code example with explanation
- Additional context and references

## References

For more details, consult these reference files (loaded on demand):

### 1. Architecture (CRITICAL)

- [references/arch-avoid-circular-deps.md](references/arch-avoid-circular-deps.md) - Avoid circular module dependencies
- [references/arch-feature-modules.md](references/arch-feature-modules.md) - Organize by feature, not technical layer
- [references/arch-module-sharing.md](references/arch-module-sharing.md) - Proper module exports/imports, avoid duplicate providers
- [references/arch-single-responsibility.md](references/arch-single-responsibility.md) - Focused services over "god services"
- [references/arch-use-repository-pattern.md](references/arch-use-repository-pattern.md) - Abstract database logic for testability
- [references/arch-use-events.md](references/arch-use-events.md) - Event-driven architecture for decoupling
- [references/arch-hexagonal-ddd-structure.md](references/arch-hexagonal-ddd-structure.md) - Structure modules with DDD + hexagonal architecture (ports & adapters)

### 2. Dependency Injection (CRITICAL)

- [references/di-avoid-service-locator.md](references/di-avoid-service-locator.md) - Avoid service locator anti-pattern
- [references/di-interface-segregation.md](references/di-interface-segregation.md) - Interface Segregation Principle (ISP)
- [references/di-liskov-substitution.md](references/di-liskov-substitution.md) - Liskov Substitution Principle (LSP)
- [references/di-prefer-constructor-injection.md](references/di-prefer-constructor-injection.md) - Constructor over property injection
- [references/di-scope-awareness.md](references/di-scope-awareness.md) - Understand singleton/request/transient scopes
- [references/di-use-interfaces-tokens.md](references/di-use-interfaces-tokens.md) - Use injection tokens for interfaces

### 3. Error Handling (HIGH)

- [references/error-use-exception-filters.md](references/error-use-exception-filters.md) - Centralized exception handling
- [references/error-throw-http-exceptions.md](references/error-throw-http-exceptions.md) - Use NestJS HTTP exceptions
- [references/error-handle-async-errors.md](references/error-handle-async-errors.md) - Handle async errors properly

### 4. Security (HIGH)

- [references/security-auth-jwt.md](references/security-auth-jwt.md) - Secure JWT authentication
- [references/security-validate-all-input.md](references/security-validate-all-input.md) - Validate with class-validator
- [references/security-use-guards.md](references/security-use-guards.md) - Authentication and authorization guards
- [references/security-sanitize-output.md](references/security-sanitize-output.md) - Prevent XSS attacks
- [references/security-rate-limiting.md](references/security-rate-limiting.md) - Implement rate limiting

### 5. Performance (HIGH)

- [references/perf-async-hooks.md](references/perf-async-hooks.md) - Proper async lifecycle hooks
- [references/perf-use-caching.md](references/perf-use-caching.md) - Implement caching strategies
- [references/perf-optimize-database.md](references/perf-optimize-database.md) - Optimize database queries
- [references/perf-lazy-loading.md](references/perf-lazy-loading.md) - Lazy load modules for faster startup

### 6. Database & ORM (MEDIUM-HIGH)

- [references/db-use-transactions.md](references/db-use-transactions.md) - Transaction management
- [references/db-avoid-n-plus-one.md](references/db-avoid-n-plus-one.md) - Avoid N+1 query problems
- [references/db-use-migrations.md](references/db-use-migrations.md) - Use migrations for schema changes

### 7. API Design (MEDIUM)

- [references/api-use-dto-serialization.md](references/api-use-dto-serialization.md) - DTO and response serialization
- [references/api-use-interceptors.md](references/api-use-interceptors.md) - Cross-cutting concerns
- [references/api-versioning.md](references/api-versioning.md) - API versioning strategies
- [references/api-use-pipes.md](references/api-use-pipes.md) - Input transformation with pipes

### 8. Microservices (MEDIUM)

- [references/micro-use-patterns.md](references/micro-use-patterns.md) - Message and event patterns
- [references/micro-use-health-checks.md](references/micro-use-health-checks.md) - Health checks for orchestration
- [references/micro-use-queues.md](references/micro-use-queues.md) - Background job processing

### 9. DevOps & Deployment (LOW-MEDIUM)

- [references/devops-use-config-module.md](references/devops-use-config-module.md) - Environment configuration
- [references/devops-use-logging.md](references/devops-use-logging.md) - Structured logging
- [references/devops-graceful-shutdown.md](references/devops-graceful-shutdown.md) - Zero-downtime deployments

> These files are only loaded if the agent needs additional context.
