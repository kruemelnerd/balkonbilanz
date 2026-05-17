---
status: diagnosed
phase: 01-datenerfassung-fachfundament
source:
  - 01-01-SUMMARY.md
  - 01-02-SUMMARY.md
  - 01-03-SUMMARY.md
  - 01-04-SUMMARY.md
  - 01-05-SUMMARY.md
started: 2026-05-11T17:19:14Z
updated: 2026-05-11T17:23:39Z
---

## Current Test

[testing complete]

## Tests

### 1. Cold Start Smoke Test
expected: App startet frisch ohne Build-/Ladefehler; die Hauptansicht ist erreichbar.
result: issue
reported: "nein folgender Fehler kommt: [plugin:vite:import-analysis] Failed to parse source for import analysis because the content contains invalid JS syntax. Install @vitejs/plugin-vue to handle .vue files.\n\n/home/philipp/Dokumente/code/balkonbilanz_new/src/App.vue:3:9\n\n1  |  <script setup lang=\"ts\">\n2  |  import CaptureView from './features/capture/CaptureView.vue';\n3  |  </script>\n   |           ^\n4  |  \n5  |  <template>\n\n    at TransformPluginContext._formatLog (file:///home/philipp/Dokumente/code/balkonbilanz_new/node_modules/vite/dist/node/chunks/config.js:29647:43)\n    at TransformPluginContext.error (file:///home/philipp/Dokumente/code/balkonbilanz_new/node_modules/vite/dist/node/chunks/config.js:29644:14)\n    at TransformPluginContext.transform (file:///home/philipp/Dokumente/code/balkonbilanz_new/node_modules/vite/dist/node/chunks/config.js:27730:10)\n    at async EnvironmentPluginContainer.transform (file:///home/philipp/Dokumente/code/balkonbilanz_new/node_modules/vite/dist/node/chunks/config.js:29445:14)\n    at async loadAndTransform (file:///home/philipp/Dokumente/code/balkonbilanz_new/node_modules/vite/dist/node/chunks/config.js:23316:26)\n    at async viteTransformMiddleware (file:///home/philipp/Dokumente/code/balkonbilanz_new/node_modules/vite/dist/node/chunks/config.js:25188:20)"
severity: blocker

### 2. Capture-Ansicht wird gerendert
expected: Nach dem Start sind Meter- und PV-Capture-Bereiche sichtbar; kein Fehleroverlay.
result: skipped
reason: "Validierung gestoppt: Alle anderen Tests geskippt, da die Anwendung nicht sauber startet (siehe Test 1)."

### 3. Zaehlerstand erfassen (Happy Path)
expected: Gueltiger Zaehlerstand kann gespeichert werden und erscheint in der Liste oben.
result: skipped
reason: "Validierung gestoppt: Alle anderen Tests geskippt, da die Anwendung nicht sauber startet (siehe Test 1)."

### 4. Zaehler-Validierung blockiert ungueltige Eingaben
expected: Fehlende/ungueltige Pflichtfelder werden klar als Fehler angezeigt und nicht gespeichert.
result: skipped
reason: "Validierung gestoppt: Alle anderen Tests geskippt, da die Anwendung nicht sauber startet (siehe Test 1)."

### 5. Doppelter Zeitstempel wird geblockt
expected: Ein zweiter Zaehlerstand mit identischem Zeitpunkt wird abgewiesen.
result: skipped
reason: "Validierung gestoppt: Alle anderen Tests geskippt, da die Anwendung nicht sauber startet (siehe Test 1)."

### 6. Sinkender Zaehlerwert zeigt Zaehlerwechsel-Hinweis
expected: Bei sinkendem OBIS-Wert wird Speichern geblockt oder in den Zaehlerwechsel-Flow geleitet.
result: skipped
reason: "Validierung gestoppt: Alle anderen Tests geskippt, da die Anwendung nicht sauber startet (siehe Test 1)."

### 7. PV-Tageswert nur fuer vergangene Tage
expected: Heute/Zukunft wird abgewiesen; vergangener Tag wird akzeptiert.
result: skipped
reason: "Validierung gestoppt: Alle anderen Tests geskippt, da die Anwendung nicht sauber startet (siehe Test 1)."

### 8. PV-Tag aktualisieren (Upsert)
expected: Erneutes Speichern fuer denselben Tag ersetzt den bestehenden Tageswert.
result: skipped
reason: "Validierung gestoppt: Alle anderen Tests geskippt, da die Anwendung nicht sauber startet (siehe Test 1)."

### 9. Meter- und PV-Eintrag bearbeiten/loeschen
expected: Bearbeiten und Loeschen funktionieren konsistent in beiden Listen.
result: skipped
reason: "Validierung gestoppt: Alle anderen Tests geskippt, da die Anwendung nicht sauber startet (siehe Test 1)."

### 10. Persistenz nach Reload
expected: Erfasste Meter- und PV-Daten bleiben nach Seiten-Reload erhalten.
result: skipped
reason: "Validierung gestoppt: Alle anderen Tests geskippt, da die Anwendung nicht sauber startet (siehe Test 1)."

## Summary

total: 10
passed: 0
issues: 1
pending: 0
skipped: 9
blocked: 0

## Gaps

- truth: "App startet frisch ohne Build-/Ladefehler; die Hauptansicht ist erreichbar."
  status: failed
  reason: "User reported: [plugin:vite:import-analysis] Failed to parse source for import analysis because the content contains invalid JS syntax. Install @vitejs/plugin-vue to handle .vue files."
  severity: blocker
  test: 1
  root_cause: "Projektweit fehlt eine vite.config mit Registrierung von @vitejs/plugin-vue; dadurch wird App.vue bei Import-Analyse als Plain-JS behandelt und der Start bricht ab."
  artifacts:
    - path: "package.json"
      issue: "@vitejs/plugin-vue ist installiert, aber nicht in Vite eingebunden"
    - path: "src/App.vue"
      issue: "Vue SFC kann ohne aktiviertes Vue-Plugin nicht geparst werden"
    - path: "vite.config.*"
      issue: "Datei fehlt; Plugin-Registrierung (plugins: [vue()]) fehlt"
  missing:
    - "Vite-Konfigurationsdatei im Projektroot anlegen"
    - "@vitejs/plugin-vue importieren und vue() in plugins registrieren"
    - "Cold-Start Smoke Test nach Konfigurationsaenderung erneut ausfuehren"
  debug_session: ".planning/debug/cold-start-vite-vue.md"
