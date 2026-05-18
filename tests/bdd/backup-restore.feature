Feature: Lokales Backup und Restore

  Scenario: Backup exportiert alle lokalen Daten
    Given lokale Daten sind vorhanden
    When das Backup exportiert wird
    Then enthält die Datei Schema-Version, Zeitstempel und alle Tabellen

  Scenario: Restore benötigt Vorschau und Bestätigung
    Given eine gültige Backup-Datei
    When ich die Vorschau öffne
    Then bleibt der Restore ohne Bestätigung gesperrt
