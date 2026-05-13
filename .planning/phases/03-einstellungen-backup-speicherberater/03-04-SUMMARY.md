---
phase: 03-einstellungen-backup-speicherberater
plan: 04
subsystem: shell-settings-ui
tags: [router, navigation, settings-ui, mobile-first]
requires: [SET-01, SET-02, SET-03, SET-04, BKP-01, BKP-02, BKP-03]
provides: [settings-route, shell-nav-entry, settings-cards]
affects: [src/router/index.ts, src/main.ts, src/features/shell/AppShellNav.vue, src/features/settings/SettingsView.vue, tests/component/appShellNavRouter.test.ts, tests/component/settingsView.test.ts]
key-files: [src/router/index.ts, src/main.ts, src/features/shell/AppShellNav.vue, src/features/settings/SettingsView.vue, tests/component/settingsView.test.ts]
decisions: [settings-route-label-mehr, explicit-save-and-restore-actions]
metrics:
  duration: unknown
  completed: 2026-05-13
---

# Phase 03 Plan 04: Einstellungen-Route & Karten Summary

Die neue Mehr/Einstellungen-Route ist im Shell-Flow erreichbar und enthält die mobilen Settings-/Backup-Karten.

## Tasks
- Bottom-Navigation um „Mehr“ erweitert und `/settings` verdrahtet.
- Einstellungen-, Tarif- und Backup-Karten mit klaren, expliziten Aktionen umgesetzt.

## Commits
- 67fdb12: add settings route to shell navigation
- 79344ac: build settings management cards

## Deviations from Plan
None.

## Self-Check: PASSED
