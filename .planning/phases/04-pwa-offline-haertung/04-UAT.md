---
status: complete
phase: 04-pwa-offline-haertung
source:
  - 04-01-SUMMARY.md
  - 04-02-SUMMARY.md
  - 04-03-SUMMARY.md
  - 04-04-SUMMARY.md
  - 04-05-SUMMARY.md
started: 2026-05-13T18:55:17Z
updated: 2026-05-17T18:18:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Cold Start Smoke Test
expected: Frisch gebaut und neu gestartet laedt BalkonBilanz ohne Boot-Fehler und zeigt einen Hauptscreen mit funktionierender Navigation.
result: pass

### 2. Offline-Speicherung ueberlebt Reload
expected: In der Erfassung koennen ein Zaehlerstand und ein PV-Tageswert gespeichert werden; nach dem Offline-Reload bleiben beide Eintraege sichtbar.
result: pass

### 3. Update-Hinweis-UI laesst sich bestaetigen
expected: Wenn der Update-Zustand aktiv ist, erscheint ein sichtbarer Hinweis mit "Neue Version verfuegbar" und die Aktion "Jetzt aktualisieren" schliesst den Hinweis ueber den vorgesehenen Reload-Pfad.
result: pass

### 4. Realer Offline-Neustart im eigenen Browser
expected: Nachdem du BalkonBilanz einmal online geladen hast, schaltest du in deinem Browser oder auf deinem Geraet die Verbindung aus und laedst die App neu oder oeffnest sie erneut. Die App-Oberflaeche oeffnet sich weiter und vorhandene lokale Daten bleiben sichtbar.
result: pass

### 5. Echter Versionswechsel zeigt Update-Hinweis
expected: Wenn du von einer aelteren auf eine neuere bereitgestellte Version wechselst, erscheint "Neue Version verfuegbar" und das Aktualisieren haelt die App benutzbar und die lokalen Daten intakt.
result: pass

## Summary

total: 5
passed: 5
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps

none
