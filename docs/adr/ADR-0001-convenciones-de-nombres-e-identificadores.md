# ADR-0001: Convenciones de nombres para skills, guardrails y políticas, e identificadores de reglas

**Estado:** Aceptado
**Fecha:** 2026-09-19
**Fecha de revisión:** 2027-03-19
**Decisores:** Dario Palminio (mantenedor del repositorio)

## Contexto

El repositorio distribuye tres tipos de artefactos que otros proyectos instalan de forma
independiente: **skills** (`skills/<name>/`), **guardrails** (`guardrails/<domain>-checklist.md`)
y **políticas** (`policies/<domain>-policy.md`). Hasta ahora coexistían tres problemas:

1. **Nombres de skill inconsistentes.** Unos eran sustantivos agentes (`doc-domain-generator`,
   `doc-policy-creator`), otros frases verbo-primero (`ui-generate-design-md`, `using-git-tbd`) y
   otros sustantivos puros (`security-audit`). Un catálogo así no se ordena ni se predice.
2. **IDs de regla planos y repetidos.** Las políticas numeran sus reglas como `G-01`, `BP-01`,
   `R-01`, y los guardrails identificaban cada regla determinista solo por el slug de la herramienta
   (`bdd-*`, `sec-*`) y dejaban las semánticas sin identificador. Cuando un `AGENTS.md` apunta a
   varios archivos, `G-01` es ambiguo y `bdd-01` colisiona (dos guardrails de E2E lo usaban), y una
   regla semántica no puede citarse en absoluto.
3. **Renumeración al editar.** Sin una regla de inmutabilidad, insertar o borrar una regla desplaza
   los números de las siguientes y rompe cualquier referencia externa (issues, PRs, respuestas de
   agentes).

Los agentes de IA responden mejor a reglas con ID citable (`HEX-BE-03`) que a prosa, y solo si ese
ID es estable y único en el proyecto.

## Decisión

### 1. Nombres de skills

- Forma **sustantivo-actividad**: `<sustantivo>-<actividad>` con actividad en `-ing` / `-tion`, o
  **sustantivo puro**. Ejemplos válidos: `doc-domain-generation`, `story-mapping`,
  `security-audit`, `git-worktrees-use`.
- Nunca verbo-primero (`generar-pruebas`, `using-git-tbd`) ni sustantivo agente (`-generator`,
  `-creator`, `-builder`), ni una palabra genérica que no nombre dominio (`auxiliar`).
- kebab-case, ≤ 64 caracteres, y el `name` del frontmatter es idéntico al nombre del directorio.
- Un prefijo de familia agrupa el catálogo: `doc-` (documentos), `test-` (pruebas), `code-`
  (implementación), `git-`, `project-`, `epic-`, `story-`, `skill-`.

### 2. Nombres de guardrails

- Archivo `guardrails/<dominio>-checklist.md`, kebab-case. El sufijo `-checklist` aparece
  exactamente una vez (un nombre que ya lo lleva no se sufija de nuevo) y no existe sufijo
  `-guardrail`: el directorio ya dice qué son.
- El título del documento nombra el mismo dominio que el archivo.

### 3. Nombres de políticas

- Archivo `policies/<dominio>-policy.md`, kebab-case; el título nombra el mismo dominio.
- Cada política es autocontenida: no depende de otra política, de un guardrail ni de un documento
  fuente externo para interpretarse.

### 4. Identificadores de reglas

Aplica a toda regla de guardrails y políticas, sea determinista, semántica, guardrail o buena
práctica.

