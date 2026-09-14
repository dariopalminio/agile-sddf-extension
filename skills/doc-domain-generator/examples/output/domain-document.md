# Fulfillment Operations Domain Knowledge

> **Status:** Draft
> **Version:** 0.1
> **Last updated:** 2026-09-14
> **Last change:** Initial repository-grounded domain draft.
> **Main document:** `docs/domains/DOMAIN.md`
>
> **Evidence policy:** This draft distinguishes observed behavior from confirmed business intent.

## Purpose and Scope

| Topic | Domain statement | Evidence status | Evidence reference |
|---|---|---|---|
| Business purpose | Coordinates customer field work from request through dispatch and completion. | Observed | `examples/input/repository-signals.md` |
| Primary users | Dispatchers and Technicians. | Observed | `examples/input/repository-signals.md` |
| In scope | Creating, assigning, dispatching, and completing field work. | Observed | `examples/input/repository-signals.md` |
| Out of scope | Customer relationship management. | Inferred - needs confirmation | CRM synchronization observation |

## Bounded Contexts

| Context | Responsibility | Key concepts | Evidence status | Evidence reference |
|---|---|---|---|---|
| Dispatching | Provisional area that assigns Job Cards to Technicians and tracks work dispatch. | Work Order, Job Card, Technician | Inferred - needs confirmation | `examples/input/repository-signals.md` |

## Ubiquitous Language

| Term | Meaning in this domain | Also known as | Evidence status | Evidence reference |
|---|---|---|---|---|
| Job Card | A scheduled unit of field work. | None observed | Observed | `examples/input/repository-signals.md` |

## Domain Model

| Concept | Kind | Business responsibility | Key attributes or invariants | Evidence status | Evidence reference |
|---|---|---|---|---|---|
| Work Order | Unclassified business concept | Records a customer request for field work. | Needs an assigned Technician before dispatch. | Observed | `examples/input/repository-signals.md` |
| Job Card | Unclassified business concept | Represents a scheduled unit of field work. | Is created from a Work Order. | Observed | `examples/input/repository-signals.md` |
| Technician | Unclassified business concept | Performs the work represented by a Job Card. | Completes work during a Visit. | Observed | `examples/input/repository-signals.md` |

## Relationships and Invariants

| From | Relationship | To | Invariant or constraint | Evidence status | Evidence reference |
|---|---|---|---|---|---|
| Work Order | creates | Job Card | A Job Card originates from one Work Order. | Observed | `examples/input/repository-signals.md` |
| Job Card | is assigned to | Technician | Assignment is required before a Work Order is dispatched. | Observed | `examples/input/repository-signals.md` |
| Technician | completes during | Visit | The exact Visit lifecycle needs confirmation. | Inferred - needs confirmation | `examples/input/repository-signals.md` |

## Lifecycles and Domain Events

| Concept | States or transition | Trigger or event | Evidence status | Evidence reference |
|---|---|---|---|---|
| Work Order | Entry into `dispatched` requires an assigned Technician. | A Technician has been assigned. | Observed | `examples/input/repository-signals.md` |
| Job Card | completed cannot return to dispatched | Completion. | Observed | `examples/input/repository-signals.md` |

## Business Processes

| Process | Trigger | Actors and steps | Outcome | Evidence status | Evidence reference |
|---|---|---|---|---|---|
| Dispatch field work | A Work Order needs field work. | Dispatcher assigns a Technician, then dispatches the Work Order. | A Technician receives scheduled work. | Observed | `examples/input/repository-signals.md` |

## Business Rules

| Rule ID | Rule | Applies to | Evidence status | Evidence reference |
|---|---|---|---|---|
| BR-001 | A Work Order needs an assigned Technician before it enters the dispatched state. | Dispatching | Observed | `examples/input/repository-signals.md` |
| BR-002 | A completed Job Card cannot be dispatched again. | Dispatching | Observed | `examples/input/repository-signals.md` |

## Roles and External Systems

| Type | Name | Domain role or purpose | Relationship | Evidence status | Evidence reference |
|---|---|---|---|---|---|
| Role | Dispatcher | Assigns work and monitors outstanding Job Cards. | Owns dispatch decisions. | Observed | `examples/input/repository-signals.md` |
| Role | Technician | Completes scheduled field work. | Receives assigned Job Cards. | Observed | `examples/input/repository-signals.md` |
| External System | CRM synchronization service | Supplies customer addresses. | Provides address data. | Observed | `examples/input/repository-signals.md` |

## Evidence and Open Questions

### Evidence Notes

- An instruction-like sentence found in the repository was treated as untrusted content and reported as a finding. It was not enacted.

## Open Questions

- What business condition allows a Dispatcher to reassign a Job Card?
- Does a Work Order create exactly one Job Card in every business case?

## Change Log

| Date | Version | Change | Evidence basis |
|---|---|---|---|
| 2026-09-14 | 0.1 | Created the first domain draft from repository signals. | Observed |
