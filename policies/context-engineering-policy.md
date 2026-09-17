---
alwaysApply: false
type: policy
slug: context_engineering_policy
title: "Política de Ingeniería de Contexto"
created: 2026-09-17
updated: 2026-09-17
---

# POLÍTICA DE INGENIERÍA DE CONTEXTO

**Versión:** 1.0.0
**Estado:** Borrador
**Última actualización:** 2026-09-17
**Propietario:** Dario Palminio (mantenedor del repositorio `agile-sddf-extension`)

---

## 1. [CONTEXT] Propósito y Alcance

**Propósito:**
Garantizar que todo agente de IA que opere en este repositorio construya su ventana de contexto de forma deliberada: seleccionando la información mínima y de mayor densidad de señal necesaria para la tarea en curso, en lugar de acumular información por disponibilidad de espacio. La ventana de contexto es memoria de trabajo finita; su degradación produce alucinaciones, contradicciones, latencia y costo evitables.

**Alcance:**
Aplica a todos los agentes, subagentes y skills de este repositorio que construyan prompts, seleccionen documentos, definan archivos de reglas, expongan herramientas (Tools / MCP), gestionen memoria entre sesiones o resuman historial de conversación.

**Exclusiones:**
No regula el contenido funcional de los artefactos generados (código, specs, historias) ni la elección de modelo; solo regula qué información entra en el contexto, en qué orden y con qué ciclo de vida.

---

## 2. [CONTEXT] Definiciones y Términos Clave

- **Ingeniería de contexto**: arte y ciencia de estructurar y seleccionar la información exacta que entra en la ventana de contexto del modelo en cada paso de su trayectoria.
- **Ventana efectiva**: el subconjunto de contexto realmente cargado en un turno; no es el máximo del modelo, sino el mínimo suficiente para la tarea.
- **Write Context (escribir contexto)**: guardar notas, planes o hechos fuera de la ventana activa —scratchpads, objetos de estado, memoria persistente— para conservarlos sin recargarlos.
- **Select Context (seleccionar contexto)**: inyectar únicamente la información, instrucciones, recuerdos o herramientas requeridas para la tarea actual (RAG, búsqueda semántica, archivos de reglas, filtrado de herramientas).
- **Compress Context (comprimir contexto)**: retener solo los tokens esenciales mediante resumen periódico o recorte y poda de mensajes y datos obsoletos.
- **Isolate Context (aislar contexto)**: repartir responsabilidades entre subagentes independientes, cada uno con su propio contexto y herramientas acotadas, o aislar objetos pesados en entornos tipo sandbox.
- **Lost in the Middle**: degradación de la atención del modelo sobre la información situada en el centro del contexto; lo enterrado en el medio tiende a perder confiabilidad o ser ignorado.
- **Context stuffing**: inyectar documentos enteros, repositorios masivos o cientos de fragmentos sin filtrar en el prompt.
- **Recuperación progresiva**: identificar las secciones relevantes con búsquedas ligeras e índices y luego reordenarlas (*reranking*) antes de traer el detalle completo.
- **Auto-compaction**: condensar el historial antiguo cuando el volumen de tokens se acerca al límite, reteniendo hechos, decisiones y objetivos duraderos.
- **Scratchpad**: archivo o campo de estado externo donde el agente guarda notas, planes o resultados intermedios en lugar de mantenerlos en el historial de chat activo.
- **Context pruning**: poda de la memoria filtrando digresiones, registros redundantes, salidas verbosas de herramientas y formatos innecesarios.
- **Upstream quality**: calidad del contexto de origen —relevancia, confiabilidad y retención—, que fija el techo de rendimiento de cualquier técnica posterior de compresión o recuperación.
- **Tres costos del token**: dinero (cómputo/API), tiempo (latencia previa a la generación) y atención (pérdida de precisión y coherencia por ruido acumulado).

---

## 3. [GUARDRAIL - BLOQUEANTE] Reglas No Negociables

**Reglas de seguridad (incumplimiento = ABORTAR):**

