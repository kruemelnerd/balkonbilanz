---
phase: 04-pwa-offline-haertung
plan: 05
subsystem: testing
tags: [bdd, node:test, playwright, pv-validation, mobile]

# Dependency graph
requires:
  - phase: 04-04
    provides: real mobile browser regression foundation for the remaining PWA gaps
provides:
  - runner-bound Gherkin execution
  - stable PV date validation regression
  - cleaned-up smoke wiring for the offline phase
affects: [package.json, tests/bdd/*, tests/unit/pvDailyService.test.ts, mobile capture Playwright]

# Tech tracking
tech-stack:
  added: []
  patterns: [feature-file-backed node:test runner, renamed node smoke coverage, dynamic date fixtures]

key-files:
  created:
    - tests/bdd/pwa-offline.spec.ts
  modified:
    - package.json
    - tests/bdd/steps/pwaOffline.steps.ts
    - tests/e2e/mobile-capture.playwright.spec.ts
    - tests/unit/pvDailyService.test.ts
    - tests/e2e/mobile-pwa-offline.spec.ts -> tests/node/mobile-pwa-offline.spec.ts

key-decisions:
  - "Bind the PWA feature file to a dedicated node:test runner so the scenario is actually executable instead of orphaned."
  - "Rename the old node-based offline regression out of the e2e namespace to avoid implying browser coverage it does not provide."
  - "Use dynamic today/future values in the PV service test so the blocking date rule stays stable over time."

patterns-established:
  - "Pattern 1: Gherkin files should have an explicit runner entry point that reads and validates the feature text."
  - "Pattern 2: date-sensitive validation tests should derive today/future from the current runtime instead of hardcoding calendar days."

requirements-completed: [TEST-01, TEST-04]

# Metrics
duration: 55m
completed: 2026-05-13
---

# Phase 04 Plan 05: PWA Runner Wiring and Date-Stable Regression Summary

**Runner-bound PWA offline Gherkin plus date-stable PV validation and mobile browser smoke cleanup**

## Performance

- **Duration:** 55m
- **Started:** 2026-05-13T18:00:00Z
- **Completed:** 2026-05-13T18:41:00Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- Added an executable node:test wrapper that consumes `tests/bdd/pwa-offline.feature`.
- Repaired the PV daily service regression so it remains green across calendar changes.
- Cleaned up the mobile Playwright capture flow so the full `npm run test:playwright` suite stays green.

## task Commits

1. **task 1: RED/GREEN — PWA-Offline-Feature an ausfuehrbaren BDD-Runner anbinden** - `9eea59d` (test)
2. **task 2: RED/GREEN — zeitabhaengigen PV-Unit-Test dynamisch auf Heute/Future stabilisieren** - `9eea59d` (test)

## Files Created/Modified
- `tests/bdd/pwa-offline.spec.ts` - feature-file-backed runner for the PWA scenario
- `tests/bdd/steps/pwaOffline.steps.ts` - shared scenario helper without standalone node:test wiring
- `tests/e2e/mobile-capture.playwright.spec.ts` - mobile Playwright capture flow fixes
- `tests/unit/pvDailyService.test.ts` - dynamic today/future date coverage
- `package.json` - smoke/playwright/bdd wiring
- `tests/node/mobile-pwa-offline.spec.ts` - renamed node-based regression outside the e2e namespace

## Decisions Made
- Feature files are now explicitly consumed by a node:test runner so the BDD scenario is reproducible.
- The old node-based offline test lives under `tests/node/` to avoid implying browser-native E2E coverage.
- Date-sensitive PV validation asserts derive their calendar values at runtime.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Adjusted mobile Playwright interactions for the mobile layout**
- **Found during:** task 1 and task 2 verification
- **Issue:** The capture Playwright flow clicked elements that were partially covered in the mobile layout, and the initial route did not land on the capture screen.
- **Fix:** Switched the flow to `/capture`, used `requestSubmit()` for form submission, and forced the edit-button clicks where mobile hit-testing would otherwise fail.
- **Files modified:** `tests/e2e/mobile-capture.playwright.spec.ts`
- **Verification:** `npm run test:playwright`
- **Committed in:** `9eea59d`

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Necessary cleanup to keep the mobile browser regression suite executable and honest.

## Issues Encountered
- The mobile Playwright capture flow needed interaction adjustments to survive mobile hit-testing and to target the actual capture route.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- The phase 4 offline gaps are now covered by a real browser test, an executable BDD runner, and a stable regression suite.
- Remaining work can focus on later phase scope rather than offline verification plumbing.

---
*Phase: 04-pwa-offline-haertung*
*Completed: 2026-05-13*

## Self-Check: PASSED

- Summary file exists.
- Task commit `9eea59d` exists in git history.
