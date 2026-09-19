---
alwaysApply: false
type: policy
slug: hexagonal_architecture_policy
title: "Política de Arquitectura Hexagonal para Backend"
created: 2026-09-19
updated: 2026-09-19
---

# POLÍTICA DE ARQUITECTURA HEXAGONAL PARA BACKEND

**Versión:** 1.1.0
**Estado:** Borrador
**Última actualización:** 2026-09-19
**Propietario:** Dario Palminio (mantenedor del repositorio `agile-sddf-extension`)

---

## 1. [CONTEXT] Propósito y Alcance

**Propósito:**
Garantizar que todo agente de IA que genere, modifique o revise código backend en un proyecto con Arquitectura Hexagonal (Puertos y Adaptadores) mantenga la lógica de negocio aislada de frameworks, bases de datos y protocolos, de forma que el núcleo pueda evolucionar, testearse y auditarse sin acoplarse a detalles técnicos. La regla fundamental es la **regla de dependencia**: `api ──▶ application ──▶ domain ◀── infra`. Todas las dependencias apuntan hacia el dominio; el dominio no conoce a nadie.

**Alcance:**
Aplica a todos los agentes y skills que creen o modifiquen módulos de negocio del backend (NestJS + TypeScript o stack equivalente), incluyendo la creación de módulos, casos de uso, puertos, adaptadores, mappers, eventos, tests y el composition root. Aplica también a la revisión de código de dichos módulos.

**Exclusiones:**
No aplica a código de infraestructura transversal (logging, tracing), scripts de migración, seeds, tooling de build ni prototipos desechables con plazo y fecha de caducidad declarados.

---

## 2. [CONTEXT] Definiciones y Términos Clave

- **Regla de dependencia**: principio por el cual todas las dependencias de código apuntan hacia el dominio. `api` e `infra` dependen de `application`/`domain`; nunca al revés.
- **domain**: capa de reglas de negocio puras e invariantes. Contiene entidades, Value Objects, agregados, servicios de dominio, eventos de dominio, puertos de salida y excepciones de negocio. No contiene frameworks, decoradores, ORM, HTTP ni DTOs de transporte.
- **application**: capa de orquestación de casos de uso. Contiene puertos de entrada, casos de uso, DTOs de aplicación y mappers. No contiene reglas de negocio ni acceso directo a DB o HTTP.
- **api**: adaptador primario (entrada / driving). Contiene controllers, DTOs de transporte, guards, pipes y mappers DTO↔Dominio. No contiene lógica de negocio ni acceso a repositorios.
- **infra**: adaptador secundario (salida / driven). Contiene repositorios, schemas ORM, adaptadores externos, handlers de eventos y configuración. No contiene lógica ni decisiones de negocio.
- **shared**: utilidades transversales sin semántica de negocio (errores base, tipos, filtros, guards globales, utils puros).
- **Puerto**: interfaz que define un contrato entre capas. De **entrada** (driving; `I<Action>UseCase`) o de **salida** (driven; `IUserRepository`, `IPasswordHasher`).
- **Adaptador**: implementación concreta de un puerto de salida (repositorio, servicio técnico) o mecanismo de entrada (controller).
- **Caso de uso**: operación de negocio única orquestada por la capa `application`, con un puerto de entrada y una implementación.
- **Entidad**: objeto de dominio con identidad y ciclo de vida.
- **Value Object (VO)**: objeto de dominio inmutable, sin identidad, definido por sus atributos y validado en construcción.
- **Agregado**: clúster de entidades y VOs con una raíz y una frontera transaccional.
- **Servicio de dominio**: operación de negocio pura (sin I/O ni efectos secundarios) que no pertenece naturalmente a una entidad o VO.
- **Servicio técnico**: capacidad de infraestructura (`PasswordHasher`, `TokenGenerator`, `EmailSender`). Es un puerto de salida, nunca un servicio de dominio.
- **Mapper**: traductor explícito entre modelos de capas adyacentes (DTO ↔ Application DTO/Domain; Domain ↔ PersistenceModel). Traduce, no decide.
- **Composition root**: punto único donde se cablean implementaciones a puertos (`<module>.module.ts` en NestJS).
- **DomainError**: error de negocio con código propio (ej. `USER_EMAIL_ALREADY_EXISTS`) independiente del protocolo, dentro de la jerarquía `BaseError → DomainError | ApplicationError | InfraError`.
- **ADR**: Architecture Decision Record en `docs/adr/XXXX-titulo.md` con contexto, decisión, consecuencias y fecha de revisión.

