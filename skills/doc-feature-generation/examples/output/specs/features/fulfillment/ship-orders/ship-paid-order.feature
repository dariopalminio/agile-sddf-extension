# Evidence: src/orders/orders.routes.js — POST /orders/:id/ship, requireRole('warehouse')
# Evidence: src/orders/order-service.js — shipOrder()
# Evidence: docs/backlog.md — ORD-21 Shipping notification (listed under "Next", not implemented)
# Tests: no test covers it
# Status: Implemented, unverified — no test covers it; the shipping email is only proposed
@implemented-unverified @api @access-control
Feature: Ship a paid order
  A warehouse operator marks a paid order as shipped.
  Only warehouse operators can ship an order, and only paid orders can be shipped.

  Rule: Only warehouse operators can ship an order

    Scenario: A user without the warehouse role cannot ship an order
      Given a paid order
      When a customer tries to ship the order
      Then the request is rejected as forbidden

  Rule: Only paid orders can be shipped

    Scenario: The warehouse operator ships a paid order
      Given a paid order
      When a warehouse operator ships the order
      Then the order is shipped

    Scenario Outline: An order that is not paid cannot be shipped
      Given a <status> order
      When a warehouse operator ships the order
      Then the shipment is rejected because only paid orders can be shipped

      Examples:
        | status    |
        | pending   |
        | confirmed |
        | shipped   |
        | cancelled |

  Rule: The customer is told when their order ships

    @proposed
    Scenario: The customer receives a shipping email
      Given a paid order of a customer
      When a warehouse operator ships the order
      Then the customer receives an email saying that the order has shipped
