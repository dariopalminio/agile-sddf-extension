Feature: Cancel an order before shipping

  Customers change their minds. Support wants them to be able to cancel without calling us.

  Scenario: A customer cancels an order that has not shipped
    Given Ana has an order that is waiting for payment
    When she cancels it
    Then the order is cancelled

  Scenario: A shipped order cannot be cancelled
    Given Ana has an order that was shipped yesterday
    When she tries to cancel it
    Then she is told that shipped orders cannot be cancelled