---

## 3. [GUARDRAIL - BLOQUEANTE] Reglas No Negociables

**Reglas de seguridad (incumplimiento = ABORTAR):**

**Dependencias entre capas**

- **G-01** – ❌ **Sin dependencias del dominio hacia afuera**: ningún archivo en `domain/**` importa de `application/**`, `api/**`, `infra/**`, de paquetes de framework (`@nestjs/*`, `typeorm`, `mongoose`, `express`, `axios`, `class-validator`), de decoradores de DI (`@Injectable`, `@Inject`) ni de utilidades de `shared/errors` que dependan de framework.
- **G-02** – ❌ **Sin dependencias de aplicación hacia adaptadores**: ningún archivo en `application/**` importa de `api/**` ni de `infra/**`.
- **G-03** – ❌ **Sin dependencias entre adaptadores ni hacia ellos**: `infra/**` no importa de `api/**`; `api` e `infra` importan de `application`/`domain` y nunca al revés.
- **G-04** – ✅ **Detalles técnicos solo en adaptadores**: HTTP, ORM y SDKs externos aparecen únicamente en `api/**` o `infra/**`.

**Puertos**

- **G-05** – ✅ **Puertos de entrada en `application/ports/incoming/`**: toda interfaz de caso de uso vive allí. El dominio no declara ni conoce puertos de entrada.
- **G-06** – ✅ **Puertos de salida de negocio en `domain/ports/outgoing/`**: todo puerto que represente un concepto del negocio (repositorios de agregados) vive allí.
- **G-07** – ❌ **Sin puertos genéricos**: cada puerto es específico por rol (`IUserRepository`, nunca `IRepository<T>`) y sus métodos usan el lenguaje del dominio (`findByEmail`, nunca `selectWhereEmailEquals`).
- **G-08** – ❌ **Sin servicios técnicos en el dominio**: `PasswordHasher`, `TokenGenerator`, `EmailSender` y equivalentes se declaran como puertos de salida, nunca como servicios de dominio.

**Estructura de módulos**

- **G-09** – ✅ **Módulo autocontenido**: cada módulo de negocio contiene sus cuatro capas (`api/`, `application/`, `domain/`, `infra/`) y su `<module>.module.ts`.
- **G-10** – ❌ **Sin acoplamiento entre módulos**: un módulo exporta únicamente sus puertos de entrada; nunca importa clases de `domain/` ni `infra/` de otro módulo. La comunicación entre módulos es vía casos de uso o eventos.
- **G-11** – ❌ **Sin conceptos de negocio en `shared/`**: lo específico de un módulo vive en ese módulo.
- **G-12** – ✅ **Nombres de archivo en kebab-case con sufijo de rol**: `.entity.ts`, `.vo.ts`, `.aggregate.ts`, `.use-case.ts`, `.repository.ts`, `.service.ts`, `.adapter.ts`, `.mapper.ts`, `.event.ts`, `.handler.ts`.

**Dominio**

- **G-13** – ✅ **Invariantes en el modelo**: las entidades tienen identidad y ciclo de vida; los VOs son inmutables y se validan en construcción; toda invariante de negocio se valida en el constructor o en métodos de negocio, nunca en servicios externos.
- **G-14** – ✅ **Servicios de dominio puros**: sin efectos secundarios ni acceso a I/O.
- **G-15** – ✅ **Jerarquía de errores obligatoria**: existe `BaseError → DomainError | ApplicationError | InfraError` en `shared/errors/`; toda excepción de dominio extiende `DomainError`, usa lenguaje de negocio y transporta un código de negocio independiente del protocolo.
- **G-16** – ❌ **Sin transacciones en el dominio**: el dominio trabaja con objetos en memoria; la frontera transaccional se establece en `application` (caso de uso) o en `infra` (repositorio/UoW).
- **G-17** – ❌ **Sin store o estado global como dominio**: un estado global no es un modelo de dominio.

**Aplicación**

