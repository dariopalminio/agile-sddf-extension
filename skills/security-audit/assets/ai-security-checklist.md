# AI Security Audit Checklist (artefactos agénticos)

Reglas de auditoría de seguridad de **artefactos que un agente lee y ejecuta**: `SKILL.md`, `*.agent.md`, `*.agent.yaml`, `*.agent.json`, `references/`, `assets/`, `AGENTS.md`, `CLAUDE.md`, guardrails, policies y `skills-lock.json`.

Este archivo es la fuente de verdad de la **dimensión `ai`** del skill `security-audit`. Es la versión ejecutable de `guardrails/ai-security-checklist.md`: cada regla conserva el id `ai-*` original del guardrail en su campo `**Referencia:**` para trazabilidad bidireccional.

**Qué NO cubre este checklist:** el código de una aplicación que consume un LLM (prompt injection en runtime, RAG, vector stores, coste de tokens). Eso vive en `assets/security-checklist.md` (SEC-036..040, SEC-051..056, SEC-082..089). Tampoco cubre modelos, datasets, retención ni linaje de datos: este checklist audita instrucciones en texto, no infraestructura de ML.

**Condiciones disponibles:** `has_agentic_config_files`, `has_skills_lock`, `agent_docs_ingest_external_content`

**Operadores lógicos:** `AND`, `OR`, `NOT`

**Alcance de búsqueda:** las reglas `AI-*` NO se limitan a extensiones de código fuente. Su alcance es la lista `agent_facing_files` de `project-context.json` más `skills-lock.json`. Estas reglas se evalúan aunque `source_files_found` sea `false` — un repositorio de solo Markdown es precisamente el caso que este checklist audita.

---

## Formato de regla

Cada regla declara un campo `**Tipo:**` adicional al formato de `security-checklist.md`:

- `deterministic` — se evalúa por patrón; produce `PASS` o `FAIL` con evidencia (archivo, línea, fragmento).
- `semantic` — no tiene patrón evaluable estáticamente; produce **siempre** `REVIEW` y describe qué debe revisar una persona. Nunca se convierte en `PASS` ni en `FAIL` por juicio del evaluador.

---

## Grupo A1: Instrucciones dirigidas al agente

### AI-001: Instrucción de ignorar o anular las propias reglas del agente

**Condición:** `has_agentic_config_files`
**Tipo:** deterministic
**Requerimiento:** Ningún skill, agente ni documento debe instruir a un agente futuro a ignorar o descartar sus propias instrucciones, reglas o guardrails. Un artefacto que contiene esa instrucción es un vector de prompt injection persistente en el repositorio.
**Severidad:** CRITICAL
**Patrones de detección** (búsqueda **insensible a mayúsculas**: una instrucción inyectada suele abrir frase):
- `ignore (all )?(previous|prior|above) instructions`
- `disregard (the|your) (guardrails|rules|instructions)`
- `olvida (las|tus) (instrucciones|reglas) (previas|anteriores)`
- `ignora (las|tus) (instrucciones|reglas|guardrails)`
**Referencia:** guardrail `ai-no-prompt-override`; OWASP LLM01:2025 Prompt Injection

---

### AI-002: Instrucción de saltar prompts de permiso o ampliar permisos de archivo

**Condición:** `has_agentic_config_files`
**Tipo:** deterministic
**Requerimiento:** Ningún artefacto debe indicar al agente que evite un prompt de permiso ni que amplíe permisos de archivo. Estos flags desactivan la barrera de confirmación humana en toda ejecución posterior, no solo en el paso que los documenta.
**Severidad:** CRITICAL
**Patrones de detección:**
- `dangerously-skip-permissions`
- `bypassPermissions`
- `chmod[[:space:]]+777`
- `sudo` en instrucciones de arranque de un skill o agente
**Referencia:** guardrail `ai-no-safety-bypass`; OWASP LLM06:2025 Excessive Agency, CWE-250

> Esta regla y AI-013 sustituyen a SEC-079 cuando la dimensión `ai` está activa: cubren el mismo riesgo con mayor alcance (todo artefacto agéntico, no solo los de proyectos con SDK de LLM detectado).

---

