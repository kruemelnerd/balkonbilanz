import { BalkonBilanzDb } from '../db/database.ts';
import { BACKUP_SCHEMA_VERSION, type BackupExportResult, type BackupPayload, type BackupPreviewResult, type BackupRestoreResult, type BackupValidationIssue } from '../domain/backup/backupSchema.ts';
import { DEFAULT_APP_SETTINGS, type SettingsTableRecord } from '../domain/settings/types.ts';

export interface BackupService {
  exportBackup(): Promise<BackupExportResult>;
  previewImport(payload: unknown): Promise<BackupPreviewResult | BackupRestoreResult>;
  restoreBackup(payload: unknown, options?: { confirmed?: boolean }): Promise<BackupRestoreResult>;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function validatePayload(payload: unknown): { ok: true; value: BackupPayload } | { ok: false; issues: BackupValidationIssue[] } {
  const issues: BackupValidationIssue[] = [];

  if (!isObject(payload)) {
    return {
      ok: false,
      issues: [{ code: 'invalid_payload', field: 'payload', message: 'Backup-Daten müssen ein Objekt sein.' }],
    };
  }

  if (payload.schemaVersion !== BACKUP_SCHEMA_VERSION) {
    issues.push({
      code: 'invalid_schema',
      field: 'schemaVersion',
      message: 'Die Backup-Schema-Version wird nicht unterstützt.',
    });
  }

  if (typeof payload.exportedAt !== 'string' || Number.isNaN(Date.parse(payload.exportedAt))) {
    issues.push({
      code: 'invalid_payload',
      field: 'exportedAt',
      message: 'Der Exportzeitstempel fehlt oder ist ungültig.',
    });
  }

  if (!isObject(payload.settings) || typeof payload.settings.strompreisEurPerKwh !== 'number' || typeof payload.settings.einspeiseverguetungEurPerKwh !== 'number' || typeof payload.settings.qualityMode !== 'string') {
    issues.push({
      code: 'invalid_payload',
      field: 'payload',
      message: 'Die Einstellungen fehlen oder haben das falsche Format.',
    });
  }

  for (const field of ['meterReadings', 'pvDailyEntries', 'tariffPeriods'] as const) {
    if (!Array.isArray(payload[field])) {
      issues.push({
        code: 'invalid_payload',
        field: 'payload',
        message: `Die Liste ${field} fehlt oder ist ungültig.`,
      });
    }
  }

  if (issues.length > 0) {
    return { ok: false, issues };
  }

  return { ok: true, value: payload as BackupPayload };
}

function toSettingsRecord(settings: BackupPayload['settings']): SettingsTableRecord {
  return {
    key: 'current',
    ...settings,
  };
}

export function createBackupService(db = new BalkonBilanzDb()): BackupService {
  return {
    async exportBackup() {
      const settingsRecord = await db.settings.get('current');
      const settings = settingsRecord ? (({ key, ...rest }) => rest)(settingsRecord) : { ...DEFAULT_APP_SETTINGS };

      return {
        ok: true,
        value: {
          schemaVersion: BACKUP_SCHEMA_VERSION,
          exportedAt: new Date().toISOString(),
          settings,
          meterReadings: await db.meterReadings.toArray(),
          pvDailyEntries: await db.pvDailyEntries.toArray(),
          tariffPeriods: await db.tariffPeriods.toArray(),
        },
      };
    },

    async previewImport(payload) {
      const validation = validatePayload(payload);
      if (!validation.ok) {
        return { ok: false, kind: 'validation', issues: validation.issues };
      }

      return {
        ok: true,
        value: {
          schemaVersion: validation.value.schemaVersion,
          exportedAt: validation.value.exportedAt,
          meterReadings: validation.value.meterReadings.length,
          pvDailyEntries: validation.value.pvDailyEntries.length,
          tariffPeriods: validation.value.tariffPeriods.length,
          settingsIncluded: true,
        },
      };
    },

    async restoreBackup(payload, options = {}) {
      if (!options.confirmed) {
        return {
          ok: false,
          kind: 'confirmation-required',
          issues: [{ code: 'confirmation_required', field: 'confirmation', message: 'Der vollständige Restore muss bestätigt werden.' }],
        };
      }

      const validation = validatePayload(payload);
      if (!validation.ok) {
        return { ok: false, kind: 'validation', issues: validation.issues };
      }

      await db.transaction('rw', db.settings, db.meterReadings, db.pvDailyEntries, db.tariffPeriods, async () => {
        await db.settings.clear();
        await db.settings.put(toSettingsRecord(validation.value.settings));

        await db.meterReadings.clear();
        await db.meterReadings.bulkPut(validation.value.meterReadings);

        await db.pvDailyEntries.clear();
        await db.pvDailyEntries.bulkPut(validation.value.pvDailyEntries);

        await db.tariffPeriods.clear();
        await db.tariffPeriods.bulkPut(validation.value.tariffPeriods);
      });

      return { ok: true, value: { restored: true } };
    },
  };
}
