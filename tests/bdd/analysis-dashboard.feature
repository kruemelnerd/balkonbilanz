Feature: Analyse-Dashboard und Datenqualitaet
  Szenario: Dashboard bleibt leer ehrlich und bietet Erfassungsaktionen an
    Given ein leeres Dashboard
    When die App im Dashboard startet
    Then die Anzeige erklaert, dass noch keine Auswertung moeglich ist
    And die Aktionen zum Erfassen von Zaehlerstand und PV-Tageswert sind sichtbar

  Szenario: Dashboard zeigt Naeherung und Qualitaet bei gefuellten Daten
    Given ein befuelltes Dashboard mit kombinierter Auswertung
    When die Kennzahlen gerendert werden
    Then die Anzeige bleibt als Naeherung markiert
    And die Qualitaetsstufe ist good, limited oder poor mit Gruenden wie Nur 3 von 7 PV-Tagen vorhanden

  Szenario: Analyse oeffnet standardmaessig mit dreissig Tagen
    Given die Analyseansicht wird geoeffnet
    When kein Zeitraum explizit gesetzt ist
    Then der Zeitraum ist auf 30 Tage gesetzt

  Szenario: Analyse bietet Schnellpresets fuer sieben, dreissig und neunzig Tage
    Given die Analyseansicht wird geoeffnet
    When die Zeitraum-Presets angezeigt werden
    Then die Presets 7 Tage, 30 Tage und 90 Tage sind verfuegbar

  Szenario: PV-Tageswerte bleiben getrennt von Zaehlerintervallen
    Given ein gemischter Analysezeitraum mit PV und Zaehlerdaten
    When die Auswertung gerendert wird
    Then die PV-Tageswerte stehen in einer eigenen Sektion
    And sie werden nicht mit Intervallen verschmolzen

  Szenario: Plausibilitaetswarnung bleibt bei PV kleiner als Einspeisung sichtbar
    Given ein Zeitraum mit PV kleiner als Einspeisung
    When die kombinierte Auswertung angezeigt wird
    Then eine Plausibilitaetswarnung bleibt sichtbar
    And die Warnung lautet Plausibilitaetswarnung: Einspeisung liegt ueber dem erfassten PV-Tagesertrag.
    And die Qualitaet wird downgraded auf poor

  Szenario: Dashboard-Schnellaktionen fuehren direkt zur passenden Erfassung
    Given ein Dashboard mit sichtbaren Schnellaktionen
    When ich Zaehlerstand erfassen auswaehle
    Then gelange ich direkt zu /capture#meter-timestamp
    When ich PV-Tageswert erfassen auswaehle
    Then gelange ich direkt zu /capture#pv-day
