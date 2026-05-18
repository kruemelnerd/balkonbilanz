---
phase: 03-einstellungen-backup-speicherberater
plan: 07
subsystem: settings / analysis / advisor
tags: [gap-closure, tdd, vue, analysis]
requires: [BATT-01, BATT-02, BATT-03, BATT-04, SET-02]
provides: [live-advisor-context, automatic-quality-warning, no-manual-quality-toggle]
affects: [src/features/settings/SettingsView.vue, src/features/settings/BatteryAdvisorCard.vue, tests/unit/batteryAdvisorService.test.ts, tests/component/batteryAdvisorCard.test.ts, tests/e2e/mobile-settings-battery.spec.ts]
tech-stack:
  added: [Vue 3, node:test, Dexie]
  patterns: [analysis-store-snapshot, automatic-warning-derivation, derived-input-props]
key-files:
  created: []
  modified: [src/features/settings/SettingsView.vue, src/features/settings/BatteryAdvisorCard.vue, tests/unit/batteryAdvisorService.test.ts, tests/component/batteryAdvisorCard.test.ts, tests/e2e/mobile-settings-battery.spec.ts]
decisions:
  - "The advisor card consumes analysis quality from the settings shell instead of a manual toggle."
  - "Live advisor inputs are built from the current analysis window plus persisted electricity price."
metrics:
  duration: "~1h"
  completed_date: "2026-05-13"
---

# Phase 03 Plan 07: Einstellungen, Backup & Speicherberater Summary

The battery advisor is now driven by live analysis quality and persisted pricing from the settings shell, so the warning state is derived instead of user-toggled.

## Completed Tasks

| task | name | commit | files |
| --- | --- | --- | --- |
| 1 | RED — Tests für analysegetriebene Advisor-Inputs und Warning-Ableitung ergänzen | `2c47910` | `tests/unit/batteryAdvisorService.test.ts`, `tests/component/batteryAdvisorCard.test.ts`, `tests/e2e/mobile-settings-battery.spec.ts` |
| 2 | GREEN — Settings/Analysis-Kontext in BatteryAdvisorCard und Service verdrahten | `900b1da` | `src/features/settings/SettingsView.vue`, `src/features/settings/BatteryAdvisorCard.vue`, `tests/e2e/mobile-settings-battery.spec.ts` |
| 3 | Batterieberater-Regressionsmatrix (unit+component+mobile) finalisieren | n/a | `tests/unit/batteryAdvisorService.test.ts`, `tests/component/batteryAdvisorCard.test.ts`, `tests/e2e/mobile-settings-battery.spec.ts` |

## Deviations from Plan

None. The final smoke run waited for the live settings shell to finish loading before asserting the advisor state.

## Verification

`node --test tests/unit/batteryAdvisorService.test.ts tests/component/batteryAdvisorCard.test.ts tests/e2e/mobile-settings-battery.spec.ts`

## Self-Check

PASSED
