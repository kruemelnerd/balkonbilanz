---
phase: 03-einstellungen-backup-speicherberater
plan: 08
subsystem: ui
tags: [vue, battery-advisor, analysis, testing, reactive-watch]

# Dependency graph
requires:
  - phase: 02-analyse-dashboard-datenqualitaet
    provides: analysisStore combined/quality outputs for advisor context
  - phase: 03-einstellungen-backup-speicherberater
    provides: settings, backup and advisor shell wiring from earlier phase 3 plans
provides:
  - analysis-output-based battery savings and break-even calculations
  - reactive advisor snapshot refresh after settings save
  - snapshot-driven card recalculation on prop updates
  - regression coverage for live mobile settings flow
affects: [phase-04-pwa-offlinebetrieb, settings-ui, regression-tests]

# Tech tracking
tech-stack:
  added: [Vue watch reactivity, analysis-basis KPI input, fake-indexeddb-backed mobile regression]
  patterns: [snapshot refresh after persistence, prop-driven recalculation, analysis-output capping of financial estimates]

key-files:
  created: []
  modified: [src/services/batteryAdvisorService.ts, src/features/settings/SettingsView.vue, src/features/settings/BatteryAdvisorCard.vue, tests/support/vueHarness.ts, tests/unit/batteryAdvisorService.test.ts, tests/component/batteryAdvisorCard.test.ts, tests/e2e/mobile-settings-battery.spec.ts]

key-decisions:
  - "Use the analysis export total as the advisor basis and cap annual savings against real analysis output instead of relying only on analysis-period length."
  - "Refresh the advisor snapshot immediately after settings save so persisted prices affect the next calculation without a remount."
  - "Make the advisor card watch its snapshot prop and recalculate reactively instead of only hydrating once on mount."

patterns-established:
  - "Pattern 1: analysis-driven financial estimates stay tied to store outputs and remain conservative when analysis data is sparse."
  - "Pattern 2: mounted settings cards should react to parent snapshot changes through watch-based sync, not one-time initialization."
  - "Pattern 3: mobile regression tests may seed fake-indexeddb data to prove live persistence flows."

requirements-completed: [SET-02, BATT-03]

# Metrics
duration: 24m
completed: 2026-05-13
---

# Phase 03: Einstellungen, Backup & Speicherberater Summary

**Speicherberater kalkuliert jetzt auf Basis des aktuellen Analyseexports und aktualisiert Szenarien sofort nach dem Speichern von Einstellungen.**

## Performance

- **Duration:** 24m
- **Started:** 2026-05-13T08:40:00Z
- **Completed:** 2026-05-13T09:04:27Z
- **Tasks:** 3
- **Files modified:** 7

## Accomplishments
- Battery advisor now uses an analysis-derived energy basis when available and caps scenario savings against that real-data window.
- Settings view rebuilds the advisor snapshot after save, so saved electricity prices flow into the next calculation without a remount.
- Battery advisor card now watches snapshot prop changes and re-runs calculations reactively; mobile regression coverage proves the live refresh path.

## task Commits

1. **task 1: RED — echte Analysebasis und Context-Refresh als failing Regression abbilden** - `d935cc2` (test)
2. **task 2: GREEN — Advisor-Rechenkern auf Analyse-Outputs umstellen und Snapshot reaktiv refreshen** - `562ddfa` (fix)
3. **task 3: Regression matrix fuer Gap-Closure abschliessen** - verified via `node --test tests/unit/batteryAdvisorService.test.ts tests/component/batteryAdvisorCard.test.ts tests/e2e/mobile-settings-battery.spec.ts` (no new diff)

## Files Created/Modified
- `src/services/batteryAdvisorService.ts` - analysis-basis input and savings capping
- `src/features/settings/SettingsView.vue` - rebuilds advisor snapshot after save/load
- `src/features/settings/BatteryAdvisorCard.vue` - watches snapshot prop and recalculates reactively
- `tests/support/vueHarness.ts` - exposes reactive props for snapshot-change assertions
- `tests/unit/batteryAdvisorService.test.ts` - regression for analysis-basis sensitivity
- `tests/component/batteryAdvisorCard.test.ts` - regression for prop-driven refresh
- `tests/e2e/mobile-settings-battery.spec.ts` - seeded mobile flow proving save-triggered refresh

## Decisions Made
- Analysis export totals are the advisor basis; the service stays conservative by capping annual savings to real available analysis energy.
- The settings shell remains the owner of advisor context assembly so saved prices and fresh analysis results stay in sync.
- Mobile regression tests seed fake-indexeddb data to prove the live refresh path instead of relying on empty-browser defaults.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Phase 3 gap is closed: the advisor is no longer hollow/generic and refreshes from persisted settings.
- Ready for phase 4 planning/execution with the battery advisor regression matrix in place.

## Self-Check: PASSED

- Summary file found on disk.
- Task commits `d935cc2` and `562ddfa` found in git history.

---
*Phase: 03-einstellungen-backup-speicherberater*
*Completed: 2026-05-13*
