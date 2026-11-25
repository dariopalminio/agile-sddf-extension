# Evidence: src/orders/orders.routes.js — POST /orders (router mounted at /orders in src/server.js)
# Evidence: src/orders/order-service.js — placeOrder(), MAX_ITEMS_PER_ORDER = 20
# Tests: test/order-service.test.js — "places a pending order", "rejects an order without items" (unit, in-memory repository)
# Status: Implemented, unverified — covered by 2 tests, analyzed, not run; no test covers the 20-item limit
@implemented-unverified @api
Feature: Place an order
  A customer places an order with the items they want; the order is recorded as pending and belongs to them.
  An order needs at least one item and at most 20 items.

  Rule: An order needs at least one item

    Scenario: The customer places an order with items
      Given a customer
      When the customer places an order with 2 items
      Then the order is recorded as pending
      And the order belongs to the customer

    Scenario: An order without items is rejected
      Given a customer
      When the customer places an order with no items
      Then the order is rejected because it needs at least one item

  Rule: An order cannot have more than 20 items

    Scenario Outline: The item limit is enforced
      Given a customer
      When the customer places an order with <count> items
      Then the order is <result>

      Examples:
        | count | result                                             |
        | 20    | recorded as pending                                |
        | 21    | rejected because it cannot have more than 20 items |
