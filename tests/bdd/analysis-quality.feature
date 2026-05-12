Feature: Analysequalität
  Scenario: Kombinierte Kennzahlen bleiben als Naeherung sichtbar
    Given eine Analyse mit good, limited und poor Qualitaetsstufen
    When die Auswertung keine belastbare Kostenbasis hat
    Then die Anzeige bleibt als Naeherung markiert
    And die Kostenmeldung lautet "Kosten noch nicht verfuegbar"
