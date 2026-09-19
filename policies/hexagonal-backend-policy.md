---
alwaysApply: false
type: policy
slug: hexagonal_backend_invariants_policy
title: "Política de Invariantes de Arquitectura Hexagonal para Backend"
created: 2026-09-19
updated: 2026-09-19
---

# POLÍTICA DE INVARIANTES DE ARQUITECTURA HEXAGONAL PARA BACKEND

**Versión:** 1.0.0
**Estado:** Borrador
**Última actualización:** 2026-09-19
**Propietario:** Dario Palminio (mantenedor del repositorio `agile-sddf-extension`)

---

## 1. [CONTEXT] Propósito y Alcance

**Propósito:**
Fijar el **conjunto mínimo de reglas invariantes** que hacen que un backend sea hexagonal, independientemente del framework, del ORM, del transporte de entrada, del lenguaje y de la topología de despliegue. La arquitectura hexagonal **es** la dirección de las dependencias y la pureza del núcleo; la estructura de carpetas es solo el vehículo para poder verificarlas. Es simétrica con el frontend: la regla de dependencia, los puertos, los adaptadores, el punto de composición y la testabilidad son idénticos; el backend añade cuatro invariantes propias — modelo de persistencia separado, frontera transaccional fuera del dominio, reloj y azar inyectables, y eventos publicados después del commit. Si un backend cumple estas reglas, es hexagonal; si además cumple las extensiones declaradas para su stack y su topología, es hexagonal verificado; si solo declara extensiones sin cumplir estas reglas, tiene una estructura hexagonal aparente.

**Alcance:**
Aplica a todos los agentes y skills que creen, modifiquen o revisen código de negocio en cualquier backend: NestJS, Express, Fastify, FastAPI, Spring Boot, Rails, Go, .NET o Rust, con topología de monolito, monolito modular, microservicios, serverless, event-driven o monorepo multi-servicio. Toda política específica de stack o topología (por ejemplo, `policies/nestjs-hexagonal-backend-policy.md` para NestJS + TypeScript con módulos) es una **extensión** de esta y hereda sus reglas.

**Exclusiones:**
No aplica al código sin semántica de negocio de `shared/` (errores base, tipos, utils puros), a migraciones, seeds, tooling de build ni a prototipos desechables con plazo y fecha de caducidad declarados. No fija el mecanismo de DI, el ORM, el transporte de entrada, la gestión de configuración y secretos, el logging/tracing, el event bus, el número de composition roots ni la existencia de módulos: todo eso varía por stack o topología y se regula en la política de extensión correspondiente.

---

## 2. [CONTEXT] Definiciones y Términos Clave