- **G-18** – ✅ **Un puerto y una implementación por caso de uso**: cada caso de uso tiene un puerto de entrada `I<Action>UseCase` y una implementación `<Action>UseCase`; representa una única operación de negocio y se nombra con verbo en imperativo (`RegisterUser`, `Login`, `CancelOrder`).
- **G-19** – ❌ **Sin reglas de negocio en casos de uso**: los casos de uso orquestan dominio y puertos de salida; las reglas viven en el dominio.
- **G-20** – ❌ **Sin acceso directo a infraestructura desde casos de uso**: ni DB, ni HTTP, ni SDKs, ni `new <Implementación>()`. Todo pasa por puertos de salida.
- **G-21** – ✅ **Caso de uso testeable con fakes**: todo caso de uso se prueba con fakes en memoria de sus puertos de salida, sin infraestructura real ni dobles específicos del ORM.
- **G-22** – ✅ **Atomicidad vía puerto o adaptador**: si un caso de uso coordina operaciones atómicas, la transacción se maneja mediante un puerto de salida (`IUnitOfWork` o similar) o por el adaptador de infraestructura, nunca con mecanismos concretos del ORM.

**API**

- **G-23** – ✅ **Controllers dependen solo de puertos de entrada**: nunca de servicios de dominio, repositorios ni adaptadores.
- **G-24** – ❌ **Sin lógica de negocio en controllers ni DTOs**: los controllers reciben, validan formato (DTOs/pipes) y delegan, sin ramas condicionales de negocio; los DTOs son transporte. La validación de formato vive en `api`; la de reglas de negocio, en el dominio.
- **G-25** – ✅ **DTOs de transporte específicos de la API**: no se reutilizan como DTOs de aplicación ni como entidades.
- **G-26** – ❌ **Sin entidades de dominio en respuestas HTTP**: los mappers de `api/mappers/` traducen DTO ↔ Domain o DTO ↔ Application DTO; nunca se expone una entidad de dominio como DTO.
- **G-27** – ✅ **Filtro global de errores de dominio**: un `DomainExceptionFilter` mapea `DomainError` a códigos HTTP semánticos (409, 404, 422, etc.). Los adaptadores no eligen el status HTTP y ningún `DomainError` se devuelve como 500.

**Infraestructura**

- **G-28** – ✅ **Un adaptador implementa un único puerto de salida**.
- **G-29** – ✅ **Repositorios retornan entidades de dominio**: nunca modelos ORM. El mapper `Domain ↔ PersistenceModel` en `infra/repositories/*.mapper.ts` es obligatorio.
- **G-30** – ❌ **Sin fuga de infraestructura**: modelos ORM (`Document`, `Entity` de TypeORM/Mongoose) y errores de DB no salen de `infra`; se traducen a errores de dominio o de aplicación.
- **G-31** – ✅ **Handlers de eventos en `infra/events/` e idempotentes**: consumen eventos publicados por dominio/aplicación.
- **G-32** – ✅ **Configuración en `infra/config/`**: env vars y credenciales nunca en dominio ni aplicación.

**Mapeo y eventos**

- **G-33** – ✅ **Mappers explícitos en cada frontera**: `api/mappers/` (DTO de transporte ↔ Application DTO o Domain), `application/mappers/` (Application DTO ↔ Domain, si aplica) e `infra/repositories/*.mapper.ts` (Domain ↔ PersistenceModel).
- **G-34** – ✅ **Eventos de dominio en `domain/events/`, nombrados en pasado y publicados tras la escritura**: `UserRegisteredEvent`; la publicación ocurre después de la transacción de escritura para evitar inconsistencias.

**Inyección de dependencias y fábricas**

- **G-35** – ✅ **Composition root único**: `<module>.module.ts` es el único lugar que conoce implementaciones concretas; el wiring vincula puerto → implementación (`{ provide: IUserRepository, useClass: MongoUserRepository }`).
- **G-36** – ✅ **Fábricas en su capa**: las fábricas de entidades viven en `domain/factories/`; las de adaptadores o infraestructura, en `infra/`.

**Testing y verificación**

- **G-37** – ✅ **Estrategia de test por capa**: `domain` unitario puro sin mocks de infra; `application` unitario con fakes de puertos; `infra` integración (Testcontainers o DB in-memory); `api` E2E HTTP (Supertest / Nest Testing). El dominio se testea sin NestJS, sin DB y sin HTTP.
- **G-38** – ✅ **Validación automática de la regla de dependencia en CI**: el proyecto incluye `dependency-cruiser`, `eslint-plugin-boundaries` o equivalente verificando G-01, G-02 y G-03; el PR falla si se viola alguna.
- **G-39** – ✅ **`README.md` por módulo**: con mapa de puertos, casos de uso, adaptadores y ADR del módulo.

