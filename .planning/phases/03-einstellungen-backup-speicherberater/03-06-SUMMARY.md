---
phase: 03-einstellungen-backup-speicherberater
plan: 06
subsystem: settings / backup
tags: [gap-closure, tdd, vue, backup]
requires: [SET-03, BKP-03]
provides: [tariff-edit-delete-ui, safe-backup-json-parse]
affects: [src/features/settings/SettingsView.vue, tests/component/settingsView.test.ts, tests/e2e/mobile-settings-battery.spec.ts]
tech-stack:
  added: [Vue 3, node:test]
  patterns: [red-green-refactor, guarded-json-parse, local-edit-mode]
key-files:
  created: []
  modified: [src/features/settings/SettingsView.vue, tests/component/settingsView.test.ts, tests/e2e/mobile-settings-battery.spec.ts]
decisions:
  - "Tarifperioden get edit/delete actions and a dedicated update mode in the settings card."
  - "Malformed backup JSON fails closed before any restore mutation."
metrics:
  duration: "~1h"
  completed_date: "2026-05-13"
---

# Phase 03 Plan 06: Einstellungen, Backup & Speicherberater Summary

Tarifperioden can now be edited and deleted directly from the settings UI, and malformed backup files are rejected inline before any restore logic runs.

## Completed Tasks

| task | name | commit | files |
| --- | --- | --- | --- |
| 1 | RED — Regressionstests für Tarif-Edit/Lösch-Flow und malformed-backup UI-Fehler schreiben | `0a966e9` | `tests/component/settingsView.test.ts`, `tests/e2e/mobile-settings-battery.spec.ts` |
| 2 | GREEN — SettingsView mit Tarif-Bearbeiten/Löschen und sicherem JSON-Parsing umsetzen | `4fd8ed7` | `src/features/settings/SettingsView.vue` |
| 3 | Vollständigen Settings/Backup-Regressionslauf ausführen | n/a | `tests/component/settingsView.test.ts`, `tests/e2e/mobile-settings-battery.spec.ts`, `tests/unit/backupService.test.ts` |

## Deviations from Plan

None. The regression sweep for this plan was executed after the shared battery-advisor fix landed, so the combined suite could validate the settings shell in its final state.

## Verification

`node --test tests/component/settingsView.test.ts tests/unit/backupService.test.ts tests/e2e/mobile-settings-battery.spec.ts`

## Self-Check

PASSED
