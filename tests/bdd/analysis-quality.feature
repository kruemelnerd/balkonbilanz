Feature: Analyse und Qualitaet transparent darstellen

  Scenario: Nutzer sieht Naeherung und Qualitaetsstufen
    Given eine Analyse mit Naeherung
    Then die Qualitaet ist good, limited oder poor
    And Kosten noch nicht verfuegbar wird ehrlich angezeigt

  Scenario: Nutzer versteht die Datenqualitaet
    Then good, limited und poor werden als deutsche Einordnung sichtbar
