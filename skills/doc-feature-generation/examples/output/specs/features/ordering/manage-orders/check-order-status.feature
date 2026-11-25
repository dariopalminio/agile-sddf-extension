# Evidence: src/orders/orders.routes.js — GET /orders/:id
# Evidence: src/orders/order-service.js — getOrderStatus(), findOwnedOrder()
# Tests: test/order-service.test.js — "does not let a customer cancel the order of another customer" covers the ownership rule through a cancellation (unit, in-memory repository)
# Status: Implemented, unverified — the ownership rule is covered by 1 test, analyzed, not run; no test covers reading a status or the support role
# See also: ordering/manage-orders/confirm-order.feature, ordering/manage-orders/cancel-order.feature (apply the ownership rule documented here)
@implemented-unverified @api @access-control
Feature: Check the status of an order
  A customer checks the status of one of their orders; a support agent can check any order.
  Customers act only on their own orders, and an unknown order is reported as not found.

  Rule: Customers act only on their own orders; support agents act on any order

    Scenario: The customer checks the status of their order
      Given a confirmed order of the customer
      When the customer checks the status of the order
      Then the customer sees that the order is confirmed

    Scenario: A customer cannot see the order of another customer
      Given an order that belongs to another customer
      When the customer checks the status of the order
      Then the request is rejected because the order belongs to another customer

    Scenario: A support agent checks the order of any customer
      Given an order that belongs to a customer
      When a support agent checks the status of the order
      Then the support agent sees the status of the order

  Rule: An unknown order is reported as not found

    Scenario: The customer asks for an order that does not exist
      Given no order with the requested reference
      When the customer checks the status of the order
      Then the request is rejected because the order is not found
