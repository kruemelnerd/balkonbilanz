---
phase: 03-einstellungen-backup-speicherberater
plan: 02
subsystem: backup
tags: [backup, restore, schema, dexie, tdd]
requires: [BKP-01, BKP-02, BKP-03]
provides: [schema-versioned-backup, preview-gate, atomic-restore]
affects: [src/domain/backup/backupSchema.ts, src/services/backupService.ts, tests/unit/backupService.test.ts, tests/bdd/backup-restore.feature, tests/bdd/steps/backupRestore.steps.ts]
key-files: [src/domain/backup/backupSchema.ts, src/services/backupService.ts, tests/unit/backupService.test.ts, tests/bdd/steps/backupRestore.steps.ts]
decisions: [restore-requires-confirmation, invalid-backup-never-mutates-data]
metrics:
  duration: unknown
  completed: 2026-05-13
---

# Phase 03 Plan 02: Backup & Restore Summary

Lokales, versioniertes JSON-Backup mit Vorschau und atomarem Full-Restore.

## Tasks
- Export liefert Schema-Version, Zeitstempel und alle lokalen Tabellen.
- Preview/Restore blockiert ohne Bestätigung und rejectet invalides JSON ohne Mutation.

## Commits
- 368fc36: local backup restore flow

## Deviations from Plan
None.

## Self-Check: PASSED
