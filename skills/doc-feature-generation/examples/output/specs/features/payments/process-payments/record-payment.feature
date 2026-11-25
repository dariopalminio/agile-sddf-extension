# Evidence: src/payments/payment-events.js — subscribe("payment.received")
# Evidence: src/payments/message-bus-client.js — subscribe(), publishForTesting()
# Evidence: src/orders/order-service.js — orderTotal()
# Tests: no test covers it
# Status: Partial — the handler is implemented, but no code in the repository connects it to the message bus; README.md places that connection in the deployment environment
@partial @event
Feature: Record a payment
  When the payment provider reports a captured payment, a confirmed order paid in full becomes paid.
  An underpaid order is flagged, and a payment for an unknown or unconfirmed order is ignored.

  Rule: A payment that covers the order total marks the order as paid

    Scenario: A full payment is recorded
      Given a confirmed order with a total of 25.00
      When the payment provider reports a payment of 25.00 for the order
      Then the order is paid

    Scenario: An underpaid order is flagged
      Given a confirmed order with a total of 25.00
      When the payment provider reports a payment of 20.00 for the order
      Then the order stays confirmed
      And the order is flagged as underpaid

  Rule: Only confirmed orders take payments

    Scenario Outline: A payment for an order that does not await payment is ignored
      Given <order>
      When the payment provider reports a payment for the order
      Then the payment is ignored

      Examples:
        | order             |
        | no matching order |
        | a pending order   |
        | a paid order      |
        | a cancelled order |
