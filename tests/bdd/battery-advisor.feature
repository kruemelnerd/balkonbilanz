Feature: Speicherberater

  Scenario: Vier Szenarien bleiben in fixer Reihenfolge
    Given die Speicherberater-Karte ist geöffnet
    When die Berechnung läuft
    Then erscheinen konservativ, realistisch, optimistisch und theoretisch in dieser Reihenfolge

  Scenario: Schlechte Datenqualität warnt deutlich
    Given die Datenqualität ist poor
    When die Berechnung läuft
    Then wird eine Aussagekraft-Warnung angezeigt
