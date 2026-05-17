---
status: awaiting_human_verify
trigger: "Backup-Preview-Upload in Phase 3 ist kaputt. Reproduktion: Auf /settings nach Dateiauswahl und Klick auf 'Backup prüfen' wirft die App `TypeError: Failed to execute 'readAsText' on 'FileReader': parameter 1 is not of type 'Blob'.` Vorheriger Befund: In `SettingsView.vue` wird `selectedBackupFile` aus `event.target.files?.[0]` gesetzt und `previewBackup()` versucht zuerst `file.text()`, faellt sonst auf `FileReader.readAsText(file)` zurueck. Bitte den Root Cause sauber eingrenzen und den minimalen Fix umsetzen. Arbeite nach TDD, fuege nur sinnvolle Regression-Checks hinzu, verifiziere den Fix im Browser und mit passenden Repo-Tests/Build. Nicht committen, ausser es ist fuer den Workflow zwingend erforderlich."
created: 2026-05-13T16:01:46.926Z
updated: 2026-05-13T16:01:46.926Z
updated: 2026-05-13T16:05:45.000Z
---

## Current Focus

hypothesis: Der Click-Handler fuer 'Backup prüfen' hat implizit das MouseEvent an previewBackup() uebergeben; das ist jetzt behoben
test: Reproduktion im Browser plus gezielte Repo-Tests erneut ausfuehren
expecting: Datei-Upload + Klick auf 'Backup prüfen' zeigt die Vorschau ohne TypeError; Tests und Build bleiben gruen
next_action: await human verification of the browser flow

## Symptoms

expected: Nach Dateiauswahl auf /settings und Klick auf 'Backup prüfen' soll eine Vorschau des Backups erscheinen bzw. validiert werden, ohne Exception
actual: Die App wirft `TypeError: Failed to execute 'readAsText' on 'FileReader': parameter 1 is not of type 'Blob'.`
errors: `TypeError: Failed to execute 'readAsText' on 'FileReader': parameter 1 is not of type 'Blob'.`
reproduction: Auf /settings eine Backup-Datei auswählen und auf 'Backup prüfen' klicken
started: Unbekannt; reproduzierbar im aktuellen Phase-3-Stand

## Eliminated

- timestamp: 2026-05-13T16:03:00.000Z
  checked: Added component regression test that clicks "Backup prüfen" after selecting a backup file
  found: The test fails before the fix; preview receives the click event path and backup parsing never sees the selected file correctly (component test currently ends in empty-input JSON parse failure)
  implication: The bug is in the event binding / call signature around the button, not in backup file selection itself

- timestamp: 2026-05-13T16:05:45.000Z
  checked: Opened the settings page in a real browser, uploaded a valid backup JSON and clicked "Backup prüfen"
  found: The preview renders successfully with Schema-Version 1 and restore stays gated until confirmation
  implication: The minimal template fix resolves the browser reproduction end-to-end

## Resolution

root_cause: Der Button 'Backup prüfen' rief `previewBackup` als Event-Handler ohne Klammern auf. Vue uebergab dadurch das Click-Event als erstes Argument; der Code behandelte es als Datei und fiel auf `FileReader.readAsText(event)` zurueck, was mit `parameter 1 is not of type 'Blob'` scheiterte.
fix: Den Button-Handler in `SettingsView.vue` auf `@click="previewBackup()"` umgestellt, damit `selectedBackupFile` verwendet wird statt des MouseEvents.
verification: Component-Regressionstest, mobile Settings-Flow-Test, Browser-Upload/Preview und `vite build` erfolgreich ausgefuehrt.
files_changed: ["src/features/settings/SettingsView.vue", "tests/component/settingsView.test.ts"]
