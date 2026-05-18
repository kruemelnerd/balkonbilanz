---
phase: 03-einstellungen-backup-speicherberater
plan: 05
subsystem: settings-battery-ui
tags: [battery-advisor, settings-card, e2e, mobile-regression]
requires: [BATT-01, BATT-02, BATT-03, BATT-04]
provides: [battery-advisor-card, mobile-smoke, poor-quality-warning-ui]
affects: [src/features/settings/BatteryAdvisorCard.vue, src/features/settings/SettingsView.vue, tests/component/batteryAdvisorCard.test.ts, tests/bdd/settings-battery.feature, tests/bdd/steps/settingsBattery.steps.ts, tests/e2e/mobile-settings-battery.spec.ts]
key-files: [src/features/settings/BatteryAdvisorCard.vue, src/features/settings/SettingsView.vue, tests/component/batteryAdvisorCard.test.ts, tests/e2e/mobile-settings-battery.spec.ts]
decisions: [live-recalculate-on-click, warning-above-scenario-cards]
metrics:
  duration: unknown
  completed: 2026-05-13
---

# Phase 03 Plan 05: Speicherberater-UI & Mobile-Regression Summary

Der Speicherberater ist als eigene Karte in den Einstellungen nutzbar und per Mobile-Smoke abgesichert.

## Tasks
- BatteryAdvisorCard mit fixer Szenario-Reihenfolge, Recalc-CTA und Poor-Quality-Warnung gebaut.
- Mobile E2E-Fluss bis zur Warnanzeige ergänzt.

## Commits
- c3ea74f: failing battery advisor UI specs
- a4deab4: battery advisor card in settings
- b6f85fe: mobile settings battery regression

## Deviations from Plan
None.

## Self-Check: PASSED
