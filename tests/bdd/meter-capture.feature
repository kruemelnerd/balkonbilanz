Feature: Meter capture
  Scenario: User creates and edits a meter reading
    Given an empty meter capture store
    When the user enters a meter reading for "2026-05-10T07:00:00.000Z"
    And saves the meter reading
    Then the reading is visible in the newest-first list
    When the user edits the newest meter reading
    And saves the meter reading again
    Then the meter reading is updated