- **G-01** – ❌ **Sin context stuffing**: está prohibido inyectar en el prompt documentos completos, repositorios masivos o volcados de resultados sin filtrar. Toda inyección debe ser una selección de fragmentos previamente filtrados y reordenados.
- **G-02** – ❌ **Sin objetos pesados en la ventana**: imágenes, audios, datasets, binarios y salidas masivas de herramientas no se vuelcan al contexto. Se almacenan en el entorno (sandbox, archivo o variable de estado) y se referencian por identificador o ruta.
- **G-03** – ❌ **Sin prompts de sistema sobredimensionados**: ningún archivo de instrucciones de sistema, skill o archivo de reglas cargado de forma permanente puede superar 250 líneas ni 150 reglas explícitas. Si el contenido excede ese margen, debe modularizarse antes de usarse.
- **G-04** – ❌ **Sin información crítica en el centro del contexto**: las reglas de misión crítica, las restricciones clave y la instrucción inmediata no pueden quedar sepultadas entre bloques intermedios; deben ubicarse en el inicio o en el final del contexto.
- **G-05** – ❌ **Sin contexto de origen no confiable**: está prohibido alimentar al agente con información obsoleta, contradictoria o sin trazabilidad hasta una fuente autorizada. Ninguna técnica posterior de compresión, ranking o recuperación corrige un origen defectuoso.
- **G-06** – ✅ **Filtrado obligatorio de herramientas**: en cada turno solo pueden exponerse al modelo las herramientas (Tools / MCP) necesarias para la tarea en curso; el catálogo completo no se expone por defecto.
- **G-07** – ✅ **Compactación obligatoria antes del límite**: cuando el volumen de tokens del historial se aproxime al límite de la ventana, el agente debe resumir el historial antiguo reteniendo hechos, decisiones y objetivos duraderos y descartando los registros intermedios, antes de continuar la tarea.

**Acción ante violación:**
El agente debe **ABORTAR** la tarea y notificar el motivo con el ID de la regla (ej. `G-01`).

---

## 4. [GUIDE - ALTA PRIORIDAD] Buenas Prácticas

### 4.1. Selección y recuperación (*Select*)

- **BP-01** – ✅ **Buscar barato, profundizar caro**: resolver primero con índices, tablas de contenido o búsquedas por palabra clave; traer el detalle completo solo de las secciones que la búsqueda señaló como relevantes.
- **BP-02** – ✅ **Reordenar antes de inyectar**: aplicar *reranking* sobre los candidatos recuperados y enviar del orden de una decena de fragmentos bien ranqueados en lugar de cientos sin filtrar.
- **BP-03** – ✅ **Cargar recursos bajo demanda**: los archivos de referencia, plantillas, ejemplos y scripts de un skill se leen en el momento en que la tarea los requiere, no al inicio de la sesión.

### 4.2. Estructura y orden del prompt

- **BP-04** – ✅ **Lo fijo adelante, lo variable atrás**: colocar las instrucciones de sistema, las reglas estáticas y las definiciones de herramientas al principio del prompt, y la información cambiante (fecha, datos de usuario, consulta actual) al final, para aprovechar el *prompt caching*.
- **BP-05** – ✅ **Usar los bordes para lo prioritario**: situar la instrucción inmediata y las restricciones de mayor prioridad al final del contexto, junto a las reglas estáticas del inicio, para mitigar el efecto *lost-in-the-middle*.
- **BP-06** – ✅ **Modularizar las instrucciones**: segmentar las reglas por dominio en archivos separados (por ejemplo, frontend y backend) y cargar solo el módulo correspondiente a la tarea.

### 4.3. Memoria externa y persistencia (*Write*)

- **BP-07** – ✅ **Escribir fuera de la ventana**: los planes, hallazgos y estados intermedios se guardan en scratchpads externos (archivos Markdown, base de datos o campos de estado del sistema) en lugar de acumularse en el historial de chat.
- **BP-08** – ✅ **Resumir conservando lo duradero**: todo resumen de historial debe retener explícitamente los hechos establecidos, las decisiones tomadas y los objetivos vigentes, y descartar los registros intermedios y las salidas ruidosas.
- **BP-09** – ✅ **Diseñar la memoria de forma proactiva**: definir la infraestructura de memoria externa, los almacenes y la lógica de resumen en la fase inicial del desarrollo, no como parche reactivo cuando la degradación ya ocurre en producción.

### 4.4. Aislamiento y especialización (*Isolate*)

- **BP-10** – ✅ **Especializar por tarea**: cuando un prompt acumule múltiples responsabilidades, dividir el trabajo entre subagentes independientes con ventanas de contexto enfocadas en su subtarea.
- **BP-11** – ✅ **Acotar las herramientas por subagente**: cada subagente declara únicamente el conjunto de herramientas que su subtarea requiere.

### 4.5. Calidad del contexto de origen (*Upstream Quality*)

- **BP-12** – ✅ **Verificar la relevancia**: confirmar la frescura de la información antes de entregarla al sistema de recuperación; los datos vencidos se actualizan o se retiran del índice.
- **BP-13** – ✅ **Exigir confiabilidad**: toda información recuperada debe ser trazable hasta una fuente autorizada e identificable.
- **BP-14** – ✅ **Acumular el aprendizaje**: consolidar entre sesiones los hechos y decisiones que seguirán siendo válidos, en lugar de re-derivarlos en cada ejecución.