| Aspecto | Regla |
|---|---|
| Forma | `<PREFIJO>-<NN>`. Prefijo en mayúsculas, uno o dos segmentos de 2–6 letras unidos por `-`; secuencia numérica con padding fijo. |
| Unicidad | **Cada ID es único a nivel global del proyecto**, no solo dentro de su archivo. Un ID citado en un issue, un PR o la respuesta de un agente identifica una sola regla sin ambigüedad. |
| Prefijo | **Dice a qué dominio pertenece la regla sin necesidad de abrir el archivo**: `SEC`, `HEX-BE`, `HEX-FE`, `E2E-CY`. Nunca un token opaco (`CHK1`, `X`). El segundo segmento existe solo para distinguir variantes del mismo dominio (`-BE` / `-FE`). Un prefijo se asigna a un solo archivo; antes de crear uno se comprueban los ya usados en la carpeta. |
| Padding | **2 o 3 dígitos, consistentes dentro del proyecto**, para que los IDs ordenen alfabéticamente. Este repositorio usa **2 dígitos** (`01`–`99`); un archivo que necesitaría más de 99 reglas se divide en dos. Nunca se mezclan anchos (`SEC-1` junto a `SEC-02`). |
| Secuencia | Una secuencia por prefijo, en orden de documento en la primera escritura. En un guardrail, las reglas semánticas continúan la cuenta de las deterministas. |
| Inmutabilidad | Un ID publicado no cambia nunca. Una regla nueva toma el siguiente número libre y se añade al final de su sección, nunca en medio. No se renumera para cerrar huecos. |
| Retiro | Al eliminar una regla, su número se **retira para siempre** y se registra en el archivo (`Retired IDs:`). No se reasigna. |
| Etiqueta emitida | En un guardrail, todo check definido en el propio archivo (grep, find, regla de dependency-cruiser, `no-restricted-syntax`) imprime el ID de la regla en su salida. Solo las reglas publicadas de terceros conservan además su id de herramienta. |
| Severidad | `(error)` / `(warn)` existe solo en la capa determinista de un guardrail; una regla semántica lleva ID pero no severidad. |

Quedan prohibidas las **familias planas repetidas entre archivos** (`G-01` en cada política,
`bdd-01` en cada guardrail de E2E).

## Consecuencias

**Positivas**

- Un `AGENTS.md` puede apuntar a varias checklists y un agente cita `HEX-BE-03` sin nombrar el
  archivo; `grep -r HEX-BE-03` encuentra la regla, su check y sus menciones en un solo paso.
- Los guardrails y las políticas son autónomos y portables a otros proyectos.
- El catálogo de skills se ordena por familia y el nombre predice el artefacto que produce.

**Costes y trabajo derivado**

- Renombrados ya aplicados: `doc-guardrail-creator` → `doc-guardrail-generation`,
  `doc-domain-generator` → `doc-domain-generation`, `doc-policy-creator` → `doc-policy-generation`,
  `doc-readme-generator` → `doc-readme-generation`, `doc-release-notes` →
  `doc-changelog-generation`, `ui-generate-design-md` → `doc-design-generation`, `using-git-tbd`
  → `git-tbd-custom-use`, `using-git-worktrees` → `git-worktrees-use`. Quien los tenga instalados
  por el nombre anterior debe reinstalarlos.
- Pendientes de renombrar: `openspec-generate-baseline`, `openspec-init-config` (verbo-primero);
  `skill-master` queda en revisión por ser genérico.
- El skill `doc-guardrail-generation` ya implementa el esquema de IDs (template, método, ejemplo y
  evals). Los nueve guardrails existentes en `guardrails/` y el skill `doc-policy-generation` (con
  sus familias `G-`/`BP-`/`R-`) deben migrarse; hasta entonces conviven dos esquemas.
- Ningún ID puede reciclarse: la lista de retirados crece con el tiempo y forma parte del archivo.

## Referencias

- `guardrails/skill-creation-checklist.md` — regla semántica de nombre de skill.
- `skills/doc-guardrail-generation/SKILL.md` §5 *Assign the rule ids* y
  `assets/guardrail.template.md` — implementación del esquema de IDs en guardrails.
- `skills/doc-policy-generation/assets/policy.template.md` — familias `G-`/`BP-`/`R-` a migrar.
