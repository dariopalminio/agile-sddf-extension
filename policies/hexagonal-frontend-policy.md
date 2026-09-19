---
alwaysApply: false
type: policy
slug: hexagonal_arch_frontend_invariants_policy
title: "Política de Invariantes de Arquitectura Hexagonal para Frontend"
created: 2026-09-19
updated: 2026-09-19
---

# POLÍTICA DE INVARIANTES DE ARQUITECTURA HEXAGONAL PARA FRONTEND

**Versión:** 1.0.0
**Estado:** Borrador
**Última actualización:** 2026-09-19
**Propietario:** Dario Palminio (mantenedor del repositorio `agile-sddf-extension`)

---

## 1. [CONTEXT] Propósito y Alcance

**Propósito:**
Fijar el **conjunto mínimo de reglas invariantes** que hacen que un frontend sea hexagonal, independientemente del framework de UI, del meta-framework, de la topología del proyecto, del lenguaje y de que existan o no features. La arquitectura hexagonal **es** la dirección de las dependencias y la pureza del núcleo; la estructura de carpetas es solo el vehículo para poder verificarlas. Si un proyecto cumple estas reglas, es hexagonal; si además cumple las extensiones declaradas para su stack y su topología, es hexagonal verificado; si solo declara extensiones sin cumplir estas reglas, tiene una estructura hexagonal aparente.

**Alcance:**
Aplica a todos los agentes y skills que creen, modifiquen o revisen código de negocio en cualquier frontend: SPA (React, Vue, Angular, Svelte, Solid, Lit), meta-framework (Next, Nuxt, SvelteKit, Remix, Astro), mobile (React Native, Flutter), desktop, extensión de navegador o CLI, en TypeScript, JavaScript, Dart, Swift o Kotlin, con topología de frontend puro, BFF, full-stack, monorepo o multi-backend. Toda política específica de stack o topología (por ejemplo, `policies/hexagonal-arch-frontend-policy.md` para React con features) es una **extensión** de esta y hereda sus reglas.

**Exclusiones:**
No aplica al código sin semántica de negocio de `shared/` (errores base, tipos, utils puros, design system), al tooling de build ni a prototipos desechables con plazo y fecha de caducidad declarados. No fija el mecanismo de DI, el routing, la librería de estado global, el cliente HTTP, la plataforma de storage, el número de composition roots ni la existencia de features: todo eso varía por stack o topología y se regula en la política de extensión correspondiente.

---

## 2. [CONTEXT] Definiciones y Términos Clave

