# Evidence: src/jobs/expire-unpaid-orders.js — cron "0 * * * *", UNPAID_ORDER_TTL_HOURS = 24
# Evidence: src/orders/order-repository.js — findUnpaidConfirmedBefore()
# Tests: no test covers it
# Status: Implemented, unverified — no test covers the job, which starts with the API process (src/server.js)
@implemented-unverified @job
Feature: Expire unpaid orders
  Every hour, the system cancels the confirmed orders that are still unpaid 24 hours after confirmation.
  The cancellation records "payment timeout" as its reason.

  Rule: A confirmed order still unpaid 24 hours after confirmation is cancelled

    Scenario: An unpaid order expires
      Given an order confirmed 25 hours ago and still unpaid
      When the hourly expiry check runs
      Then the order is cancelled
      And the cancellation reason is "payment timeout"

    Scenario: A recently confirmed order is kept
      Given an order confirmed 2 hours ago and still unpaid
      When the hourly expiry check runs
      Then the order stays confirmed

    Scenario: A paid order is kept
      Given an order confirmed 25 hours ago and paid
      When the hourly expiry check runs
      Then the order stays paid

    # Question: an underpaid order keeps the confirmed status, so it expires like an unpaid one and its
    # partial payment is not refunded. Is that the intended handling of partial payments?
    @open-question
    Scenario: An underpaid order expires
      Given an order confirmed 25 hours ago with a payment below its total
      When the hourly expiry check runs
      Then the order is cancelled