- **Invariante**: regla que aplica a todo backend hexagonal sin excepción de framework, ORM, transporte, lenguaje ni topología. Su incumplimiento implica que el proyecto no es hexagonal.
- **Extensión**: regla adicional que depende del stack (NestJS, Express, FastAPI, Spring, Go, Rails) o de la topología (monolito modular, microservicios, serverless, event-driven, monorepo). Añade restricciones a las invariantes; nunca las reemplaza ni las relaja.
- **Regla de dependencia**: principio por el cual toda dependencia de código apunta hacia el núcleo: `entrada ──▶ orquestación ──▶ núcleo ◀── salida`. El núcleo no conoce a nadie.
- **Núcleo** (`domain/`): capa de reglas de negocio puras. Contiene entidades, Value Objects, agregados, servicios de dominio, eventos, excepciones de negocio y puertos de salida. Sin I/O, sin framework, sin ORM, sin reloj real, sin azar real y sin transacciones.
- **Orquestación** (`application/`): capa de casos de uso. Contiene puertos de entrada, casos de uso, DTOs de aplicación y mappers. Coordina el núcleo y los puertos de salida y establece la frontera transaccional; no decide reglas de negocio.
- **Adaptador de entrada** (`adapters/in/` o su equivalente en el stack: `api/`): todo lo que "entra" al sistema — controllers, routes, handlers gRPC, CLI, consumers de colas, cron, handlers serverless. Consume puertos de entrada.
- **Adaptador de salida** (`adapters/out/` o su equivalente en el stack: `infra/`): todo lo que "sale" del sistema — repositorios, modelos ORM, publishers, clientes HTTP, cache, reloj, generador de IDs. Implementa puertos de salida.
- **Puerto de entrada**: contrato de un caso de uso (`I<Action>UseCase`). Vive en la orquestación; los adaptadores de entrada lo consumen y los casos de uso lo implementan.
- **Puerto de salida**: contrato hacia el exterior (persistencia, red, mensajería, reloj, aleatoriedad). Vive dentro del núcleo o de la orquestación, nunca en los adaptadores.
- **Caso de uso**: una operación de negocio con un puerto de entrada y una implementación. Orquesta objetos de dominio y puertos de salida.
- **Decisión de negocio**: invariante, cálculo o rama condicional sobre el estado del dominio. Vive solo en entidades, Value Objects o servicios de dominio.
- **Traducción**: conversión entre el modelo externo (ORM, DTO de API, mensaje) y el modelo del núcleo (adaptador de salida) o entre el input externo (HTTP, mensaje) y el input del caso de uso (adaptador de entrada). Un adaptador traduce, no decide.
- **Modelo de persistencia**: representación de los datos en el almacén (entidad ORM, documento, fila). Es distinto del modelo de dominio y se traduce con un mapper `Domain ↔ PersistenceModel`.
- **Frontera transaccional**: alcance de atomicidad de una operación. Se establece en el caso de uso mediante un puerto (`IUnitOfWork`) o en el adaptador de salida; nunca en el núcleo.
- **Outbox**: patrón por el cual los eventos se persisten en la misma transacción que el cambio de estado y se publican después del commit, garantizando que no se emita un evento de un cambio no confirmado.
- **Punto de composición** (`composition/`): único lugar por contexto de ejecución que conoce implementaciones concretas de los puertos y las cablea. Un monolito tiene uno; un monolito modular, uno por módulo; microservicios, uno por servicio; serverless, uno por handler o global por cold start.
- **Contexto de ejecución**: entorno donde corre un grafo de dependencias independiente (proceso, módulo, servicio, handler serverless). Cada uno tiene su propio punto de composición.
- **Fake en memoria**: implementación de un puerto de salida que guarda estado en memoria, reutilizable en tests y sin dependencia de infraestructura real ni de dobles específicos del ORM.
- **Convención mínima**: los cuatro nombres de carpeta fijos (`domain/`, `application/`, adaptadores de entrada/salida, `composition/`) sin los cuales las invariantes no pueden verificarse con la misma herramienta en cualquier repositorio.

---

## 3. [GUARDRAIL - BLOQUEANTE] Reglas No Negociables

**Reglas de seguridad (incumplimiento = ABORTAR):**

**Dirección de dependencias**

- **G-01** – ✅ **Toda dependencia apunta hacia el núcleo**: `entrada ──▶ orquestación ──▶ núcleo ◀── salida`. Ningún archivo del núcleo importa de otra capa.
- **G-02** – ❌ **Sin dependencias del núcleo hacia afuera**: ningún archivo en `domain/**` importa de `application/**`, de adaptadores de entrada o salida, de `composition/**`, ni de librerías de framework web, ORM, red o mensajería (ningún import desde `node_modules/` o el equivalente del lenguaje).
- **G-03** – ❌ **Sin dependencias de la orquestación hacia adaptadores**: ningún archivo en `application/**` importa de adaptadores de entrada, de adaptadores de salida ni de `composition/**`. Solo conoce el núcleo y sus propios puertos.
- **G-04** – ✅ **Los adaptadores dependen, no son dependidos**: los adaptadores de entrada y salida importan del núcleo o de la orquestación, nunca al revés; un adaptador de entrada no importa de un adaptador de salida ni viceversa — se comunican solo a través de puertos.

**Puertos**

- **G-05** – ✅ **Puertos de salida dentro del núcleo o de la orquestación**: todo contrato hacia el exterior (repositorio, publisher, cliente, cache, reloj, generador de IDs) se declara en `domain/ports/out/` o `application/ports/out/`, nunca en un adaptador.
- **G-06** – ✅ **Puertos de entrada en la orquestación**: todo contrato de caso de uso se declara en `application/ports/in/`; los adaptadores de entrada lo consumen y los casos de uso lo implementan. El núcleo no declara ni conoce puertos de entrada.
- **G-07** – ❌ **Sin puertos genéricos**: cada puerto es específico de un rol (`IUserRepository`, `IOrderPublisher`); no existen `IRepository<T>`, `IService` ni equivalentes.
- **G-08** – ✅ **Lenguaje del negocio en los puertos**: los métodos de un puerto se nombran con vocabulario del dominio (`findByEmail`, `publishOrder`), nunca con vocabulario de infraestructura (`selectWhere`, `insertRow`).

