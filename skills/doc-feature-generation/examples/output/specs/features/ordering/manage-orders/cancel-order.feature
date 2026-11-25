# Evidence: src/orders/orders.routes.js — POST /orders/:id/cancel
# Evidence: src/orders/order-service.js — cancelOrder()
# Evidence: docs/backlog.md — ORD-12 Cancel an order (done)
# Tests: test/order-service.test.js — "cancels a pending order", "does not cancel a shipped order" (unit, in-memory repository)
# Status: Implemented, unverified — covered by 2 tests, analyzed, not run; no test covers the confirmed, paid or cancelled cases
# See also: ordering/manage-orders/check-order-status.feature (owns the order-ownership rule applied here)
@implemented-unverified @api
Feature: Cancel an order
  A customer cancels one of their orders before it ships; the order becomes cancelled.
  Shipped orders and orders already cancelled cannot be cancelled.

  Rule: An order can be cancelled until it ships

    Scenario Outline: The customer cancels an order that has not shipped
      Given a <status> order of the customer
      When the customer cancels the order
      Then the order is cancelled

      Examples:
        | status    |
        | pending   |
        | confirmed |

    # Question: README.md says customers can cancel an order "until it is paid", but cancelOrder() also
    # cancels paid orders, and refunds (PAY-07) are not implemented. Which rule is intended?
    @open-question
    Scenario: The customer cancels a paid order
      Given a paid order of the customer
      When the customer cancels the order
      Then the order is cancelled

    Scenario Outline: A shipped or cancelled order cannot be cancelled
      Given a <status> order of the customer
      When the customer cancels the order
      Then the cancellation is rejected because a <status> order cannot be cancelled

      Examples:
        | status    |
        | shipped   |
        | cancelled |
