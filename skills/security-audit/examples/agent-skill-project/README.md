# Fixture: `agent-skill-project`

Repositorio de ejemplo **deliberadamente inseguro**, usado como caso de prueba de la dimensión `ai`
del skill `security-audit`. No contiene código fuente: solo artefactos agénticos, que es exactamente
el escenario que las reglas `AI-*` auditan y que el cortocircuito de `source_files_found: false`
solía dejar sin evaluar.

> ⚠️ Nada de este directorio debe copiarse a un skill real. Los defectos son intencionados y están
> anotados en línea con el id de la regla que los detecta.

## Cómo ejecutarlo

```
/security-audit --repo skills/security-audit/examples/agent-skill-project --checklist ai
```

## Resultado esperado

| Regla | Estado | Defecto plantado |
|---|---|---|
| AI-001 | ❌ FAIL | `SKILL.md` contiene una instrucción de override del prompt |
| AI-002 | ❌ FAIL | `SKILL.md` indica usar `--dangerously-skip-permissions` |
| AI-003 | ❌ FAIL | frontmatter con `allowed-tools: *` |
| AI-007 | ❌ FAIL | `npm publish` documentado sin confirmación previa |
| AI-008 | ❌ FAIL | ruta `~/.fixture/config.json` |
| AI-010 | ❌ FAIL | entrada `sin-hash` sin `computedHash` |
| AI-011 | ❌ FAIL | entrada `publicador-opaco` con `sourceType: url` y URL desnuda |
| AI-012 | ❌ FAIL | entrada `ruta-con-travesia` con `..` en `skillPath` |
| AI-013 | ❌ FAIL | `curl … \| sh` en las instrucciones |
| AI-004, AI-005, AI-006, AI-009 | ✅ PASS | sin blobs, sin caracteres invisibles, sin ingestión externa, URLs en HTTPS |
| AI-014 … AI-025 | 🔎 REVIEW | reglas semánticas — siempre revisión humana |

## Exclusión de la validación del repositorio

Este directorio contiene, por diseño, las cadenas exactas que
[guardrails/ai-security-checklist.md](../../../../guardrails/ai-security-checklist.md) prohíbe. Por
eso el bloque de validación de ese guardrail excluye `skills/security-audit/examples/` de su
variable `SCAN`: sin la exclusión, el repositorio fallaría su propia auditoría por culpa de sus
fixtures de prueba.