**Separación entre orquestar y decidir**

- **G-09** – ✅ **Un caso de uso = un puerto de entrada + una implementación**: el caso de uso coordina objetos de dominio y puertos de salida; no contiene ramas condicionales sobre reglas de negocio.
- **G-10** – ✅ **Decisiones de negocio solo en el núcleo**: toda invariante, cálculo o rama sobre el estado del dominio vive en una entidad, un Value Object o un servicio de dominio. Nunca en un caso de uso, en un adaptador ni en un mapper.
- **G-11** – ❌ **Sin decisiones en adaptadores**: un adaptador de salida convierte entre el modelo externo (ORM, DTO de API) y el modelo del núcleo; un adaptador de entrada convierte entre el input externo (HTTP, mensaje) y el input del caso de uso. Ninguno de los dos toma decisiones de negocio.
- **G-12** – ❌ **Sin persistencia directa de entidades de dominio**: el modelo de persistencia es distinto del modelo de dominio; todo repositorio traduce con un mapper `Domain ↔ PersistenceModel` y ningún modelo ORM, documento ni fila sale del adaptador de salida.

**Transacciones y efectos**

- **G-13** – ❌ **Sin transacciones en el núcleo**: el dominio trabaja con objetos en memoria y no conoce transacciones; la atomicidad se maneja en el caso de uso mediante un puerto (`IUnitOfWork`) o en el adaptador de salida, nunca con primitivas del ORM dentro de `domain/**` ni de `application/**`.
- **G-14** – ✅ **Reloj y azar inyectables**: el núcleo no llama a `Date.now()`, `new Date()`, `Math.random()`, `uuid()` ni equivalentes del lenguaje; el tiempo y la aleatoriedad entran por un puerto de salida (`IClock`, `IIdGenerator`).
- **G-15** – ✅ **Eventos de dominio publicados después del commit**: un evento se emite solo cuando la transacción que lo originó está confirmada, mediante outbox o mecanismo equivalente; nunca se publica dentro de la transacción como si el cambio ya estuviera confirmado.

**Composición y testabilidad**

- **G-16** – ✅ **Un único punto de composición por contexto de ejecución**: solo `composition/**` conoce e instancia implementaciones concretas de los puertos. Ningún otro archivo hace `new <Implementación>()` ni importa una clase concreta de un adaptador.
- **G-17** – ✅ **Núcleo testeable sin nada externo**: los tests de `domain/**` corren sin framework, sin base de datos, sin red, sin sistema de archivos, sin reloj real y sin aleatoriedad real. Un test de `domain/` que importe de adaptadores o de `composition/` es una violación.
- **G-18** – ✅ **Casos de uso testeables con fakes en memoria**: cada caso de uso se prueba con fakes en memoria de sus puertos de salida, nunca con dobles específicos del ORM, de la base de datos ni del bus.

**Convención mínima y verificación**