**Adopción y decisiones**

- **G-40** – ✅ **Cumplimiento desde el nacimiento y desviaciones como ADR**: todo módulo nuevo nace cumpliendo esta política; cualquier desviación se documenta en `docs/adr/XXXX-titulo.md` con contexto, decisión, consecuencias y fecha de revisión, versionado junto al código.

**Acción ante violación:**
El agente debe **ABORTAR** la tarea y notificar el motivo con el ID de la regla (ej. `G-01`). Si la petición del usuario exige violar una regla, el agente avisa antes de proceder y propone una alternativa compatible; si el usuario reafirma la petición, la desviación debe documentarse como ADR (G-40).

---

## 4. [GUIDE - ALTA PRIORIDAD] Buenas Prácticas

### 4.1. Modelado de dominio

- **BP-01** – ✅ Puede usarse el patrón `Result<T, E>` en lugar de excepciones; si se adopta, se aplica de forma consistente en todo el módulo.
- **BP-02** – ✅ Publica eventos de dominio desde entidades o agregados, recolectados y despachados por la capa `application`.
- **BP-03** – ✅ Usa fábricas (`UserFactory`) cuando la creación de una entidad requiera múltiples pasos, validaciones complejas, generación de identificadores/timestamps o reconstrucción desde persistencia.
- **BP-04** – ✅ Prefiere métodos estáticos en la propia entidad (`User.create(...)`, `User.reconstitute(...)`) sobre una clase fábrica separada cuando sea suficiente.

### 4.2. Puertos y aplicación

- **BP-05** – ✅ Los puertos de salida **técnicos** (email, colas, storage, analytics) pueden vivir en `application/ports/outgoing/` si no representan conceptos del dominio; la decisión se justifica en el ADR del módulo.
- **BP-06** – ✅ Adopta CQRS ligero (`application/commands/`, `application/queries/`) cuando exista asimetría entre lectura y escritura.

### 4.3. Inyección de dependencias

- **BP-07** – ✅ Prefiere inyección por constructor sobre inyección por propiedad.
- **BP-08** – ✅ Usa `useFactory` para dependencias que requieren configuración compleja.

### 4.4. Infraestructura y mapeo

- **BP-09** – ✅ Adopta el patrón Outbox cuando la publicación de eventos deba ser transaccional.
- **BP-10** – ✅ Pueden usarse librerías de mapeo (AutoMapper, morphism), pero los mappers siguen siendo explícitos y testeables.

### 4.5. Testing

- **BP-11** – ✅ Cobertura mínima por capa: dominio ≥ 90 %, aplicación ≥ 80 %, infra ≥ 60 % con foco en caminos críticos.
- **BP-12** – ✅ Añade contract tests (Pact, esquemas) que verifiquen que los adaptadores cumplen sus puertos cuando el backend tenga múltiples consumidores.

### 4.6. Adopción gradual

- **BP-13** – ✅ Migra módulos existentes por refactor incremental; cada PR de migración declara el porcentaje de cumplimiento alcanzado.
- **BP-14** – ✅ Adopta prácticas según madurez: (1) estructura hexagonal mínima + DI + tests de dominio desde el inicio; (2) mappers explícitos + jerarquía de errores + filtros globales al estabilizar 1-2 módulos; (3) eventos de dominio + handlers al desacoplar efectos secundarios; (4) CQRS ligero si hay asimetría lectura/escritura; (5) Outbox si la publicación debe ser transaccional; (6) Bounded Contexts separados al crecer a múltiples dominios; (7) contract tests formales si hay múltiples consumidores.

---

## 5. [GUIDE - ESTRUCTURA] Organización de Archivos

**Estructura mínima obligatoria:**

```
src/<module-name>/
├── api/
├── application/
│   └── ports/incoming/
├── domain/
│   └── ports/outgoing/
├── infra/
└── <module-name>.module.ts
```

**Estructura completa (árbol canónico de referencia):**