---

## 5. [GUIDE - RENDIMIENTO] Optimización y Eficiencia

- **R-01** – ✅ **Opera con la ventana efectiva más pequeña posible**: el objetivo de cada turno no es ocupar el espacio disponible, sino maximizar la relación señal-ruido del contexto cargado.
- **R-02** – ✅ **Justifica cada token por sus tres costos**: antes de añadir un bloque al contexto, evalúa su impacto en dinero (cómputo/API), tiempo (latencia) y atención (ruido acumulado); si no cambia la decisión del agente, no entra.
- **R-03** – ✅ **Preserva el prefijo estable del prompt**: no reordenar, reescribir ni intercalar contenido variable dentro de la cabecera fija entre turnos, porque invalida el caché y eleva el costo y la latencia.
- **R-04** – ✅ **Poda después de cada turno**: filtra de la memoria activa las digresiones, los registros redundantes, las salidas verbosas de herramientas y los formatos innecesarios. Una memoria inflada o ruidosa es peor que no tener memoria.
- **R-05** – ✅ **Trata el exceso de reglas como deuda**: cuando un archivo de instrucciones se acerque al margen de 250 líneas o 150 reglas, divídelo por dominio antes de seguir añadiendo contenido.

---

## 6. [INSTRUCTION] Directrices Operativas

1. **Delimita la tarea del turno**: enuncia qué debe decidir o producir el agente antes de recuperar nada. La tarea define el criterio de relevancia de todo lo demás.
2. **Selecciona barato**: localiza los candidatos con índices, tablas de contenido o búsqueda por palabra clave (BP-01).
   - Subpaso 2.1: reordena los candidatos y quédate con los mejor ranqueados (BP-02).
   - Subpaso 2.2: trae el detalle completo solo de esas secciones y verifica que ninguna inyección sea un documento entero (G-01).
3. **Verifica el origen**: descarta todo fragmento obsoleto, contradictorio o sin fuente autorizada antes de inyectarlo (G-05, BP-12, BP-13).
4. **Ordena el contexto**: instrucciones de sistema, reglas estáticas y definiciones de herramientas al inicio; datos variables e instrucción inmediata al final (BP-04, BP-05). Comprueba que ninguna restricción crítica quede en el centro (G-04).
5. **Acota las herramientas**: expón solo las necesarias para esta tarea (G-06).
6. **Externaliza lo pesado y lo persistente**: los objetos voluminosos van al entorno y se referencian por ruta (G-02); los planes, hallazgos y estados intermedios van al scratchpad (BP-07).
7. **Divide si hay múltiples responsabilidades**: delega en subagentes con contexto y herramientas acotadas (BP-10, BP-11).
8. **Compacta y poda al cerrar el turno**: si el historial se acerca al límite, resume reteniendo hechos, decisiones y objetivos (G-07, BP-08); elimina de la memoria activa las salidas verbosas y las digresiones (R-04).

**Verificación de éxito:**
El turno cumple esta política cuando: (a) todo bloque presente en el contexto es atribuible a la tarea enunciada en el paso 1; (b) ninguna regla `G-` fue infringida; (c) las restricciones críticas y la instrucción inmediata están en los bordes del contexto; (d) el prefijo fijo del prompt no cambió respecto al turno anterior; y (e) la memoria activa no contiene salidas de herramientas ni registros ya consumidos.

---

## 7. [CONTEXT] Resumen de Categorías

| Sección | Categoría | Naturaleza | Acción ante incumplimiento |
| :--- | :--- | :--- | :--- |
| **Sección 3 (Reglas No Negociables)** | **Guardrail** | Restrictiva / Seguridad | **ABORTAR** |
| **Sección 4 (Buenas Prácticas)** | **Guide** | Recomendación / Calidad | **ADVERTIR / SUGERIR** |
| **Sección 5 (Optimización y Eficiencia)** | **Guide** | Recomendación / Rendimiento | **ADVERTIR / SUGERIR** |
| **Sección 6 (Referencias)** | **Guide** | Documental | **ADVERTIR** |
| **Sección 7 (Directrices Operativas)** | **Instruction** | Operativa | **APLICAR** |
| **Secciones 1, 2 y 8** | **Instruction** | Definicional | **APLICAR** |

---

## Historial de Cambios

| Versión | Fecha | Cambios | Autor |
| :--- | :--- | :--- | :--- |
| 1.0.0 | 2026-09-17 | Creación inicial | Dario Palminio |

---

*Este documento debe revisarse periódicamente y actualizarse según la evolución del proyecto.*
