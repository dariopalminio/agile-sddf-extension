# POLÍTICA DE REVISIÓN DE CÓDIGO

**Versión:** 1.0.0
**Estado:** Borrador
**Última actualización:** 2026-08-26
**Propietario:** Platform Team

---

## 1. [CONTEXT] Propósito y Alcance

**Propósito:**
Evitar que un agente apruebe cambios que no ha verificado, filtre credenciales en el historial del
repositorio, o cierre una revisión sin evidencia de que la suite de pruebas pasa.

**Alcance:**
Aplica a todo agente de IA que revise, comente o apruebe pull requests en los repositorios backend
NestJS de la organización.

**Exclusiones:**
No aplica a los pull requests generados automáticamente por Dependabot cuando solo modifican
`package-lock.json`.

---

## 2. [CONTEXT] Definiciones y Términos Clave

- **Revisión**: análisis de un pull request que concluye en un veredicto explícito: aprobar, pedir
  cambios o abstenerse.
- **Aprobación**: acción que marca el pull request como apto para fusionarse. Solo la emite un
  agente cuando las tres reglas de la sección 3 se han verificado.
- **Secreto**: cualquier credencial, token, clave privada o cadena de conexión con capacidad de
  autenticar contra un sistema real, esté o no en uso.
- **Suite de pruebas**: el comando de pruebas declarado en `package.json` del repositorio revisado.

---

## 3. [GUARDRAIL - BLOQUEANTE] Reglas No Negociables

**Reglas de seguridad (incumplimiento = ABORTAR):**

- **G-01** – ❌ **Sin auto-aprobación**: el agente no debe aprobar un pull request cuyo autor sea él
  mismo o la sesión que generó el cambio. Debe derivar la revisión a un revisor distinto.
- **G-02** – ❌ **Sin secretos en el diff**: el agente no debe aprobar un pull request cuyo diff
  introduzca un secreto según la definición de la sección 2, ni siquiera si está comentado o marcado
  como de ejemplo.
- **G-03** – ✅ **Validación obligatoria**: el agente debe ejecutar la suite de pruebas del
  repositorio y confirmar que termina con código de salida `0` antes de emitir una aprobación.

**Acción ante violación:**
El agente debe **ABORTAR** la tarea y notificar el motivo con el ID de la regla (ej. `G-01`).

---

## 4. [GUIDE - ALTA PRIORIDAD] Buenas Prácticas

### 4.1. Alcance de la revisión

- **BP-01** – ✅ Revisa el diff completo antes de comentar cualquier línea; un comentario emitido
  sobre un fragmento aislado suele contradecir el resto del cambio.
- **BP-02** – ✅ Clasifica cada hallazgo como bloqueante, sugerencia o nota, y dilo en el comentario.
  Un hallazgo sin categoría obliga al autor a adivinar si debe actuar.

### 4.2. Comunicación con el autor

- **BP-03** – ✅ Cita el archivo y la línea (`src/orders/order.service.ts:84`) en todo hallazgo; una
  referencia genérica al módulo obliga al autor a reconstruir el contexto.
- **BP-04** – ✅ Propón el cambio concreto cuando lo tengas. Un comentario que solo señala el
  problema devuelve el trabajo de diseño al autor sin aportar nada.

---

## 5. [GUIDE - RENDIMIENTO] Optimización y Eficiencia

- **R-01** – ✅ **Mantén el diff revisado por debajo de 400 líneas**: por encima de ese umbral la
  tasa de detección cae. Si el pull request lo excede, pide al autor que lo divida antes de revisar.
- **R-02** – ✅ **Aplica divulgación progresiva**: carga el archivo completo solo cuando el diff no
  baste para juzgar el cambio; en el resto de casos trabaja sobre el diff.
- **R-03** – ✅ **Limita la salida de las pruebas**: captura solo el resumen y los fallos, no el log
  completo de la ejecución.

---

## 6. [GUIDE - REFERENCIAS] Estándares y Documentación Oficial

- **[NestJS Testing](https://docs.nestjs.com/fundamentals/testing)** – define el contrato de la
  suite de pruebas que exige `G-03`.
- **[OWASP Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)**
  – base de la definición de secreto usada en `G-02`.

---

## 7. [INSTRUCTION] Directrices Operativas

1. **Paso 1**: obtén el diff completo del pull request y el nombre de su autor.
2. **Paso 2**: verifica los guardrails en orden.
   - Subpaso 2.1: compara el autor con la identidad de la sesión (`G-01`).
   - Subpaso 2.2: analiza el diff en busca de secretos (`G-02`).
   - Subpaso 2.3: ejecuta la suite de pruebas y registra el código de salida (`G-03`).
3. **Paso 3**: emite el veredicto con los hallazgos clasificados según `BP-02`.

**Verificación de éxito:**
El pull request tiene un veredicto explícito publicado, y cada hallazgo bloqueante cita archivo y
línea. Si algún guardrail falló, existe un comentario que nombra el ID de la regla y no hay
aprobación registrada.

---

## 8. [CONTEXT] Resumen de Categorías

| Sección | Categoría | Naturaleza | Acción ante incumplimiento |
| :--- | :--- | :--- | :--- |
| **Sección 3 (Guardrails)** | **Guardrail** | Restrictiva / Seguridad | **ABORTAR** |
| **Secciones 4 a 6** | **Guide** | Recomendación / Calidad | **ADVERTIR / SUGERIR** |
| **Sección 7 (Instrucciones)** | **Instruction** | Operativa | **APLICAR** |
| **Secciones 1, 2 y 8** | **Instruction** | Definicional | **APLICAR** |

---

## Historial de Cambios

| Versión | Fecha | Cambios | Autor |
| :--- | :--- | :--- | :--- |
| 1.0.0 | 2026-08-26 | Creación inicial | Platform Team |

---

*Este documento debe revisarse periódicamente y actualizarse según la evolución del proyecto.*
