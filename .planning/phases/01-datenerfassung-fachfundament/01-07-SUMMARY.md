---
phase: 01-datenerfassung-fachfundament
plan: 07
subsystem: capture-store / meter edit flow
tags: [gap-closure, tdd, datetime-local, mobile]
requires: [METER-03, METER-01]
provides: [datetime-local edit prefill, store regression coverage]
affects: [src/stores/captureStore.ts, tests/unit/captureStore.test.ts, tests/component/meterCapture.test.ts]
tech-stack:
  added: []
  patterns: [Vue 3, TypeScript, node:test]
key-files:
  created: [tests/unit/captureStore.test.ts]
  modified: [src/stores/captureStore.ts, tests/component/meterCapture.test.ts]
decisions:
  - "Convert only the edit-prefill timestamp to local datetime-local format; keep persisted ISO timestamps unchanged."
  - "Use local-time formatting for datetime-local inputs instead of raw ISO strings."
metrics:
  duration: "~25m"
  completed: "2026-05-11"
---

# Phase 01 Plan 07: Meter Edit Prefill Gap Closure Summary

Schliesst den verbleibenden UAT-Gap beim Bearbeiten von Zaehlerstaenden, indem gespeicherte ISO-Zeitstempel beim Edit-Start browserkompatibel als `datetime-local` vorbefuellt werden.

## Completed Tasks

| task | Name | Commit | Files |
| ---- | ---- | ------ | ----- |
| 1 | RED — failing tests fuer datetime-local Edit-Prefill erstellen | `837d978` | `tests/unit/captureStore.test.ts`, `tests/component/meterCapture.test.ts` |
| 2 | GREEN/REFACTOR — Edit-Prefill-Konvertierung im Store implementieren | `cf93f61` | `src/stores/captureStore.ts`, `tests/unit/captureStore.test.ts` |

## Deviations from Plan

None — plan executed as written.

## Known Stubs

None.

## Threat Flags

None.

## Verification

- `node --test tests/unit/captureStore.test.ts tests/component/meterCapture.test.ts`

## Self-Check

PASSED
