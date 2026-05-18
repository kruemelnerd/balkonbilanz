Feature: Speicherberater in den Einstellungen

  Scenario: Vier Szenarien bleiben in fixer Reihenfolge
    Given der Speicherberater ist geöffnet
    When ich die Szenarien anzeige
    Then erscheinen konservativ, realistisch, optimistisch und theoretisch in dieser Reihenfolge
