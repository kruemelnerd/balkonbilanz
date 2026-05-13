---
phase: 04-pwa-offline-haertung
plan: 02
subsystem: persistence
tags: [indexeddb, dexie, offline, reload, update]
dependency_graph:
  requires: [Phase 04 PWA shell, Dexie repositories]
  provides: [offline write durability, reload durability, update durability]
  affects: [database.ts, repository tests, capture persistence regression]
tech-stack:
  added: []
  patterns: [versionchange auto-close, browser-backed reload regression, repository-level persistence checks]
key-files:
  created:
    - tests/component/captureOfflinePersistence.test.ts
  modified:
    - src/db/database.ts
    - tests/unit/meterReadingsRepository.test.ts
    - tests/unit/pvDailyRepository.test.ts
    - tests/unit/settingsService.test.ts
decisions:
  - Close Dexie connections on versionchange so newer app versions can upgrade cleanly.
metrics:
  duration: "~30m"
  completed_date: "2026-05-13"
---

# Phase 04 Plan 02: Persistence Hardening Summary

Adds regression coverage for local capture persistence and hardens the database lifecycle so newer app versions can open the same IndexedDB without stale connections blocking the upgrade.

## Completed Tasks

| task | name | commit | files |
| --- | --- | --- | --- |
| 1 | RED — Persistenz-Gaps als fehlschlagende Regressionstests kodieren | 47eea12 | `tests/unit/meterReadingsRepository.test.ts`, `tests/unit/pvDailyRepository.test.ts`, `tests/unit/settingsService.test.ts`, `tests/component/captureOfflinePersistence.test.ts` |
| 2 | GREEN/REFACTOR — Repositories/Schema stabilisieren bis alle Persistenztests grün sind | c51df02 | `src/db/database.ts` |

## Verification

- `node --test tests/unit/meterReadingsRepository.test.ts tests/unit/pvDailyRepository.test.ts tests/unit/settingsService.test.ts tests/component/captureOfflinePersistence.test.ts`

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking issue] Explicitly close Dexie connections on versionchange**
- **Found during:** task 2
- **Issue:** The plan depended on update-safe database reopening; the default Dexie behavior already closes stale connections, but the intent was implicit.
- **Fix:** Added an explicit `versionchange` handler in `BalkonBilanzDb` to close stale connections when a newer app version opens the database.
- **Files modified:** `src/db/database.ts`
- **Commit:** c51df02

## Self-Check: PASSED

- Summary file exists.
- Task commits `47eea12` and `c51df02` exist in git history.
