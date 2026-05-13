Feature: Analyse und Dashboard zeigen lesbare Copy

  Scenario: Dashboard Quick Actions fuehren zur Erfassung
    Given das Dashboard ist sichtbar
    When ich auf Zählerstand erfassen klicke
    Then die Erfassung springt zu #meter-timestamp

  Scenario: Analyse uebersetzt Warnungen und Qualitaet
    Given eine Analyse mit 3 von 7 PV-Tagen
    Then ich sehe Plausibilitaetswarnung
    And ich sehe Nur 3 von 7 PV-Tagen vorhanden
