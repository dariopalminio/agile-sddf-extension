# Evidence: src/orders/orders.routes.js — POST /orders/:id/confirm
# Evidence: src/orders/order-service.js — confirmOrder()
# Tests: no test covers it
# Status: Implemented, unverified — no test covers it
# See also: ordering/manage-orders/check-order-status.feature (owns the order-ownership rule applied here)
@implemented-unverified @api
Feature: Confirm an order
  A customer confirms one of their pending orders; the order becomes confirmed and awaits payment.
  Only pending orders can be confirmed.

  Rule: Only pending orders can be confirmed

    Scenario: The customer confirms a pending order
      Given a pending order of the customer
      When the customer confirms the order
      Then the order is confirmed

    Scenario Outline: An order that is no longer pending cannot be confirmed
      Given a <status> order of the customer
      When the customer confirms the order
      Then the confirmation is rejected because only pending orders can be confirmed

      Examples:
        | status    |
        | confirmed |
        | paid      |
        | shipped   |
        | cancelled |