### AI-003: `allowed-tools` con comodín o vacío

**Condición:** `has_agentic_config_files`
**Tipo:** deterministic
**Requerimiento:** Cuando el frontmatter declara `allowed-tools`, debe ser una lista explícita de herramientas: nunca `*` ni un valor vacío. Un comodín concede al skill toda la superficie de herramientas disponible, incluida la ejecución de shell y el acceso de red que su flujo no necesita.
**Severidad:** HIGH
**Patrones de detección:**
- `^allowed-tools:[[:space:]]*\*`
- `^allowed-tools:[[:space:]]*$`
- `^allowed-tools:[[:space:]]*\[[[:space:]]*\]`
**Referencia:** guardrail `ai-tools-not-wildcard`; OWASP LLM06:2025 Excessive Agency

---

### AI-004: Blob codificado opaco no auditable

**Condición:** `has_agentic_config_files`
**Tipo:** deterministic
**Requerimiento:** Ningún artefacto debe incrustar una cadena codificada opaca de 200 caracteres o más que un revisor no pueda auditar a simple vista. Un blob así puede transportar instrucciones o código sin pasar por revisión.
**Severidad:** MEDIUM
**Patrones de detección:**
- `[A-Za-z0-9+/]{200,}={0,2}`
- `base64 -d` o `atob(` seguido de ejecución (`| sh`, `eval`, `> archivo`)
**Referencia:** guardrail `ai-no-opaque-blob`; CWE-506

---

### AI-005: Caracteres invisibles o bidireccionales en artefactos de texto

**Condición:** `has_agentic_config_files`
**Tipo:** deterministic
**Requerimiento:** Ningún archivo de texto versionado debe contener caracteres invisibles o de control bidireccional: zero-width (`U+200B`–`U+200F`, `U+2060`–`U+2064`, `U+FEFF`), override bidi (`U+202A`–`U+202E`, `U+2066`–`U+2069`), bloque Tag Unicode (`U+E0000`–`U+E007F`) ni escapes ANSI. Son el vehículo del ASCII smuggling: instrucciones que el revisor humano no ve y el modelo sí lee.
**Severidad:** HIGH
**Patrones de detección (expresados como escapes — nunca buscar con el carácter literal):**
- rango `\x{200B}-\x{200F}` (zero-width)
- rango `\x{202A}-\x{202E}` y `\x{2066}-\x{2069}` (override bidireccional)
- rango `\x{2060}-\x{2064}`, `\x{FEFF}` (joiners y BOM interno)
- rango `\x{E0000}-\x{E007F}` (bloque Tag Unicode)
- secuencia de escape ANSI `\x1B[`
**Excepción legítima:** un archivo que documenta o sanea estos code points los escribe como escapes (`\u200B`, `\x{E0000}`), nunca literales — si aparecen solo como escapes, la regla es `PASS`.
**Referencia:** guardrail `ai-no-hidden-characters`; OWASP LLM01:2025 (variante Unicode), CWE-116

---

## Grupo A2: Entrada no confiable y acción irreversible

### AI-006: Cláusula de contenido no confiable ausente en skills que ingieren contenido externo

**Condición:** `has_agentic_config_files AND agent_docs_ingest_external_content`
**Tipo:** deterministic
**Requerimiento:** Un skill que ingiere contenido de fuera del repositorio — una URL descargada, un archivo que el usuario nombró, la salida de un comando — debe declarar en su cuerpo que ese contenido es **dato y nunca instrucción**. Sin la cláusula, el agente que ejecute el skill tratará como orden cualquier texto inyectado en la fuente.
**Severidad:** MEDIUM
**Patrones de detección:**
- Archivo con `WebFetch`, `WebSearch`, `curl `, `fetch `, "the user named", "fuente de verdad" o "source of truth" **y sin** ninguno de: `untrusted`, `no confiable`, `as data, never as instructions`, `dato y nunca (una )?instrucci`
**Referencia:** guardrail `ai-untrusted-content-clause`; OWASP LLM01:2025 Indirect Prompt Injection

---

### AI-007: Comando destructivo documentado sin la confirmación que lo precede

