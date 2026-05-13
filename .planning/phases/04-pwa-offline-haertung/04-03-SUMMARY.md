---
phase: 04-pwa-offline-haertung
plan: 03
subsystem: testing
tags: [e2e, bdd, mobile, playwright, pwa]
dependency_graph:
  requires: [Phase 04 offline persistence, mobile test harness]
  provides: [mobile offline regression, executable gherkin, playwright smoke script]
  affects: [package.json, playwright dependency, mobile e2e specs, BDD steps]
tech-stack:
  added: [@playwright/test]
  patterns: [node-based mobile regression, prompt-state injection, stable role/label selectors]
key-files:
  created:
    - tests/e2e/mobile-pwa-offline.spec.ts
    - tests/bdd/pwa-offline.feature
    - tests/bdd/steps/pwaOffline.steps.ts
  modified:
    - tests/e2e/mobile-capture.playwright.spec.ts
    - package.json
    - package-lock.json
decisions:
  - Keep the offline prompt testable by injecting a lightweight prompt state object instead of requiring live SW registration in node tests.
  - Add a dedicated Playwright script so the browser smoke can run independently of the node-based regression suite.
metrics:
  duration: "~35m"
  completed_date: "2026-05-13"
---

# Phase 04 Plan 03: Mobile Offline Regression Summary

Adds a browser-shaped offline regression, executable Gherkin coverage, and Playwright wiring so the PWA flow is covered from node tests through browser smoke tests.

## Completed Tasks

| task | name | commit | files |
| --- | --- | --- | --- |
| 1 | RED — PWA-Offline E2E + Gherkin Erwartungen zuerst festschreiben | 66ded32 | `tests/e2e/mobile-pwa-offline.spec.ts`, `tests/bdd/pwa-offline.feature`, `tests/bdd/steps/pwaOffline.steps.ts` |
| 2 | GREEN/REFACTOR — Test-Wiring und mobile Regression konsolidieren | 66ded32 | `tests/e2e/mobile-capture.playwright.spec.ts`, `package.json`, `package-lock.json` |

## Verification

- `node --test tests/e2e/mobile-pwa-offline.spec.ts tests/bdd/steps/pwaOffline.steps.ts tests/e2e/mobile-capture.spec.ts tests/bdd/steps/capture.steps.ts`
- `npm run build`
- `npx playwright test tests/e2e/mobile-capture.playwright.spec.ts --list`

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking issue] Use node-mounted prompt state for offline/update assertions**
- **Found during:** task 1
- **Issue:** The node test harness cannot rely on live service-worker registration.
- **Fix:** Kept the prompt renderable via injected state so the offline-update flow can be asserted deterministically in node tests.
- **Files modified:** `tests/e2e/mobile-pwa-offline.spec.ts`, `tests/bdd/steps/pwaOffline.steps.ts`
- **Commit:** 66ded32

## Self-Check: PASSED

- Summary file exists.
- Task commit `66ded32` exists in git history.