```
src/
│
├── shared/                                 # Cross-cutting, sin lógica de negocio
│   ├── filters/                            # HttpExceptionFilter, DomainExceptionFilter
│   ├── guards/                             # JwtAuthGuard, RolesGuard
│   ├── interceptors/                       # Logging, Metrics, Tracing
│   ├── middlewares/                        # CorrelationId, Logger
│   ├── pipes/                              # ValidationPipe, ParseUUIDPipe
│   ├── constants/                          # Códigos de error, cabeceras
│   ├── errors/                             # BaseError, DomainError, InfraError
│   ├── types/                              # Result/Either, Nullable, Branded types
│   └── utils/                              # Helpers puros
│
├── <module-name>/                          # Módulo de negocio (auth, users, orders…)
│   │
│   ├── api/                                # Adaptadores de ENTRADA
│   │   ├── controllers/                    # Dependen de I<Action>UseCase
│   │   ├── dtos/                           # DTOs de transporte (request/response)
│   │   ├── mappers/                        # DTO ↔ Application
│   │   └── guards/
│   │
│   ├── application/                        # Casos de uso (orquestación)
│   │   ├── ports/
│   │   │   └── incoming/                   # Puertos de ENTRADA (interfaces I<Action>UseCase)
│   │   ├── use-cases/                      # Implementaciones <Action>UseCase
│   │   ├── mappers/                        # Application DTO ↔ Domain
│   │   └── dtos/                           # DTOs de aplicación (si difieren de API)
│   │
│   ├── domain/                             # Núcleo puro — SIN frameworks
│   │   ├── model/
│   │   │   ├── entities/                   # *.entity.ts
│   │   │   ├── value-objects/              # *.vo.ts
│   │   │   └── aggregates/                 # *.aggregate.ts
│   │   ├── services/                       # Servicios de DOMINIO puros
│   │   ├── factories/                      # Fábricas de entidades
│   │   ├── ports/
│   │   │   └── outgoing/                   # Puertos de SALIDA (IUserRepository, IPasswordHasher…)
│   │   ├── events/                         # *.event.ts (nombre en pasado)
│   │   └── exceptions/                     # *.domain-error.ts
│   │
│   ├── infra/                              # Adaptadores de SALIDA
│   │   ├── repositories/                   # *.repository.ts, *.schema.ts, *.mapper.ts
│   │   ├── services/                       # Implementaciones de puertos técnicos
│   │   ├── events/                         # *.handler.ts
│   │   └── config/                         # Configuración del módulo
│   │
│   ├── README.md                           # Mapa de puertos, casos de uso, adaptadores, ADR
│   └── <module-name>.module.ts             # Composition root del módulo
│
├── app.module.ts
└── main.ts
```

**Reglas de la estructura:**
- Cada módulo de negocio contiene las cuatro capas y su composition root (véase G-09).
- Los nombres de archivo son kebab-case con sufijo de rol (véase G-12).
- `shared/` no contiene conceptos de negocio (véase G-11).
- Ningún módulo importa `domain/` ni `infra/` de otro módulo (véase G-10).
- Cada módulo incluye un `README.md` (véase G-39).

---

## 6. [GUIDE - REFERENCIAS] Estándares y Documentación Oficial

