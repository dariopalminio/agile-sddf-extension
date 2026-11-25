# Evidence: package.json — bin order-desk-admin -> bin/admin.js
# Evidence: bin/admin.js — command export-orders, option --status (default "paid")
# Evidence: src/orders/order-repository.js — list(), in-memory store
# Tests: no test covers it
# Status: Partial — the CLI runs in its own process with its own in-memory store, so it cannot see the orders the API records until the planned database adapter exists
@partial @cli
Feature: Export orders for the warehouse
  A back-office operator exports orders as CSV for the warehouse, filtered by status.
  Without a status, the export lists the paid orders.

  Rule: The export lists the orders in the requested status, paid by default

    Scenario: The operator exports the paid orders
      Given paid orders and confirmed orders
      When the operator exports the orders without a status
      Then the export lists only the paid orders
      And each row shows the order, the customer, the status and the number of items

    Scenario: The operator exports the orders in another status
      Given paid orders and confirmed orders
      When the operator exports the orders with the status "confirmed"
      Then the export lists only the confirmed orders