- **G-19** – ✅ **Cuatro nombres de carpeta fijos**: el núcleo se llama `domain/`, la orquestación `application/` y el wiring `composition/`; los adaptadores viven en `adapters/in/` y `adapters/out/` o en los nombres equivalentes de su stack (`api/`, `infra/`) siempre que el proyecto declare qué carpeta cumple cada rol en su configuración de análisis de dependencias. No se usan `core/`, `model/`, `business/` ni sinónimos para el núcleo o la orquestación.
- **G-20** – ❌ **Sin semántica de negocio en `shared/`**: `shared/` contiene solo errores base, tipos y utils puros. Ninguna entidad, Value Object, agregado, repositorio, caso de uso ni regla de negocio vive allí.
- **G-21** – ✅ **Verificación automática de la regla de dependencia en CI**: el proyecto incluye una herramienta de análisis de imports del lenguaje — `dependency-cruiser` (TS/JS), ArchUnit (Java/Kotlin), import-linter (Python), go-arch-lint o depguard (Go), cargo-deny (Rust), NetArchTest (C#), packwerk (Ruby), deptrac (PHP) — con reglas bloqueantes que cubren G-02, G-03, G-04 y G-16; el PR falla si se viola alguna.
- **G-22** – ❌ **Sin extensiones que relajen invariantes**: toda política de stack o de topología añade reglas a esta política; ninguna la reemplaza, la contradice ni exime de una regla de esta sección. Una extensión que lo haga es inválida.

**Acción ante violación:**
El agente debe **ABORTAR** la tarea y notificar el motivo con el ID de la regla (ej. `G-02`). Si la petición del usuario exige violar una regla, el agente avisa antes de proceder y propone una alternativa compatible; no existe desviación documentable para esta sección, porque una desviación de una invariante significa que el código deja de ser hexagonal.

---

## 4. [GUIDE - ALTA PRIORIDAD] Buenas Prácticas

### 4.1. Convención de carpetas

- **BP-01** – ✅ Prefiere `adapters/in/` y `adapters/out/` sobre nombres específicos del stack (`api/`, `infra/`): no mencionan frameworks, aplican a monolito, modular, microservicios, serverless y event-driven, y permiten verificar cualquier repositorio con la misma configuración.
- **BP-02** – ✅ Dentro de `adapters/in/` organiza por canal (`http/`, `grpc/`, `cli/`, `consumers/`, `cron/`) y dentro de `adapters/out/` por capacidad (`persistence/`, `messaging/`, `http/`, `cache/`, `clock/`, `id-generator/`): la convención fija solo los cuatro roles, no el contenido de los adaptadores.
- **BP-03** – ✅ Al revisar un cambio, no confundas la convención con la arquitectura: renombrar carpetas, añadir módulos o usar la nomenclatura NestJS (`api/`, `application/`, `domain/`, `infra/`) no cambia si el proyecto es hexagonal; solo cambia si se puede verificar. Evalúa la dirección de las dependencias y la pureza del núcleo, no los nombres.

### 4.2. Extensiones por stack

- **BP-04** – ✅ Declara las reglas de extensión de tu stack en una política propia con su propio prefijo de ID y referencia a esta política. Ejemplos de extensiones esperables: NestJS (`@Injectable` y `@Inject` no aparecen en `domain/`; solo `<module>.module.ts` conoce implementaciones; los controllers dependen solo de puertos de entrada), Express/Fastify (las routes no contienen lógica de negocio; el composition root es un único `container.ts`), FastAPI (`Depends` no cruza al dominio; los routers son adaptadores de entrada), Spring Boot (`@Service` no contamina el dominio; los `@Repository` implementan puertos de salida), Go (`internal/domain` no importa `net/http` ni `database/sql`), Rails (los modelos ActiveRecord viven en `adapters/out/persistence/`, no en `domain/`).

### 4.3. Extensiones por topología

- **BP-05** – ✅ Declara las reglas de extensión de tu topología: monolito simple (sin extensiones, bastan las invariantes), monolito modular (cada módulo tiene su propio `composition/`; un módulo no importa `domain/` ni `adapters/out/` de otro; la comunicación es vía puertos de entrada o eventos), microservicios (cada servicio es un contexto hexagonal independiente; la comunicación entre servicios pasa por adaptadores; nunca se comparte dominio — se duplica o se contrata), serverless (cada handler es un adaptador de entrada; el composition root es por handler o global por cold start; el dominio es stateless), event-driven (los consumers son adaptadores de entrada; los publishers viven en `adapters/out/messaging/`; los handlers son idempotentes y respetan el orden), monorepo multi-servicio (`packages/core/` no importa de `packages/service-*/`; cada servicio tiene su composition root y sus adaptadores).

### 4.4. Revisión semántica

- **BP-06** – ✅ Las reglas G-05 a G-15 no son verificables solo con análisis de imports: revísalas leyendo el diff en cada PR (humano o AI) y cita el ID al señalar una violación.
- **BP-07** – ✅ Verifica G-17 y G-18 inspeccionando la carpeta de tests: cualquier test de `domain/` que importe de adaptadores o de `composition/`, y cualquier test de caso de uso que importe un doble del ORM o de la base de datos, es una violación.

### 4.5. Equipos full-stack

- **BP-08** – ✅ Un equipo que trabaja frontend y backend unifica esta política con `policies/hexagonal-frontend-policy.md` en un solo conjunto de reglas para el monorepo: las invariantes de dirección de dependencias, puertos, capas, composición y testabilidad son idénticas, y el backend añade solo G-12 (persistencia separada), G-13 (transacciones), G-14 (reloj y azar) y G-15 (eventos post-commit).

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
│   ├── model/
│   │   ├── entities/
│   │   ├── value-objects/
│   │   └── aggregates/
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
│   │   ├── http/                # Controllers / routes
│   │   ├── grpc/
│   │   ├── cli/
│   │   ├── consumers/           # Colas, streams
│   │   └── cron/
│   └── out/                     # Todo lo que sale
│       ├── persistence/         # Repositorios + modelos ORM + mappers (G-12)
│       ├── messaging/           # Publisher, outbox (G-15)
│       ├── http/                # Clientes HTTP externos
│       ├── cache/
│       ├── clock/               # Reloj inyectable (G-14)
│       └── id-generator/        # Azar inyectable (G-14)
│
├── composition/                 # Único punto de wiring (G-16)
│   └── container.ts             # Único archivo que conoce implementaciones
│
└── shared/                      # Sin semántica de negocio (G-20)
    ├── errors/
    ├── types/
    └── utils/
```

**Reglas de la estructura:**
- Los cuatro nombres de rol son fijos; solo el contenido de `adapters/in/` y `adapters/out/` cambia según el stack (véase G-19).
- Cualquier stack y cualquier topología usan esta estructura sin cambio; un monolito modular la reproduce dentro de cada módulo y un microservicio la reproduce por servicio, cada uno con su `composition/` (véase G-16).
- `shared/` no contiene conceptos de negocio (véase G-20).
- La estructura por módulos de `policies/nestjs-hexagonal-backend-policy.md` es una extensión válida: cada `src/<module>/` reproduce esta estructura con la nomenclatura `api/` e `infra/` y el composition root en `<module>.module.ts`.

---

## 6. [GUIDE - REFERENCIAS] Estándares y Documentación Oficial

- **[Hexagonal Architecture (Ports & Adapters) – Alistair Cockburn](https://alistair.cockburn.us/hexagonal-architecture/)** – Definición original del patrón: la aplicación no conoce a sus adaptadores; fundamenta G-01 a G-06.
- **[RFC 2119](https://www.rfc-editor.org/rfc/rfc2119)** – Niveles de exigencia (DEBE / NO DEBE / DEBERÍA / PUEDE) que fundamentan la separación entre reglas no negociables (Sección 3) y buenas prácticas (Sección 4).
- **Robert C. Martin, *Clean Architecture*** – Regla de dependencia e inversión de dependencias; fundamenta la dirección `entrada ──▶ orquestación ──▶ núcleo ◀── salida`.
- **Eric Evans, *Domain-Driven Design*** – Origen de entidad, Value Object, agregado y servicio de dominio como únicos portadores de decisiones de negocio (G-10).
- **Vaughn Vernon, *Implementing Domain-Driven Design*** – Eventos de dominio y su publicación tras la confirmación de la transacción (G-15).
- **[Política de Arquitectura Hexagonal para Backend (NestJS + TypeScript)](nestjs-hexagonal-backend-policy.md)** – Extensión de esta política para NestJS con módulos, filtros de excepciones, Outbox y CQRS.
- **[Política de Invariantes de Arquitectura Hexagonal para Frontend](hexagonal-frontend-policy.md)** – Contraparte simétrica de esta política; comparte las invariantes de dependencias, puertos, capas, composición y testabilidad.

---

## 7. [INSTRUCTION] Directrices Operativas

1. **Antes de proponer cambios**:
   - Subpaso 1.1: Identifica en el proyecto qué carpeta cumple cada uno de los cuatro roles (núcleo, orquestación, adaptadores de entrada/salida, composición) leyendo la configuración de análisis de dependencias. Si no está declarada, detente y pídela al usuario (G-19).
   - Subpaso 1.2: Identifica qué política de extensión aplica al stack y a la topología del proyecto. Si no existe, aplica solo esta política y dilo explícitamente.
2. **Clasificar cada archivo nuevo** antes de crearlo, según una única pregunta:
   - Subpaso 2.1: ¿**Decide** una regla de negocio (invariante, cálculo, rama sobre estado del dominio)? → `domain/` (G-10).
   - Subpaso 2.2: ¿**Orquesta** objetos de dominio y puertos de salida, o establece una frontera transaccional, sin decidir? → `application/use-cases/` con su puerto en `application/ports/in/` (G-09, G-13).
   - Subpaso 2.3: ¿**Traduce** entre un input externo y un caso de uso, o entre un modelo externo (ORM, API, mensaje) y el núcleo? → adaptador de entrada o de salida (G-11, G-12).
   - Subpaso 2.4: ¿**Cablea** implementaciones a puertos? → `composition/` (G-16).
   - Subpaso 2.5: Si un archivo encaja en dos respuestas, divídelo; si no encaja en ninguna y no tiene semántica de negocio, va a `shared/` (G-20).
3. **Añadir un puerto de salida**:
   - Subpaso 3.1: Declara la interfaz en `domain/ports/out/` (o `application/ports/out/`) con un nombre de rol y métodos en lenguaje del negocio (G-05, G-07, G-08).
   - Subpaso 3.2: Implementa el adaptador en `adapters/out/`, que solo traduce; si es un repositorio, crea el mapper `Domain ↔ PersistenceModel` junto a él (G-11, G-12).
   - Subpaso 3.3: Registra el binding en `composition/` (G-16).
   - Subpaso 3.4: Escribe el fake en memoria para los tests de casos de uso (G-18).
4. **Añadir un caso de uso**:
   - Subpaso 4.1: Puerto de entrada en `application/ports/in/` (G-06).
   - Subpaso 4.2: Implementación en `application/use-cases/` que recibe puertos de salida por constructor, incluidos `IClock` e `IIdGenerator` si necesita tiempo o identificadores (G-09, G-14).
   - Subpaso 4.3: Si coordina varias escrituras, delimita la atomicidad con `IUnitOfWork` o delega en el adaptador; si publica eventos, hazlo tras el commit vía outbox (G-13, G-15).
   - Subpaso 4.4: Registro en `composition/` y consumo desde el adaptador de entrada solo a través del puerto (G-04, G-16).
   - Subpaso 4.5: Test con fakes en memoria (G-18).
5. **Revisar código existente**:
   - Subpaso 5.1: Comprueba la dirección de cada import contra G-01 a G-04; cita el ID en cada violación.
   - Subpaso 5.2: Lee el diff buscando decisiones de negocio fuera del núcleo (G-10), en adaptadores o mappers (G-11), entidades persistidas sin mapper (G-12), primitivas transaccionales en el núcleo (G-13), reloj o azar directos (G-14) y eventos emitidos antes del commit (G-15).
   - Subpaso 5.3: Inspecciona los tests de `domain/` y de casos de uso (BP-07).
   - Subpaso 5.4: Muestra código incorrecto vs. corregido; si la violación está fuera del alcance del cambio, repórtala sin corregirla.
6. **Declarar una extensión de stack o topología**:
   - Subpaso 6.1: Crea una política propia con prefijo de ID distinto que referencie esta política.
   - Subpaso 6.2: Comprueba que ninguna regla nueva contradice ni relaja G-01 a G-22 (G-22).
7. **Pedir ayuda al usuario** cuando una regla choque con la petición, la convención de carpetas no esté declarada o el cambio requiera decidir a qué rol pertenece un archivo y el paso 2 no lo resuelva.

**Verificación de éxito:**
Antes de dar por terminado un cambio, confirmar cada punto del checklist:
- Ningún archivo de `domain/` importa de `application/`, adaptadores, `composition/` ni de librerías externas.
- Ningún archivo de `application/` importa de adaptadores ni de `composition/`.
- Ningún archivo fuera de `composition/` instancia o importa una implementación concreta de un puerto.
- Todo puerto de salida nuevo está en `domain/ports/out/` o `application/ports/out/`, es específico de un rol y usa lenguaje del negocio.
- Todo caso de uso nuevo tiene un puerto de entrada en `application/ports/in/`, una implementación y un test con fakes en memoria.
- Ninguna decisión de negocio quedó en adaptadores, mappers ni casos de uso.
- Todo repositorio traduce con un mapper y ningún modelo ORM sale del adaptador.
- Ninguna transacción, reloj real ni aleatoriedad real aparece en `domain/`; los eventos se publican tras el commit.
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
| 1.0.0 | 2026-09-19 | Creación inicial a partir de `.tmp/reglas-invariantes-de-hexa-backend.md`, `guardrails/nestjs-hexagonal-backend-checklist.md` y `policies/nestjs-hexagonal-backend-policy.md` | Dario Palminio |

---

*Este documento debe revisarse periódicamente y actualizarse según la evolución del proyecto.*
