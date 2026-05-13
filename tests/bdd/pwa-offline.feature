Feature: PWA Offline

  Scenario: Nutzer speichert Daten offline und sieht den Update-Hinweis
    Given ein browsergestützter Capture-Store ist leer
    When ich einen Zählerstand und einen PV-Tageswert speichere
    And die App neu lade
    Then bleiben die gespeicherten Einträge sichtbar
    When eine neue Version verfuegbar ist
    Then sehe ich den Hinweis Neue Version verfuegbar