- **Invariante**: regla que aplica a todo frontend hexagonal sin excepción de framework, meta-framework, topología, lenguaje ni presencia de features. Su incumplimiento implica que el proyecto no es hexagonal.
- **Extensión**: regla adicional que depende del stack (React, Next, Vue, Angular, React Native) o de la topología (BFF, full-stack, monorepo). Añade restricciones a las invariantes; nunca las reemplaza ni las relaja.
- **Regla de dependencia**: principio por el cual toda dependencia de código apunta hacia el núcleo: `entrada ──▶ orquestación ──▶ núcleo ◀── salida`. El núcleo no conoce a nadie.
- **Núcleo** (`domain/`): capa de reglas de negocio puras. Contiene entidades, Value Objects, servicios de dominio, eventos, excepciones de negocio y puertos de salida. Sin I/O, sin framework, sin azar y sin reloj real.
- **Orquestación** (`application/`): capa de casos de uso. Contiene puertos de entrada, casos de uso, DTOs de aplicación y mappers. Coordina el núcleo y los puertos de salida; no decide reglas de negocio.
- **Adaptador de entrada** (`adapters/in/` o su equivalente en el stack: `ui/`, `api/`): todo lo que "entra" al sistema — componentes, hooks, composables, server actions, route handlers, CLI. Consume puertos de entrada.
- **Adaptador de salida** (`adapters/out/` o su equivalente en el stack: `infra/`): todo lo que "sale" del sistema — repositorios, gateways, clientes HTTP, storage, analytics, stores. Implementa puertos de salida.
- **Puerto de entrada**: contrato de un caso de uso (`I<Action>UseCase`). Vive en la orquestación; los adaptadores de entrada lo consumen y los casos de uso lo implementan.
- **Puerto de salida**: contrato hacia el exterior (red, storage, tiempo, aleatoriedad). Vive dentro del núcleo o de la orquestación, nunca en los adaptadores.
- **Caso de uso**: una operación de negocio con un puerto de entrada y una implementación. Orquesta objetos de dominio y puertos de salida.
- **Decisión de negocio**: invariante, cálculo o rama condicional sobre el estado del dominio. Vive solo en entidades, Value Objects o servicios de dominio.
- **Traducción**: conversión entre el modelo externo y el modelo del núcleo (adaptador de salida) o entre el input externo y el input del caso de uso (adaptador de entrada). Un adaptador traduce, no decide.
- **Punto de composición** (`composition/`): único lugar por contexto de ejecución que conoce implementaciones concretas de los puertos y las cablea. Una SPA tiene uno; un meta-framework con frontera server/client puede tener dos.
- **Contexto de ejecución**: entorno donde corre un grafo de dependencias independiente (cliente del navegador, servidor del meta-framework, worker). Cada uno tiene su propio punto de composición.
- **Fake en memoria**: implementación de un puerto de salida que guarda estado en memoria, reutilizable en tests y sin dependencia de infraestructura real ni de dobles específicos de una librería.
- **Convención mínima**: los cuatro nombres de carpeta fijos (`domain/`, `application/`, adaptadores de entrada/salida, `composition/`) sin los cuales las invariantes no pueden verificarse con la misma herramienta en cualquier repositorio.

---

## 3. [GUARDRAIL - BLOQUEANTE] Reglas No Negociables

**Reglas de seguridad (incumplimiento = ABORTAR):**

**Dirección de dependencias**

- **G-01** – ✅ **Toda dependencia apunta hacia el núcleo**: `entrada ──▶ orquestación ──▶ núcleo ◀── salida`. Ningún archivo del núcleo importa de otra capa.
- **G-02** – ❌ **Sin dependencias del núcleo hacia afuera**: ningún archivo en `domain/**` importa de `application/**`, de adaptadores de entrada o salida, de `composition/**`, ni de librerías de framework de UI, red, almacenamiento o plataforma (ningún import desde `node_modules/` o equivalente), ni accede a `window`, `document`, `fetch`, `localStorage`, reloj real (`Date.now()`) o aleatoriedad real (`Math.random()`) sin que se inyecten como puerto.
- **G-03** – ❌ **Sin dependencias de la orquestación hacia adaptadores**: ningún archivo en `application/**` importa de adaptadores de entrada, de adaptadores de salida ni de `composition/**`. Solo conoce el núcleo y sus propios puertos.
- **G-04** – ✅ **Los adaptadores dependen, no son dependidos**: los adaptadores de entrada y salida importan del núcleo o de la orquestación, nunca al revés; un adaptador de salida no importa de un adaptador de entrada.

**Puertos**

- **G-05** – ✅ **Puertos de salida dentro del núcleo o de la orquestación**: todo contrato hacia el exterior (repositorio, gateway, storage, reloj, generador de IDs) se declara en `domain/ports/out/` o `application/ports/out/`, nunca en un adaptador.
- **G-06** – ✅ **Puertos de entrada en la orquestación**: todo contrato de caso de uso se declara en `application/ports/in/`; los adaptadores de entrada lo consumen y los casos de uso lo implementan. El núcleo no declara ni conoce puertos de entrada.
- **G-07** – ❌ **Sin puertos genéricos**: cada puerto es específico de un rol (`IUserRepository`, `IOrderPublisher`); no existen `IRepository<T>`, `IService` ni equivalentes.
- **G-08** – ✅ **Lenguaje del negocio en los puertos**: los métodos de un puerto se nombran con vocabulario del dominio (`findByEmail`, `publishOrder`), nunca con vocabulario de infraestructura (`getUserFromApi`, `postJson`).

