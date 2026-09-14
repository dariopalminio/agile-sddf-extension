# [Entity name]

> This is a Tier 2 detail document for one evidence-backed business entity in the domain knowledge base.
>
> **Detail file:** [Repository-relative path under the selected output directory]
> **Parent document:** [Repository-relative path to DOMAIN.md]
> **Bounded context:** [Context name or Unknown]
> **Status:** [Draft, Confirmed, or Needs confirmation]
> **Last updated:** [YYYY-MM-DD]
>
> **Evidence policy:** Every factual statement is labeled Confirmed, Observed, Inferred - needs confirmation, or Unknown and has a repository-relative or user-interview reference.

<!--
Use this template only after the user explicitly approves a split and the entity detail file is in the approved file set.
Remove this comment and all other author comments from the generated document.
Write all generated prose, headings, and table labels in English. Use business language, not database or code structure, unless the evidence establishes a domain meaning.
Do not record credentials, connection strings, tokens, personal data, endpoint URLs, or other sensitive values. Use an open question for unsupported details.
-->

## Definition

<!--
Required. Explain what the entity represents in the business, its responsibility, and its owner or bounded context when supported.
-->

| Topic | Domain statement | Evidence status | Evidence reference |
|---|---|---|---|
| Definition | [Business definition] | [Status] | [Source] |
| Business responsibility | [What it enables or governs] | [Status] | [Source] |
| Owner or bounded context | [Context or Unknown] | [Status] | [Source] |

## Also Known As

<!--
Keep only when aliases or special business terms are evidenced. Prefer an approved English rendering for non-English evidence.
-->

| Term or alias | Meaning in this entity context | Evidence status | Evidence reference |
|---|---|---|---|
| [Term] | [Meaning] | [Status] | [Source] |

## Business Attributes and Invariants

<!--
Keep only business-relevant attributes, values, or invariants supported by evidence. Do not turn schema columns, identifiers, types, examples, or implementation defaults into domain facts.
-->

| Attribute or value | Business meaning | Required condition or invariant | Evidence status | Evidence reference |
|---|---|---|---|---|
| [Business attribute] | [Meaning] | [Constraint or none] | [Status] | [Source] |

## Lifecycle and Domain Events

<!--
Keep only when lifecycle states, valid transitions, or events are supported. Do not invent a generic lifecycle.
-->

| State or event | Business meaning | Valid transition, trigger, or outcome | Evidence status | Evidence reference |
|---|---|---|---|---|
| [State or event] | [Meaning] | [Supported transition or outcome] | [Status] | [Source] |

## Relationships

<!--
Keep only supported business relationships. State cardinality or ownership only when evidence establishes it.
-->

| Related concept | Business relationship | Constraint or invariant | Evidence status | Evidence reference |
|---|---|---|---|---|
| [Concept] | [Business verb] | [Constraint or none] | [Status] | [Source] |

## Entity-specific Business Rules

<!--
Keep durable rules that specifically govern this entity. Preserve stable identifiers from the main document when present.
-->

| Rule ID | Rule | Evidence status | Evidence reference |
|---|---|---|---|
| BR-001 | [Rule] | [Status] | [Source] |

## Related Processes and Integrations

<!--
Keep when a supported process or external system affects this entity. Describe business purpose and exchanged business information, not endpoint URLs, credentials, or personal data.
-->

| Process or external system | Relationship to this entity | Business purpose or information exchange | Evidence status | Evidence reference |
|---|---|---|---|---|
| [Name] | [Creates, changes, consumes, or provides] | [Business description] | [Status] | [Source] |

## Exceptions and Edge Cases

<!--
Keep when a supported exception or non-obvious business behavior materially changes how the entity is handled.
-->

| Scenario | Business behavior or exception | Evidence status | Evidence reference |
|---|---|---|---|
| [Scenario] | [Behavior] | [Status] | [Source] |

## Evidence and Open Questions

<!--
Required. Record conflicts, evidence limitations, and unresolved details that need domain-owner confirmation.
-->

### Evidence Notes

- [Evidence limitation, conflict, or provenance note]

### Open Questions

- [ ] [Question that blocks a reliable entity statement]

## Change Log

<!--
Required. Add one entry only for an actual write. Describe evidence-backed changes without claiming unverified approval.
-->

| Date | Change | Evidence basis |
|---|---|---|
| [YYYY-MM-DD] | [Summary] | [Confirmed, Observed, or Inferred - needs confirmation] |