**Condición:** `has_agentic_config_files`
**Tipo:** deterministic
**Requerimiento:** Un artefacto que documenta un comando destructivo o de cara al exterior (`git push --force`, `git reset --hard`, `rm -rf`, `npm publish`, `gh pr merge`) debe documentar también la confirmación explícita que lo precede. Un paso irreversible sin puerta de confirmación se ejecutará sin que nadie lo autorice.
**Severidad:** MEDIUM
**Patrones de detección:**
- Archivo que contiene `git push --force`, `git reset --hard`, `rm -rf`, `npm publish` o `gh pr merge` **y no** contiene `confirm`, `approval`, `approve`, `ask the user`, `authoriz`, `confirmaci`, `aprobaci` o `preguntar al usuario`
**Referencia:** guardrail `ai-confirm-before-irreversible`; OWASP LLM06:2025 Excessive Agency

---

### AI-008: Instrucción que apunta al directorio home del usuario

**Condición:** `has_agentic_config_files`
**Tipo:** deterministic
**Requerimiento:** Ninguna instrucción dirigida a un agente debe apuntar al directorio home del usuario (`~/`, `$HOME/`, `%USERPROFILE%`). Un skill trabaja dentro del directorio que el usuario abrió; salir de él da acceso a credenciales, historial de shell y repositorios ajenos al trabajo en curso.
**Severidad:** HIGH
**Patrones de detección:**
- `(^|[^[:alnum:]`])~/` en `SKILL.md`, `*.agent.md`, `references/*.md`, `assets/*.md`
- `\$HOME/`
- `%USERPROFILE%`
**Referencia:** guardrail `ai-no-home-path`; CWE-22, OWASP LLM06:2025

---

### AI-009: URL externa sin esquema HTTPS

**Condición:** `has_agentic_config_files`
**Tipo:** deterministic
**Requerimiento:** Toda URL externa referenciada en un artefacto agéntico debe usar `https://`. `localhost` y las direcciones de loopback son la única excepción. Una descarga por HTTP es alterable en tránsito, y lo que se altera es una instrucción que el agente ejecutará.
**Severidad:** MEDIUM
**Patrones de detección:**
- `http://[A-Za-z0-9.:_-]+` excluyendo `localhost`, `127.0.0.1` y `[::1]`
**Nota de alcance:** esta regla verifica **solo el esquema**. La lista blanca de dominios permitidos no pertenece a este checklist — vive en `guardrails/skill-creation-checklist.md` (`skill-url-allowlist`).
**Referencia:** guardrail `ai-https-only`; CWE-319

---

## Grupo A3: Skills de terceros y contenido ejecutado

### AI-010: Entrada de `skills-lock.json` sin `computedHash` de 64 hex

**Condición:** `has_skills_lock`
**Tipo:** deterministic
**Requerimiento:** Toda entrada de `skills-lock.json` debe declarar un `computedHash` de 64 caracteres hexadecimales: es el único pin de integridad que este formato de lock ofrece. Sin él, el contenido del skill de terceros puede cambiar entre instalaciones sin dejar rastro.
**Severidad:** HIGH
**Patrones de detección:**
- Entrada de `skills` sin campo `computedHash`
- `computedHash` que no cumple `^[0-9a-f]{64}$` (vacío, truncado, con mayúsculas o con prefijo `sha256:`)
**Referencia:** guardrail `ai-locked-skill-hash`; OWASP LLM03:2025 Supply Chain, CWE-494

---

### AI-011: Entrada de `skills-lock.json` sin publicador identificable

**Condición:** `has_skills_lock`
**Tipo:** deterministic
**Requerimiento:** Toda entrada debe nombrar un publicador identificable: `sourceType: github` con un `source` en formato `owner/repo`. Nunca una URL desnuda ni un mirror, porque ninguno de los dos permite auditar quién publica el código que el agente ejecutará.
**Severidad:** HIGH
**Patrones de detección:**
- Entrada con `sourceType` distinto de `github`
- `source` que no cumple `^[\w.-]+/[\w.-]+$` (URL completa, ruta local o cadena vacía)
**Referencia:** guardrail `ai-locked-skill-source`; OWASP LLM03:2025 Supply Chain

---

### AI-012: `skillPath` no relativo o con travesía de directorios

**Condición:** `has_skills_lock`
**Tipo:** deterministic
**Requerimiento:** Todo `skillPath` debe ser relativo al repositorio, sin segmento `..` y sin barra inicial. Una ruta absoluta o con travesía instala contenido fuera del árbol previsto.
**Severidad:** HIGH
**Patrones de detección:**
- `skillPath` vacío
- `skillPath` que empieza por `/` o por una letra de unidad (`C:\`)
- `skillPath` que contiene un segmento `..`
**Referencia:** guardrail `ai-locked-skill-path`; CWE-22

---

### AI-013: Contenido remoto canalizado a un intérprete

**Condición:** `has_agentic_config_files`
**Tipo:** deterministic
**Requerimiento:** Ningún comando documentado ni script del repositorio debe canalizar contenido remoto hacia un intérprete. El contenido descargado se ejecuta sin que nadie lo haya leído, y cambia cada vez que cambia el servidor.
**Severidad:** CRITICAL
**Patrones de detección:**
- `(curl|wget)[^|]*\|[[:space:]]*(ba|z)?sh`
- `Invoke-Expression`
- `iex (New-Object Net.WebClient)`
- `eval\(.*(curl|wget|fetch)`
**Referencia:** guardrail `ai-no-remote-pipe`; OWASP LLM03:2025 Supply Chain, CWE-494

> Junto con AI-002, sustituye a SEC-079 cuando la dimensión `ai` está activa.

---

## Grupo A4: Reglas semánticas (revisión humana / IA)

Las reglas de este grupo producen **siempre** estado `REVIEW`. No bloquean el veredicto de release: señalan lo que una persona debe mirar en el diff antes de aprobarlo.

### AI-014: Contenido ingerido tratado como dato, no como instrucción

**Condición:** `has_agentic_config_files`
**Tipo:** semantic
**Requerimiento:** El contenido que un skill ingiere — una página descargada, un archivo que el usuario nombró, la salida de un comando, la respuesta de otro agente — se trata como dato. Una instrucción hallada dentro de él se reporta como hallazgo y nunca se sigue.
**Severidad:** INFO
**Qué revisar:** cada punto de ingestión del skill; comprobar que el texto de la instrucción diferencia "extraer hechos" de "obedecer".
**Referencia:** guardrail — regla semántica; OWASP LLM01:2025

---

### AI-015: Sin lectura ni transmisión fuera del directorio de trabajo

**Condición:** `has_agentic_config_files`
**Tipo:** semantic
**Requerimiento:** Ningún skill instruye al agente a leer, copiar o transmitir nada fuera del directorio de trabajo que el usuario abrió — historial de shell, claves SSH, volcados de entorno y repositorios hermanos incluidos.
**Severidad:** INFO
**Qué revisar:** rutas y comandos de lectura del skill; verificar que todos son relativos al proyecto abierto.
**Referencia:** guardrail — regla semántica; CWE-200

---

### AI-016: Cada comando es explicable y rechazable

**Condición:** `has_agentic_config_files`
**Tipo:** semantic
**Requerimiento:** Todo comando que un skill pide ejecutar está explicado con detalle suficiente para que un lector pueda rechazarlo; ningún paso es opaco sobre qué toca o qué envía.
**Severidad:** INFO
**Qué revisar:** cada bloque de comando del skill; comprobar que el texto adyacente dice qué archivos toca y a qué destino envía datos.
**Referencia:** guardrail — regla semántica

---

### AI-017: `allowed-tools` mínimo para el flujo declarado

**Condición:** `has_agentic_config_files`
**Tipo:** semantic
**Requerimiento:** El `allowed-tools` que declara un skill es el mínimo que su flujo necesita. Un skill que solo lee y escribe archivos no declara herramienta de shell ni de red.
**Severidad:** INFO
**Qué revisar:** contrastar la lista declarada con los pasos reales del flujo; AI-003 cubre solo el caso del comodín.
**Referencia:** guardrail — regla semántica; OWASP LLM06:2025

---

### AI-018: Bucles de invocación de agentes acotados

**Condición:** `has_agentic_config_files`
**Tipo:** semantic
**Requerimiento:** Un script que dirige un bucle de invocaciones de agente lo acota con un número máximo de iteraciones y una condición de parada que no depende del juicio del propio agente.
**Severidad:** INFO
**Qué revisar:** scripts orquestadores; buscar el contador máximo explícito y la condición de salida independiente.
**Referencia:** guardrail — regla semántica; CWE-400

---

### AI-019: Paso irreversible con confirmación que falla cerrada

**Condición:** `has_agentic_config_files`
**Tipo:** semantic
**Requerimiento:** Un paso irreversible o de cara al exterior está condicionado a una confirmación explícita que falla cerrada: la ausencia de respuesta significa detenerse, nunca continuar.
**Severidad:** INFO
**Qué revisar:** la semántica del default en cada puerta de confirmación; AI-007 solo verifica que la confirmación esté documentada.
**Referencia:** guardrail — regla semántica

---

### AI-020: Skill de terceros leído antes de fijarlo en el lock

**Condición:** `has_skills_lock`
**Tipo:** semantic
**Requerimiento:** Un skill de terceros que entra en `skills-lock.json` proviene del proyecto original y no de un fork, se lee línea por línea antes de fijarlo, y se vuelve a leer cada vez que el lock se refresca.
**Severidad:** INFO
**Qué revisar:** procedencia de cada entrada nueva y constancia de la lectura en el PR.
**Referencia:** guardrail — regla semántica; OWASP LLM03:2025

---

### AI-021: Cambio de `computedHash` tratado como evento de cadena de suministro

**Condición:** `has_skills_lock`
**Tipo:** semantic
**Requerimiento:** Un `computedHash` que cambia se trata como evento de cadena de suministro: los bytes nuevos se revisan antes de commitear el lock, nunca se re-hashean a ciegas.
**Severidad:** INFO
**Qué revisar:** el diff de `skills-lock.json` frente a la evidencia de revisión del contenido nuevo.
**Referencia:** guardrail — regla semántica; OWASP LLM03:2025

---

### AI-022: Contenido copiado de fuente externa revisado línea por línea

**Condición:** `has_agentic_config_files`
**Tipo:** semantic
**Requerimiento:** El contenido copiado de una fuente externa se revisa línea por línea antes de entrar en un skill. Un fragmento no se pega porque "se veía bien": el texto pegado es la vía habitual por la que entran caracteres invisibles y homóglifos.
**Severidad:** INFO
**Qué revisar:** bloques del diff que provengan de documentación o respuestas externas.
**Referencia:** guardrail — regla semántica; complementa AI-005

---

### AI-023: El texto que se lee como ASCII es ASCII

**Condición:** `has_agentic_config_files`
**Tipo:** semantic
**Requerimiento:** Identificadores, comandos e ids de regla no contienen caracteres cirílicos, griegos ni de ancho completo sustituyendo a una letra latina.
**Severidad:** INFO
**Qué revisar:** identificadores y comandos del diff; los homóglifos no se detectan a simple vista y AI-005 no los cubre.
**Referencia:** guardrail — regla semántica; CWE-1007

---

### AI-024: Toda relajación de un control está justificada

**Condición:** `has_agentic_config_files`
**Tipo:** semantic
**Requerimiento:** Un cambio que relaja cualquier control de este checklist declara por qué, quién lo decidió y qué control compensatorio aplica.
**Severidad:** INFO
**Qué revisar:** diffs que eliminen una regla, amplíen una excepción o silencien una verificación.
**Referencia:** guardrail — regla semántica

---

### AI-025: Riesgos OWASP LLM y Agentic AI considerados en el cambio

**Condición:** `has_agentic_config_files`
**Tipo:** semantic
**Requerimiento:** El cambio considera los riesgos OWASP LLM y Agentic AI que aplican a lo que el skill instruye a un agente a leer, ejecutar y confiar.
**Severidad:** INFO
**Qué revisar:** LLM01, LLM03 y LLM06 del OWASP Top 10 for LLM Applications 2025; AG01, AG05 y AG08 de las categorías Agentic AI, publicados en https://genai.owasp.org/
**Referencia:** guardrail — regla semántica; OWASP LLM Top 10:2025, OWASP Agentic AI
