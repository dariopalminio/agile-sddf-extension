---
type: wiki
slug: guardrails-index
title: "Índice de Guardrails"
date: 2026-09-20
parent: null
---

# 🛡️ Guardrails

> Restricciones operativas y técnicas **verificables** que un agente IA (o un humano) no debe violar
> al trabajar sobre este repositorio. Cada guardrail es un checklist con severidades (`error`, `warn`)
> y sus reglas deterministas se comprueban con comandos que el propio archivo define
> (`grep`, `git ls-files`, `git check-ignore`, Python 3) — sin scanner externo ni servicio de CI.

---

## Guardrail vs Policy

| Aspecto | Guardrail (`docs/guardrails/`) | Policy (`docs/policies/`) |
|---------|--------------------------------|---------------------------|
| Naturaleza | Restricción operativa/técnica | Regla de gobernanza |
| Formato | Checklist con severidades | Documento declarativo (principios, convenciones) |
| Verificación | Determinista + revisión semántica | Humana o semiautomática |
| Incumplimiento | Bloquea (`error`) o advierte (`warn`) | Requiere juicio; puede escalarse |
| Audiencia primaria | Agentes IA y CI | Humanos y equipos |

Una policy puede originar uno o más guardrails que la hagan verificable. El modelo completo está en
[domain-knowledge-artifacts.md](../domains/domain-knowledge-artifacts.md#6-guardrail-vs-policy).

---

## Regla de incumplimiento

Todos los guardrails comparten el mismo contrato **on breach**:

| Severidad | Efecto |
|-----------|--------|
| `(error)` | Bloquea la entrega — detenerse, nombrar el id de la regla y corregir antes de continuar |
| `(warn)` | No bloquea — aplicarla, o explicar por qué no se aplicó |
| Regla semántica | Si falla, se eleva a juicio humano; nunca se resuelve en silencio |

---

## Convención

- **Nombre de archivo:** `gr-<ámbito>-checklist.md` (kebab-case, prefijo `gr-`)
- **Ids de regla:** cada guardrail usa un prefijo propio (`sec-*`, `ai-*`, `skill-*`, `agent-*`) que los checks imprimen tal cual, de modo que un id que falla identifica al guardrail que lo posee
- **Sin duplicación:** una regla vive en un solo guardrail; los demás la referencian con una nota (`> … Do not duplicate …`) en lugar de copiarla
- **Estructura mínima de cada guardrail:**

| Sección | Contenido |
|---------|-----------|
| Encabezado | Ámbito: a qué aplica y a qué **no** aplica (con enlace al guardrail que sí cubre ese caso) |
| `## Mandatory rules` | Contrato on-breach + `### Deterministic rules` (con id y severidad) + `### Semantic rules` |
| `## Minimum expected structure` | Forma mínima que debe tener el artefacto gobernado |
| `## How to run the validation` | Bloque `bash` autocontenido que ejecuta todos los checks deterministas |
| `## Verification` | Cómo interpretar el resultado (y excepciones aceptadas, si las hay) |
| `## Source of truth` | Fuentes autoritativas que el guardrail resume |

---

## Cómo ejecutar un guardrail

Cada archivo define sus checks en un bloque `bash` completo. Para extraerlo y ejecutarlo desde la raíz del repositorio:

```bash
sed -n '/^```bash$/,/^```$/p' docs/guardrails/gr-ai-security-checklist.md | sed '1d;$d' > run-guardrail.sh
bash run-guardrail.sh
```

Los guardrails de skill y agente asumen una variable fijada una vez (`SKILL=skills/<skill-name>`,
`AGENT=<ruta al archivo del agente>`). Hoy ningún job de CI los ejecuta: corren en la máquina del
mantenedor (ver [SECURITY.md](../../SECURITY.md#how-this-repository-is-validated)).

---

## Índice de guardrails

| Archivo | Ámbito | Prefijo de ids |
|---------|--------|----------------|
| **Repositorio y artefactos de agente** | | |
| [code-security-checklist.md](code-security-checklist.md) | Seguridad del contenido que commitea este repositorio: scripts bajo `skills/*/scripts/`, plantillas de código en `assets/`, `references/` y `examples/`, secretos y artefactos trackeados. No cubre las aplicaciones que un agente construye usando los skills. | `SEC-NN` |
| [ai-security-checklist.md](ai-security-checklist.md) | Seguridad de lo que este repositorio instruye a un agente a leer, ejecutar y confiar: `SKILL.md`, `references/`, `assets/`, guardrails, policies y skills de terceros en `skills-lock.json`. No cubre modelos, datos de entrenamiento ni runtimes. | `AIS-NN` |
| [context-engineering-checklist.md](context-engineering-checklist.md) | Todo artefacto que ocupa la ventana de contexto de un agente: `AGENTS.md`, `CLAUDE.md`, `.claude/agents/*.md` (siempre cargados) y `SKILL.md`, `references/`, `policies/`, `guardrails/` (bajo demanda), más la forma en que el agente ensambla contexto en runtime. | `CTX-NN` |
| [skill-creation-checklist.md](skill-creation-checklist.md) | Todo directorio de Agent Skill bajo `skills/` o `.claude/skills/` — creación, edición o revisión de su diff. No aplica a agentes, policies ni guardrails. | `SKL-NN` |
| [agent-creation-checklist.md](agent-creation-checklist.md) | Todo archivo de definición de agente custom: `.claude/agents/` (Claude Code), `.opencode/agents/` (OpenCode), `.github/agents/*.agent.md` (Copilot), `.agents/agents/` (Antigravity). No aplica a Agent Skills ni a policies. | `AGT-NN` |
| **Arquitectura hexagonal** | | |
| [hexagonal-backend-checklist.md](hexagonal-backend-checklist.md) | Invariantes de Ports & Adapters para el código de negocio de cualquier backend, independiente de framework, ORM, transporte de entrada y topología — capas `domain/`, `application/`, `adapters/in/`, `adapters/out/` y `composition/` y sus tests. | `HEX-BE-NNN` (001–100) |
| [nestjs-hexagonal-backend-checklist.md](nestjs-hexagonal-backend-checklist.md) | Especialización para NestJS + TypeScript: cada módulo de negocio bajo `src/<module>/` con sus capas `api/`, `application/`, `domain/`, `infra/`, su `<module>.module.ts` como composition root y sus tests. No aplica a `src/shared/`. | `HEX-BE-NNN` (101–200) |
| [hexagonal-frontend-checklist.md](hexagonal-frontend-checklist.md) | Invariantes de Ports & Adapters para el código de negocio de cualquier frontend, independiente de UI framework, meta-framework, plataforma y topología — capas `domain/`, `application/`, `adapters/in/`, `adapters/out/` y `composition/` y sus tests. | `HEX-FE-NNN` (001–100) |
| [nextjs-hexagonal-frontend-checklist.md](nextjs-hexagonal-frontend-checklist.md) | Especialización para Next.js (App Router) + TypeScript: cada feature bajo `src/features/<feature>/` con sus capas `ui/`, `application/`, `domain/`, `infra/` y sus dos composition roots (server y client). `src/app/` se trata como adaptador de entrada más externo. | `HEX-FE-NNN` (101–200) |
| [react-hexagonal-frontend-checklist.md](react-hexagonal-frontend-checklist.md) | Especialización para React SPA (React 18+, Vite, React Router 6+) + TypeScript: cada feature bajo `src/features/<feature>/` con sus capas `ui/`, `application/`, `domain/`, `infra/` y un único composition root. El router se trata como adaptador de entrada más externo. | `HEX-FE-NNN` (201–300) |
| **Testing** | | |
| [test-react-testing-library-checklist.md](test-react-testing-library-checklist.md) | Tests de componentes y hooks React con Vitest + `@testing-library/react` + happy-dom + axe-core (`*.test.tsx`, `*.test-d.ts`). No aplica a tests unitarios sin React, backend, integración ni E2E. | `RTL-NN` |
| [test-playwright-cucumber-checklist.md](test-playwright-cucumber-checklist.md) | Suites E2E BDD con `@cucumber/cucumber` + Playwright + TypeScript. No aplica a tests unitarios, de componente ni backend/API-only. | `E2E-PW-NN` |
| [test-cypress-cucumbe-checklist.md](test-cypress-cucumbe-checklist.md) | Suites E2E BDD con `@badeball/cypress-cucumber-preprocessor` + Cypress + TypeScript. No aplica a tests unitarios, de componente ni backend/API-only. | `E2E-CY-NN` |

Los prefijos `HEX-BE` y `HEX-FE` se comparten entre el guardrail genérico y sus especializaciones por
framework; cada archivo posee un bloque de numeración reservado (indicado entre paréntesis) para que
ningún id colisione. Todos los ids son únicos en el proyecto e inmutables una vez publicados: nunca se
renumeran ni se reutilizan.