**Separación entre orquestar y decidir**

- **G-09** – ✅ **Un caso de uso = un puerto de entrada + una implementación**: el caso de uso coordina objetos de dominio y puertos de salida; no contiene ramas condicionales sobre reglas de negocio.
- **G-10** – ✅ **Decisiones de negocio solo en el núcleo**: toda invariante, cálculo o rama sobre el estado del dominio vive en una entidad, un Value Object o un servicio de dominio. Nunca en la UI, en un caso de uso, en un adaptador ni en un mapper.
- **G-11** – ❌ **Sin decisiones en adaptadores**: un adaptador de salida convierte entre el modelo externo y el modelo del núcleo; un adaptador de entrada convierte entre el input externo y el input del caso de uso. Ninguno de los dos toma decisiones de negocio.

**Composición y testabilidad**

- **G-12** – ✅ **Un único punto de composición por contexto de ejecución**: solo `composition/**` conoce e instancia implementaciones concretas de los puertos. Ningún otro archivo hace `new <Implementación>()` ni importa una clase concreta de un adaptador.
- **G-13** – ✅ **Núcleo testeable sin nada externo**: los tests de `domain/**` corren sin framework de UI, sin DOM, sin red, sin almacenamiento, sin reloj real y sin aleatoriedad real. Un test de `domain/` que importe de adaptadores o de `composition/` es una violación.
- **G-14** – ✅ **Casos de uso testeables con fakes en memoria**: cada caso de uso se prueba con fakes en memoria de sus puertos de salida, nunca con dobles específicos de la infraestructura (mocks de axios, de un store o de un SDK).

**Convención mínima y verificación**

- **G-15** – ✅ **Cuatro nombres de carpeta fijos**: el núcleo se llama `domain/`, la orquestación `application/` y el wiring `composition/`; los adaptadores viven en `adapters/in/` y `adapters/out/` o en los nombres equivalentes de su stack (`ui/`, `api/`, `infra/`) siempre que el proyecto declare qué carpeta cumple cada rol en su configuración de análisis de dependencias. No se usan `core/`, `model/`, `business/` ni sinónimos para el núcleo o la orquestación.
- **G-16** – ❌ **Sin semántica de negocio en `shared/`**: `shared/` contiene solo errores base, tipos, utils puros y design system. Ninguna entidad, Value Object, agregado, repositorio, caso de uso ni regla de negocio vive allí.
- **G-17** – ✅ **Verificación automática de la regla de dependencia en CI**: el proyecto incluye una herramienta de análisis de imports (`dependency-cruiser`, `eslint-plugin-boundaries` o equivalente) con reglas de severidad `error` que cubren G-02, G-03, G-04 y G-12; el PR falla si se viola alguna.
- **G-18** – ❌ **Sin extensiones que relajen invariantes**: toda política de stack o de topología añade reglas a esta política; ninguna la reemplaza, la contradice ni exime de una regla de esta sección. Una extensión que lo haga es inválida.

**Acción ante violación:**
El agente debe **ABORTAR** la tarea y notificar el motivo con el ID de la regla (ej. `G-02`). Si la petición del usuario exige violar una regla, el agente avisa antes de proceder y propone una alternativa compatible; no existe desviación documentable para esta sección, porque una desviación de una invariante significa que el código deja de ser hexagonal.

---

## 4. [GUIDE - ALTA PRIORIDAD] Buenas Prácticas

### 4.1. Convención de carpetas

