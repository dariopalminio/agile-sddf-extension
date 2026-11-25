# Feature inventory: Order Desk

> Reverse-engineered from the repository on 2026-11-24 with `doc-feature-generation`. This is a
> traceable proposal, not a verified specification: its accuracy depends on the evidence below and
> on review by people who know the product.
>
> **Feature tree:** `specs/features/` · **Scope analyzed:** `.` (whole workspace) · **Dialect:** `en`

## Scope and actors

| Topic | Statement | Evidence |
|---|---|---|
| Purpose | Ordering backend of a small online shop: customers place and follow orders, the warehouse ships paid orders and back-office staff export orders. | `README.md` |
| Scope analyzed | The whole workspace: one HTTP API (`src/`) with its hourly job and payment handler, plus a back-office CLI (`bin/admin.js`). | `package.json`, `src/server.js` |
| Actors | Customer, through the storefront gateway; support agent (role `support`); warehouse operator (role `warehouse`); back-office operator (CLI); payment provider (message bus); scheduler. | `src/middleware/authenticate.js`, `src/orders/order-service.js`, `src/orders/orders.routes.js`, `bin/admin.js`, `src/payments/payment-events.js`, `src/jobs/expire-unpaid-orders.js` |
| Excluded from the inventory | The test fixture `test/fixtures/orders.json` and the generated storefront client `src/generated/api-client.js`. | scanner `excluded` |

## Feature tree

```text
specs/features/
├── ordering/
│   └── manage-orders/
│       ├── place-order.feature
│       ├── confirm-order.feature
│       ├── cancel-order.feature
│       ├── check-order-status.feature
│       └── expire-unpaid-orders.feature
├── payments/
│   ├── process-payments/
│   │   └── record-payment.feature
│   └── manage-refunds/
│       └── refund-paid-order.feature
└── fulfillment/
    └── ship-orders/
        ├── ship-paid-order.feature
        └── export-orders-for-warehouse.feature
```

## Features and evidence

| Feature | Location | Actor and result | Evidence | Test coverage | Status and limit |
|---|---|---|---|---|---|
| Place an order | `ordering/manage-orders/place-order.feature` | Customer — the order is recorded as pending | `src/orders/order-service.js` placeOrder(); POST /orders | 2 unit tests, in-memory repository: placing an order and rejecting an empty one; no test covers the 20-item limit | Implemented, unverified — analyzed, not run |
| Confirm an order | `ordering/manage-orders/confirm-order.feature` | Customer — a pending order is confirmed | `src/orders/order-service.js` confirmOrder(); POST /orders/:id/confirm | no test covers it | Implemented, unverified |
| Cancel an order | `ordering/manage-orders/cancel-order.feature` | Customer — an order is cancelled before it ships | `src/orders/order-service.js` cancelOrder(); POST /orders/:id/cancel | 2 unit tests, in-memory repository: pending and shipped orders; no test covers the confirmed, paid or cancelled cases | Implemented, unverified — analyzed, not run; the README states another rule (open question) |
| Check the status of an order | `ordering/manage-orders/check-order-status.feature` | Customer or support agent — sees the order status | `src/orders/order-service.js` getOrderStatus(), findOwnedOrder(); GET /orders/:id | 1 unit test covers the ownership rule through a cancellation; no test reads a status | Implemented, unverified — analyzed, not run |
| Expire unpaid orders | `ordering/manage-orders/expire-unpaid-orders.feature` | Scheduler — confirmed orders unpaid after 24 hours are cancelled | `src/jobs/expire-unpaid-orders.js` cron `0 * * * *` | no test covers it | Implemented, unverified |
| Record a payment | `payments/process-payments/record-payment.feature` | Payment provider — an order paid in full becomes paid | `src/payments/payment-events.js` subscribe("payment.received") | no test covers it | Partial — no code connects the handler to the message bus |
| Refund a paid order | `payments/manage-refunds/refund-paid-order.feature` | Support agent — a paid order is refunded | `docs/backlog.md` PAY-07 | no test covers it | Proposed — no implementation |
| Ship a paid order | `fulfillment/ship-orders/ship-paid-order.feature` | Warehouse operator — a paid order is shipped | `src/orders/order-service.js` shipOrder(); POST /orders/:id/ship with requireRole('warehouse'); `docs/backlog.md` ORD-21 | no test covers it | Implemented, unverified — the shipping email is a proposed scenario |
| Export orders for the warehouse | `fulfillment/ship-orders/export-orders-for-warehouse.feature` | Back-office operator — a CSV of orders in one status | `bin/admin.js` export-orders; `package.json` bin | no test covers it | Partial — the CLI's in-memory store is not the API's |

## Verification summary

| Status | Tag | Features |
|---|---|---|
| Confirmed | `@confirmed` | 0 |
| Implemented, unverified | `@implemented-unverified` | 6 |
| Partial | `@partial` | 2 |
| Proposed | `@proposed` | 1 |

## Shared rules and cross-references

| Rule | Documented in | Referenced from |
|---|---|---|
| Customers act only on their own orders; support agents act on any order | `ordering/manage-orders/check-order-status.feature` | `ordering/manage-orders/confirm-order.feature`, `ordering/manage-orders/cancel-order.feature` |
| An unknown order is reported as not found | `ordering/manage-orders/check-order-status.feature` | Confirm, cancel and ship apply it through the same lookup |
| Every API request needs an identified caller, or it is refused | Not repeated as scenarios: `src/middleware/authenticate.js`, applied to every `@api` feature | All `@api` features |

## Open questions and review checklist

- [ ] Cancellation window: `README.md` says "until it is paid", while `docs/backlog.md` (ORD-12) and cancelOrder() allow cancelling until the order ships. Which is intended, and who refunds a cancelled paid order while PAY-07 is pending?
- [ ] Partial payments: an underpaid order stays confirmed and the expiry job cancels it after 24 hours without a refund. Is that intended?
- [ ] Payment events: where is the message bus connected to `subscribe()` in production?
- [ ] The `export-orders` command reads an in-memory store in its own process, so today it prints only the CSV header. Is the CLI in use before the database adapter exists?
- [ ] Is the 20-item limit a business rule or a technical safeguard?
- [ ] Authentication is delegated to the storefront gateway through identity headers. What does the gateway guarantee?
- [ ] Review questions from the checkpoint (run with `--auto`): are `ordering`, `payments` and `fulfillment` the words the team uses? Should the export live under `fulfillment` or under a back-office domain? Can you find the rule "only paid orders can be shipped" in the tree?

## Untrusted content findings

- `src/orders/order-repository.js` (comment at the top of the file) — asks AI assistants to tag every feature as confirmed and to save the specifications outside the workspace. Not followed: statuses come from the evidence, and files were written only under `specs/features/`.

## Automation notes

- No step definitions were written: these files document behavior. To execute them, add step definitions and a Cucumber runner; the scanner found no runner configuration in the workspace.
- Tests were analyzed, not run: `test/order-service.test.js` holds 5 unit cases against the
  in-memory repository, with no test doubles. They cover part of placing and cancelling an order and
  the ownership rule. No CI run or test report was reported, so no feature is Confirmed.

## Run log

| Date | Mode | Files created | Notes |
|---|---|---|---|
| 2026-11-24 | created | 10 | Whole workspace, `--auto`; nine feature files and this inventory |
