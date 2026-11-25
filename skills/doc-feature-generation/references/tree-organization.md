# Organizing the feature tree

Read at step 6. It defines the three levels, how to name them and how to test a grouping, and it shows
example trees for different kinds of products.

## The three levels

```text
<output-dir>/
└── <domain>/                  # functional area of the product
    └── <capability>/          # recognizable ability that groups related behaviors
        └── <feature>.feature  # one behavior with its rules and examples
```

The depth is fixed: no folder between the output directory and the domain, none between capability and
feature, and no `.feature` file at the domain or capability level. A small product may have a single
domain; the three levels still apply.

## Naming

| Level | Form | Good | Avoid |
|---|---|---|---|
| Domain | Noun for a functional area | `ordering`, `payments`, `data-entry` | `orders-service`, `backend`, `misc` |
| Capability | Verb phrase for an outcome | `manage-orders`, `process-payments`, `read-csv-data` | `orders-controller`, `api-v2`, `general` |
| Feature | Verb phrase for one behavior | `cancel-order`, `check-order-status`, `parse-quoted-fields` | `cancel-endpoint`, `test-1` |

- kebab-case ASCII; transliterate accents and other diacritics (`gestionar-pedidos`).
- Names follow the dialect of the feature files: `--lang es` gives
  `compras/gestionar-pedidos/cancelar-pedido.feature`.
- Use the words the actors use — UI labels, docs, domain vocabulary — not class, table or endpoint
  names. In a UI component library, a feature may carry the name of the component whose behavior it
  describes (`number-input.feature`).
- No numbering, dates, ticket ids or statuses in names: the status lives in a tag.

## Testing a grouping

- **Predictability.** From the capability name alone, could a reader guess most of its features?
- **Breadth.** Would the next plausible feature fit without renaming the capability?
- **Cohesion.** Do its features share the actor's goal, and not just a code module?
- **No catch-alls.** `common`, `other` or `utils` hide features; place each one by its purpose.
- **Not a mirror of the code.** Domains need not match modules, services, teams or epics; one module
  may feed several domains and one domain may span several services.
- A capability with a single feature is fine when it is a recognizable ability. One capability per
  feature everywhere means the grouping is too fine.

## Features that fit several places

Place the feature where its main purpose lies. Reference it from the others with a
`# See also: <domain>/<capability>/<feature>.feature` comment and a row in the inventory's *Shared
rules and cross-references* table. Never copy its scenarios.

## Example trees

A web shop, the guide's own example:

```text
specs/features/
├── shopping/
│   ├── manage-orders/
│   │   ├── confirm-order.feature
│   │   ├── check-order-status.feature
│   │   └── cancel-order.feature
│   └── manage-cart/
│       └── update-cart.feature
└── payments/
    ├── process-payments/
    │   └── pay-order.feature
    └── manage-refunds/
        └── refund-payment.feature
```

An HTTP API with back-office and scheduled work; the actors are client apps, staff and a scheduler:

```text
specs/features/
├── ordering/
│   └── manage-orders/
│       ├── place-order.feature
│       ├── cancel-order.feature
│       └── expire-unpaid-orders.feature
└── fulfillment/
    └── ship-orders/
        └── ship-paid-order.feature
```

A library, whose actor is the consuming developer:

```text
specs/features/
└── csv-data/
    ├── read-csv-data/
    │   ├── parse-csv-text.feature
    │   └── map-records-by-header.feature
    └── write-csv-data/
        └── write-rows-as-csv.feature
```

A command-line tool:

```text
specs/features/
├── project-setup/
│   └── configure-a-project/
│       ├── initialize-project.feature
│       └── validate-configuration.feature
└── data-processing/
    └── process-data/
        └── convert-files.feature
```

A UI component library:

```text
specs/features/
└── data-entry/
    ├── enter-values/
    │   ├── number-input.feature
    │   └── textarea.feature
    └── choose-options/
        └── select.feature
```

## Update mode and large scopes

- With `--update`, keep every existing folder and file name. Place new features in the existing domains
  and capabilities when they fit, and propose renames or moves in the inventory's review checklist
  instead of applying them.
- When the scope holds more candidates than can be traced with care in one run — as a rule of thumb,
  more than about 40 — say so at the checkpoint and propose a narrower `--scope` or one domain per run.
  Under `--auto`, write the domains closest to the product's purpose first and list the rest under
  *Candidates not yet written*. Never pad a file with untraced scenarios.