- **BP-01** – ✅ Prefiere `adapters/in/` y `adapters/out/` sobre nombres específicos del stack (`ui/`, `infra/`, `api/`): no mencionan frameworks, aplican a SPA, meta-framework, mobile, desktop, extensión y CLI, y permiten verificar cualquier repositorio con la misma configuración.
- **BP-02** – ✅ Dentro de `adapters/in/` y `adapters/out/`, organiza libremente por stack (`react/`, `next/`, `http/`, `storage/`, `analytics/`): la convención fija solo los cuatro roles, no el contenido de los adaptadores.
- **BP-03** – ✅ Al revisar un cambio, no confundas la convención con la arquitectura: renombrar carpetas, añadir `features/` o usar `ui/` en lugar de `adapters/in/` no cambia si el proyecto es hexagonal; solo cambia si se puede verificar. Evalúa la dirección de las dependencias y la pureza del núcleo, no los nombres.

### 4.2. Extensiones por stack

- **BP-04** – ✅ Declara las reglas de extensión de tu stack en una política propia con su propio prefijo de ID y referencia a esta política. Ejemplos de extensiones esperables: React SPA (componentes presentacionales no acceden a casos de uso; hooks dependen solo de puertos de entrada; estado global en `adapters/out/state/`), Next.js (`'use server'` y `'use client'` no aparecen en `domain/` ni `application/`; Server Actions y Route Handlers son adaptadores de entrada; dos puntos de composición, server y cliente), Vue 3 (composables son adaptadores de entrada; `provide/inject` es composición), Angular (un servicio inyectable con lógica de negocio viola G-10; el DI nativo es la composición), React Native (`AsyncStorage` solo en `adapters/out/storage/`; el núcleo compartido con web no importa `react-native`).

### 4.3. Extensiones por topología

- **BP-05** – ✅ Declara las reglas de extensión de tu topología: frontend puro (sin extensiones, bastan las invariantes), BFF (los handlers del BFF no contienen lógica de negocio y traducen entre modelos de servicio y modelos del cliente), full-stack (el dominio es real y no solo de UI; el adaptador de persistencia vive en `adapters/out/`; los secretos no cruzan al cliente), monorepo (`core/` no importa de `web/` ni de `api/`; el versionado de `core/` es explícito).

### 4.4. Revisión semántica

- **BP-06** – ✅ Las reglas G-05 a G-11 no son verificables solo con análisis de imports: revísalas leyendo el diff en cada PR (humano o AI) y cita el ID al señalar una violación.
- **BP-07** – ✅ Verifica G-13 y G-14 inspeccionando la carpeta de tests: cualquier test de `domain/` que importe de adaptadores o de `composition/`, y cualquier test de caso de uso que importe un mock de librería de infraestructura, es una violación.

---

## 5. [GUIDE - ESTRUCTURA] Organización de Archivos

**Estructura mínima obligatoria:**

```
src/
├── domain/
│   └── ports/out/
├── application/
│   └── ports/in/
├── adapters/          # o los nombres equivalentes del stack, declarados
│   ├── in/
│   └── out/
└── composition/
```

**Estructura completa (mínima universal de referencia):**

```
src/
├── domain/                      # Núcleo — no importa nada de fuera (G-02)
│   ├── model/                   # Entidades, Value Objects, agregados
│   ├── services/                # Servicios de dominio puros
│   ├── ports/
│   │   └── out/                 # Puertos de salida (G-05)
│   ├── events/
│   └── exceptions/
│
├── application/                 # Orquestación — solo conoce domain (G-03)
│   ├── ports/
│   │   └── in/                  # Puertos de entrada (G-06)
│   ├── use-cases/               # Un puerto + una implementación (G-09)
│   ├── dtos/
│   └── mappers/
│
├── adapters/                    # Conocen, no son conocidos (G-04)
│   ├── in/                      # Todo lo que entra
│   │   ├── react/               # SPA: componentes, hooks
│   │   ├── next/                # Meta-framework: server components, actions
│   │   ├── http/                # Route handlers
│   │   └── ...                  # Lo que aplique al stack
│   └── out/                     # Todo lo que sale
│       ├── http/
│       ├── storage/
│       ├── analytics/
│       └── ...
│
├── composition/                 # Único punto de wiring (G-12)
│   └── container.ts             # Único archivo que conoce implementaciones
│
└── shared/                      # Sin semántica de negocio (G-16)
    ├── errors/
    ├── types/
    └── utils/
```

