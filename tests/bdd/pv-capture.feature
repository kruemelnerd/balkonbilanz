Feature: PV capture
  Scenario: User stores past-day PV generation and blocks today
    Given an empty PV capture store
    When the user enters PV generation for "2026-05-10"
    And saves the PV entry
    Then the entry is visible in the newest-first list
    When the user tries to save PV generation for today
    Then the form shows a blocking date error