- **[Hexagonal Architecture (Ports & Adapters) – Alistair Cockburn](https://alistair.cockburn.us/hexagonal-architecture/)** – Definición original del patrón de puertos y adaptadores que fundamenta la regla de dependencia.
- **[RFC 2119](https://www.rfc-editor.org/rfc/rfc2119)** – Niveles de exigencia (DEBE / NO DEBE / DEBERÍA / PUEDE) que fundamentan la separación entre reglas no negociables (Sección 3) y buenas prácticas (Sección 4).
- **Eric Evans, *Domain-Driven Design*** – Origen de los conceptos de entidad, Value Object, agregado y servicio de dominio.
- **Vaughn Vernon, *Implementing Domain-Driven Design*** – Aplicación práctica de DDD táctico, eventos de dominio y Bounded Contexts.
- **Tom Hombergs, *Get Your Hands Dirty on Clean Architecture*** – Estructura de paquetes por capa y mapeo entre fronteras.
- **Robert C. Martin, *Clean Architecture*** – Regla de dependencia e inversión de dependencias.

---

## 7. [INSTRUCTION] Directrices Operativas

1. **Antes de proponer cambios**:
   - Subpaso 1.1: Lee esta política completa e identifica la capa (`api`, `application`, `domain`, `infra`, `shared`) donde va cada archivo antes de crearlo.
   - Subpaso 1.2: Localiza cada archivo en el árbol canónico de la Sección 5. No inventes estructura.
   - Subpaso 1.3: Declara puertos antes de implementaciones y escribe primero el caso de uso, luego el adaptador.
2. **Crear un módulo nuevo**:
   - Subpaso 2.1: Genera el árbol completo de la Sección 5.
   - Subpaso 2.2: Crea `<module>/README.md` con propósito, casos de uso, puertos de salida con sus adaptadores y eventos publicados/consumidos.
   - Subpaso 2.3: Crea un ADR inicial en `docs/adr/`.
3. **Añadir un caso de uso** (orden obligatorio):
   - Subpaso 3.1: Puerto de entrada en `application/ports/incoming/<action>.use-case.ts` (`export interface I<Action>UseCase` + token de DI con el mismo nombre).
   - Subpaso 3.2: Implementación en `application/use-cases/<action>.use-case.ts` que recibe puertos de salida por constructor y solo orquesta.
   - Subpaso 3.3: Registro en `<module>.module.ts`: `{ provide: I<Action>UseCase, useClass: <Action>UseCase }`.
   - Subpaso 3.4: Consumo desde el controller inyectando únicamente `I<Action>UseCase`.
   - Subpaso 3.5: Test `<action>.use-case.spec.ts` con fakes en memoria de los puertos de salida.
4. **Añadir un adaptador de salida**:
   - Subpaso 4.1: Define el puerto en `domain/ports/outgoing/` (o `application/ports/outgoing/` si es técnico, con justificación en ADR) si no existe.
   - Subpaso 4.2: Implementa el adaptador en `infra/` cumpliendo un único puerto.
   - Subpaso 4.3: Crea el mapper `toDomain` / `toPersistence` en `infra/repositories/<entity>.mapper.ts`.
   - Subpaso 4.4: Registra el binding puerto → implementación en el composition root.
   - Subpaso 4.5: Añade test de integración en `infra/`.
5. **Generar o modificar código** (formato de respuesta):
   - Subpaso 5.1: Explica brevemente qué vas a hacer y en qué capa(s).
   - Subpaso 5.2: Muestra el árbol de archivos afectados antes del código.
   - Subpaso 5.3: Cita el ID de regla aplicable (`G-XX` o `BP-XX`).
   - Subpaso 5.4: Incluye tests de dominio y de aplicación en el mismo cambio.
   - Subpaso 5.5: Señala desviaciones si el usuario pide algo que viola la Sección 3.
6. **Revisar código existente**:
   - Subpaso 6.1: Cita el ID de la regla violada.
   - Subpaso 6.2: Muestra código incorrecto vs. código corregido; no des consejos genéricos.
   - Subpaso 6.3: Si detectas una violación fuera del alcance del cambio, repórtala sin corregirla.
7. **Pedir ayuda al usuario** cuando una regla choque con la petición, no exista un módulo de referencia claro o el cambio requiera una decisión arquitectónica nueva (que debe ir a `docs/adr/`).

**Verificación de éxito:**
Antes de dar por terminado un cambio en un módulo, confirmar cada punto del checklist:
- `domain/` no importa frameworks ni capas externas.
- Los nuevos casos de uso tienen puerto de entrada en `application/ports/incoming/`.
- Los nuevos puertos de salida están en `domain/ports/outgoing/` (o en `application/` si son técnicos, con justificación).
- Los controllers dependen solo de puertos de entrada.
- Los repositorios retornan entidades de dominio con mapper aplicado.
- No hay entidades de dominio expuestas en respuestas HTTP.
- Existen tests unitarios de dominio y de casos de uso con fakes.
- El composition root registra los nuevos puertos.
- La validación de reglas de dependencia en CI (`npm run arch:check` o equivalente) pasa.

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
| 1.0.0 | 2026-09-19 | Creación inicial a partir de `.tmp/hexagonal-architecture-for-backend-policy.md` | Dario Palminio |
| 1.1.0 | 2026-09-19 | Eliminadas las referencias a IDs de origen externos; la política es autocontenida | Dario Palminio |

---

*Este documento debe revisarse periódicamente y actualizarse según la evolución del proyecto.*
