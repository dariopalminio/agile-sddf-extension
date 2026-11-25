# Evidence: docs/backlog.md — PAY-07 Refund a paid order (listed under "Next")
# Tests: no test covers it
# Status: Proposed — described in the backlog; no implementation found
@proposed
Feature: Refund a paid order
  A support agent refunds a paid order.
  A refund is possible within 30 days of the payment and never exceeds the amount paid.

  Rule: A paid order can be refunded within 30 days of the payment

    Scenario: The support agent refunds a recent payment
      Given an order paid 10 days ago
      When a support agent refunds the order
      Then the refund is accepted

    Scenario: A payment older than 30 days cannot be refunded
      Given an order paid 31 days ago
      When a support agent refunds the order
      Then the refund is rejected

  Rule: A refund never exceeds the amount paid

    Scenario: A refund above the amount paid is rejected
      Given an order paid with 25.00
      When a support agent refunds 30.00 for the order
      Then the refund is rejected