**Reglas de la estructura:**
- Los cuatro nombres de rol son fijos; solo el contenido de `adapters/in/` y `adapters/out/` cambia según el stack (véase G-15).
- Cualquier stack y cualquier topología usan esta estructura sin cambio; una topología con frontera server/client añade un segundo `composition/` para el segundo contexto de ejecución (véase G-12).
- `shared/` no contiene conceptos de negocio (véase G-16).
- La estructura con features de `policies/hexagonal-arch-frontend-policy.md` es una extensión válida: cada `<feature>/` reproduce esta estructura dentro de sí.

---

## 6. [GUIDE - REFERENCIAS] Estándares y Documentación Oficial

- **[Hexagonal Architecture (Ports & Adapters) – Alistair Cockburn](https://alistair.cockburn.us/hexagonal-architecture/)** – Definición original del patrón: la aplicación no conoce a sus adaptadores; fundamenta G-01 a G-06.
- **[RFC 2119](https://www.rfc-editor.org/rfc/rfc2119)** – Niveles de exigencia (DEBE / NO DEBE / DEBERÍA / PUEDE) que fundamentan la separación entre reglas no negociables (Sección 3) y buenas prácticas (Sección 4).
- **Robert C. Martin, *Clean Architecture*** – Regla de dependencia e inversión de dependencias; fundamenta la dirección `entrada ──▶ orquestación ──▶ núcleo ◀── salida`.
- **Eric Evans, *Domain-Driven Design*** – Origen de entidad, Value Object y servicio de dominio como únicos portadores de decisiones de negocio (G-10).
- **[Política de Arquitectura Hexagonal para Frontend](hexagonal-arch-frontend-policy.md)** – Extensión de esta política para React con TypeScript, topología por features y reglas de estado, persistencia y UI.

---

## 7. [INSTRUCTION] Directrices Operativas

1. **Antes de proponer cambios**:
   - Subpaso 1.1: Identifica en el proyecto qué carpeta cumple cada uno de los cuatro roles (núcleo, orquestación, adaptadores de entrada/salida, composición) leyendo la configuración de análisis de dependencias. Si no está declarada, detente y pídela al usuario (G-15).
   - Subpaso 1.2: Identifica qué política de extensión aplica al stack y a la topología del proyecto. Si no existe, aplica solo esta política y dilo explícitamente.
2. **Clasificar cada archivo nuevo** antes de crearlo, según una única pregunta:
   - Subpaso 2.1: ¿**Decide** una regla de negocio (invariante, cálculo, rama sobre estado del dominio)? → `domain/` (G-10).
   - Subpaso 2.2: ¿**Orquesta** objetos de dominio y puertos de salida sin decidir? → `application/use-cases/` con su puerto en `application/ports/in/` (G-09).
   - Subpaso 2.3: ¿**Traduce** entre un input externo y un caso de uso, o entre un modelo externo y el núcleo? → adaptador de entrada o de salida (G-11).
   - Subpaso 2.4: ¿**Cablea** implementaciones a puertos? → `composition/` (G-12).
   - Subpaso 2.5: Si un archivo encaja en dos respuestas, divídelo; si no encaja en ninguna y no tiene semántica de negocio, va a `shared/` (G-16).
3. **Añadir un puerto de salida**:
   - Subpaso 3.1: Declara la interfaz en `domain/ports/out/` (o `application/ports/out/`) con un nombre de rol y métodos en lenguaje del negocio (G-05, G-07, G-08).
   - Subpaso 3.2: Implementa el adaptador en `adapters/out/`, que solo traduce (G-11).
   - Subpaso 3.3: Registra el binding en `composition/` (G-12).
   - Subpaso 3.4: Escribe el fake en memoria para los tests de casos de uso (G-14).
4. **Añadir un caso de uso**:
   - Subpaso 4.1: Puerto de entrada en `application/ports/in/` (G-06).
   - Subpaso 4.2: Implementación en `application/use-cases/` que recibe puertos de salida por constructor (G-09).
   - Subpaso 4.3: Registro en `composition/` y consumo desde el adaptador de entrada solo a través del puerto (G-04, G-12).
   - Subpaso 4.4: Test con fakes en memoria (G-14).
5. **Revisar código existente**:
   - Subpaso 5.1: Comprueba la dirección de cada import contra G-01 a G-04; cita el ID en cada violación.
   - Subpaso 5.2: Lee el diff buscando decisiones de negocio fuera del núcleo (G-10) y en adaptadores o mappers (G-11).
   - Subpaso 5.3: Inspecciona los tests de `domain/` y de casos de uso (BP-07).
   - Subpaso 5.4: Muestra código incorrecto vs. corregido; si la violación está fuera del alcance del cambio, repórtala sin corregirla.
6. **Declarar una extensión de stack o topología**:
   - Subpaso 6.1: Crea una política propia con prefijo de ID distinto que referencie esta política.
   - Subpaso 6.2: Comprueba que ninguna regla nueva contradice ni relaja G-01 a G-18 (G-18).
7. **Pedir ayuda al usuario** cuando una regla choque con la petición, la convención de carpetas no esté declarada o el cambio requiera decidir a qué rol pertenece un archivo y la Sección 7.2 no lo resuelva.

**Verificación de éxito:**
Antes de dar por terminado un cambio, confirmar cada punto del checklist:
- Ningún archivo de `domain/` importa de `application/`, adaptadores, `composition/` ni de librerías externas.
- Ningún archivo de `application/` importa de adaptadores ni de `composition/`.
- Ningún archivo fuera de `composition/` instancia o importa una implementación concreta de un puerto.
- Todo puerto de salida nuevo está en `domain/ports/out/` o `application/ports/out/`, es específico de un rol y usa lenguaje del negocio.
- Todo caso de uso nuevo tiene un puerto de entrada en `application/ports/in/`, una implementación y un test con fakes en memoria.
- Ninguna decisión de negocio quedó en adaptadores, mappers, casos de uso ni UI.
- Los tests de `domain/` no importan de adaptadores ni de `composition/`.
- La herramienta de análisis de dependencias en CI pasa.

---

## 8. [CONTEXT] Resumen de Categorías

| Sección | Categoría | Naturaleza | Acción ante incumplimiento |
| :--- | :--- | :--- | :--- |
| **Sección 3 (Reglas No Negociables)** | **Guardrail** | Restrictiva / Arquitectura | **ABORTAR** |
| **Sección 4 (Buenas Prácticas)** | **Guide** | Recomendación / Calidad | **ADVERTIR / SUGERIR** |
| **Sección 5 (Organización de Archivos)** | **Guide** | Recomendación / Estructura | **ADVERTIR / SUGERIR** |
| **Sección 6 (Referencias)** | **Guide** | Documental | **ADVERTIR** |
| **Sección 7 (Directrices Operativas)** | **Instruction** | Operativa | **APLICAR** |
| **Secciones 1, 2 y 8** | **Instruction** | Definicional | **APLICAR** |

---

## Historial de Cambios

| Versión | Fecha | Cambios | Autor |
| :--- | :--- | :--- | :--- |
| 1.0.0 | 2026-09-19 | Creación inicial a partir de `.tmp/reglas-invariantes-de-hexa-front-end.md`, `.tmp/hexagonal-architecture-for-frontend-policy.md` y `policies/hexagonal-arch-frontend-policy.md` | Dario Palminio |

---

*Este documento debe revisarse periódicamente y actualizarse según la evolución del proyecto.*
