---
phase: 03-einstellungen-backup-speicherberater
plan: 04
type: execute
tags: [settings, backup, storage-advisor, vue, indexeddb]
key-files:
  - src/domain/settings/settingsTypes.ts
  - src/domain/settings/tariffPeriods.ts
  - src/repositories/settingsRepository.ts
  - src/services/settingsService.ts
  - src/services/backupService.ts
  - src/domain/battery/batteryAdvisorTypes.ts
  - src/services/batteryAdvisorService.ts
  - src/features/settings/SettingsView.vue
  - src/features/settings/BatteryAdvisorCard.vue
  - src/router/index.ts
  - src/features/shell/AppShellNav.vue
  - tests/unit/settingsService.test.ts
  - tests/unit/tariffPeriods.test.ts
  - tests/unit/backupService.test.ts
  - tests/unit/batteryAdvisorService.test.ts
  - tests/component/settingsView.test.ts
  - tests/component/batteryAdvisorCard.test.ts
  - tests/bdd/steps/settingsBackupAdvisor.steps.ts
  - tests/e2e/mobile-settings-battery.spec.ts
decisions:
  - Use local Dexie tables for app settings and tariff history.
  - Keep backup restore fail-closed with schema validation before mutation.
  - Drive storage-advisor savings from analysis outputs plus user inputs.
metrics:
  tasks: 8
  commits: 4
---

# Phase 3 Plan 4: Einstellungen, Backup & Speicherberater Summary

Phase 3 now provides persistent settings/tariff storage, schema-versioned backup export/restore, and a storage advisor that reacts to analysis basis and live settings.

## Completed Work

- Settings defaults, tariff validation, repository, and Dexie wiring
- Transactional backup export/preview/restore with schema checks
- Four-scenario storage advisor with poor-quality warning
- `/settings` UI, bottom-nav entry, component tests, BDD smoke, and mobile flow smoke

## Deviations from Plan

None.

## Commits

- `9b0d449` feat(03-01): add settings defaults and tariff validation
- `5620f24` feat(03-01): wire settings tables into Dexie
- `846e654` feat(03-02): add transactional backup export and restore
- `6df7053` feat(03-03): add storage advisor scenarios
