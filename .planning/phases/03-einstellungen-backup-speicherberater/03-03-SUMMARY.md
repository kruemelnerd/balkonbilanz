---
phase: 03-einstellungen-backup-speicherberater
plan: 03
subsystem: battery-advisor
tags: [battery, scenarios, savings, break-even, tdd]
requires: [BATT-01, BATT-02, BATT-03, BATT-04]
provides: [scenario-ladder, savings-math, poor-quality-warning]
affects: [src/domain/batteryAdvisor/scenarios.ts, src/services/batteryAdvisorService.ts, tests/unit/batteryAdvisorService.test.ts, tests/bdd/battery-advisor.feature, tests/bdd/steps/batteryAdvisor.steps.ts]
key-files: [src/domain/batteryAdvisor/scenarios.ts, src/services/batteryAdvisorService.ts, tests/unit/batteryAdvisorService.test.ts, tests/bdd/steps/batteryAdvisor.steps.ts]
decisions: [fixed-order-scenarios, current-analysis-period-as-basis]
metrics:
  duration: unknown
  completed: 2026-05-13
---

# Phase 03 Plan 03: Speicherberater-Kernlogik Summary

Deterministische vierstufige Batterieszenarien mit Parameterwirkung und Warnung bei schlechter Datenqualität.

## Tasks
- Szenario-Reihenfolge und usable-share-Ladder testgetrieben abgesichert.
- Rechenservice erzeugt jährliche Einsparung, Break-even und klare Poor-Quality-Warnung.

## Commits
- c3ea74f: failing battery advisor UI specs
- a4deab4: battery advisor card in settings

## Deviations from Plan
None.

## Self-Check: PASSED
