# Organizing Living-spec Gherkin Specifications

Executable specifications live in `specs/features/`. Organize their files by the behavior a person looks for in the library.

## Organization

### Feature organizational structure (Living spec)

```text
specs/features/
└── <domain-name>/
    └── <capability-name>/
        └── <feature-name>.feature
```

- **Domain.** Functional area of the product, such as data entry.
- **Capability.** Outcome that groups related behaviors, such as entering values.
- **Feature.** Gherkin file that describes a behavior and gathers its scenarios, including its variants and errors.

#### Repository example

Example of a UI component library:

```text
specs/features/
└── data-entry/
    ├── enter-values/
    │   ├── number-input.feature
    │   └── textarea.feature
    └── choose-options/
        └── select.feature
```

Example of an e-commerce library:

```text
specs/features/
├── shopping/                          # domain
│   ├── manage-orders/                 # capability
│   │   ├── confirm-order.feature
│   │   ├── check-order-status.feature
│   │   └── cancel-order.feature
│   └── manage-cart/                   # capability
│       └── update-cart.feature
└── payments/                          # domain
    ├── process-payments/              # capability
    │   └── pay-order.feature
    └── manage-refunds/                # capability
        └── refund-payment.feature
```