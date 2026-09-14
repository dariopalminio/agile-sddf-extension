# doc-domain-generator

`doc-domain-generator` creates and maintains a living, Domain-Driven Design oriented domain knowledge base for a custom business application.

It is intended for people who want a durable business-domain document rather than a one-off architecture summary. The runtime instructions live in [SKILL.md](SKILL.md).

## What it produces

By default, the skill creates the main document at:

```text
docs/domains/DOMAIN.md
```

You can supply a different workspace-relative output directory. The main document is always named `DOMAIN.md`.

The document captures bounded contexts, ubiquitous language, business concepts, relationships, lifecycles, processes, rules, evidence, and open questions. It begins as one coherent document; one repository does not imply one bounded context.

## Installation

Install this skill from the repository with:

```bash
npx skills add dariopalminio/agile-sddf-extension --skill doc-domain-generator
```

## Usage

Use natural language or your runtime's skill invocation syntax:

```text
/doc-domain-generator Build domain knowledge for this application.
/doc-domain-generator Reverse-engineer this repository to document its domain.
/doc-domain-generator Document the domain in docs/knowledge/domains/.
/doc-domain-generator Update docs/domains/DOMAIN.md with the latest order workflow evidence. --update
/doc-domain-generator Build domain knowledge through a guided interview. --interactive
```

## Guided interview

Append `--interactive` when you want the skill to collect domain knowledge through a progressive
conversation before it prepares a draft. It asks one short stage at a time:

1. General context
2. Ubiquitous language
3. Entities
4. Flows
5. Rules
6. Integrations

The skill uses available evidence to skip already answered questions and accepts `skip` or `unknown`
as an open question. After the stages, it shows a reviewed draft summary and asks for explicit final
approval before it writes or changes `DOMAIN.md`. `--interactive --dry-run` can show the plan but
never writes files or directories.

## Example: ecommerce with multiple bounded contexts

An ecommerce application can have several bounded contexts. The initial result is still one main document, `docs/domains/DOMAIN.md`, whose bounded-context section may look like this:

| Bounded context | Responsibility | Example concepts |
|---|---|---|
| Catalog and Products | Manages sellable products and their presentation. | Product, Category, Price |
| Orders and Delivery | Manages purchase fulfillment from checkout through delivery. | Order, Shipment, Delivery |
| Customers and Users | Manages customer identity, profiles, and access. | Customer, Account, Role |

The document can then describe their business collaboration:

```text
Catalog and Products -- product data --> Orders and Delivery
Customers and Users -- customer identity --> Orders and Delivery
```

These names and relationships are illustrative. The skill labels each claim with its evidence status and does not treat source-code modules as confirmed business boundaries without supporting evidence.

## When the knowledge base grows

When the main document becomes difficult to load selectively, usually around 200 lines, the skill proposes a split. It never performs that split automatically. After the user approves, a multi-context ecommerce knowledge base could look like this:

```text
docs/domains/
|-- DOMAIN.md                    # Tier 1: core index and cross-context map
|-- entities/
|   `-- job-card.md               # Tier 2: an approved entity lifecycle, rules, and relationships
|-- catalog-products.md          # Tier 2: catalog vocabulary and rules
|-- orders-delivery.md           # Tier 2: order lifecycle and fulfillment
|-- customers-users.md           # Tier 2: identity and access concepts
`-- flows/
    `-- checkout-to-delivery.md  # Tier 2: cross-context business flow
```

`DOMAIN.md` remains the entry point. During a task about delivery, the skill reads the core document and only the relevant order, delivery, and flow details.

After an explicitly approved split, the skill may create an entity detail file such as
`entities/job-card.md` from its entity template. It uses these optional Tier 2 files for supported
lifecycles, relationships, invariants, and entity-specific rules; it does not create one for every
database table or source-code class.

## Safe updates

| Situation | Behavior |
|---|---|
| No main document exists | Creates the first evidence-backed draft. |
| Existing document with `--update` | Preserves historical wording and stable rule IDs while incorporating supported evidence. |
| Existing document without an update request | Offers regenerate, leave unchanged, or compare. |
| `--interactive` | Runs the six-stage interview and requires explicit final approval before writing. |
| `--dry-run` | Reports the target and evidence plan without writing files. |
| Invalid path or external link | Stops before reading or writing outside the workspace. |

Generated documentation is written in English. The skill records uncertainty as an open question rather than inventing a business fact.

## Contents

| File or directory | Purpose |
|---|---|
| [SKILL.md](SKILL.md) | Runtime instructions for the agent. |
| [assets/domain-document-template.md](assets/domain-document-template.md) | The runtime template for `DOMAIN.md`. |
| [assets/entity-document-template.md](assets/entity-document-template.md) | The runtime template for an approved Tier 2 entity detail file. |
| [references/interactive-interview.md](references/interactive-interview.md) | The staged interview used with `--interactive`. |
| [examples/](examples/) | Synthetic input and output examples. |
| [evals/evals.json](evals/evals.json) | Acceptance cases for the skill. |

## License

MIT. See the repository [LICENSE](../../LICENSE).
