Feature: Einstellungen, Backup und Speicherberater

  Scenario: Nutzer erreicht die Einstellungen ueber die Hauptnavigation
    Given die Hauptnavigation ist sichtbar
    When ich auf Einstellungen klicke
    Then ich sehe die Seite Einstellungen

  Scenario: Nutzer kann ein Backup nur nach Vorschau und Bestaetigung wiederherstellen
    Given ein Backup ist geladen
    When ich die Datei pruefe
    Then erscheint die Vorschau
    When ich die Restore-Bestaetigung setze
    Then der Restore-Button wird aktiv

  Scenario: Speicherberater aktualisiert nach dem Speichern der Einstellungen
    Given die Einstellungen sind geladen
    When ich den Strompreis aendere und speichere
    Then aktualisieren sich die Sparszenarien
