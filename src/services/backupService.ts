import type Dexie from 'dexie';
import type { BalkonBilanzDb } from '../db/database.ts';
import type { AppSettingsRecord, TariffPeriodRecord } from '../domain/settings/settingsTypes.ts';
import type { MeterReadingRecord, PvDailyRecord } from '../domain/types.ts';

export const BACKUP_SCHEMA_VERSION = 1 as const;

export interface BackupPayload {
  schemaVersion: number;
  exportedAt: string;
  appSettings: AppSettingsRecord[];
  tariffPeriods: TariffPeriodRecord[];
  meterReadings: MeterReadingRecord[];
  pvDailyEntries: PvDailyRecord[];
}

export interface BackupPreview {
  schemaVersion: number;
  exportedAt: string;
  counts: {
    appSettings: number;
    tariffPeriods: number;
    meterReadings: number;
    pvDailyEntries: number;
  };
}

export type BackupFailureKind = 'invalid-json' | 'schema-mismatch' | 'invalid-backup';

export interface BackupFailure {
  ok: false;
  kind: BackupFailureKind;
  message: string;
}

export interface BackupSuccess<T> {
  ok: true;
  value: T;
}

export type BackupServiceResult<T> = BackupSuccess<T> | BackupFailure;

export interface BackupService {
  exportBackup(): Promise<string>;
  previewBackup(serialized: string): Promise<BackupServiceResult<BackupPreview>>;
  restoreBackup(serialized: string): Promise<BackupServiceResult<{ restored: true }>>;
}

type BackupTableName = 'appSettings' | 'tariffPeriods' | 'meterReadings' | 'pvDailyEntries';

function failure(kind: BackupFailureKind, message: string): BackupFailure {
  return { ok: false, kind, message };
}

function success<T>(value: T): BackupSuccess<T> {
  return { ok: true, value };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isStringOrNull(value: unknown): value is string | null {
  return value === null || typeof value === 'string';
}

function assertArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

function parsePayload(serialized: string): BackupServiceResult<BackupPayload> {
  let raw: unknown;

  try {
    raw = JSON.parse(serialized) as unknown;
  } catch {
    return failure('invalid-json', 'Diese Datei ist kein gültiges BalkonBilanz-Backup. Deine aktuellen Daten bleiben unverändert.');
  }

  if (!isRecord(raw) || raw.schemaVersion !== BACKUP_SCHEMA_VERSION) {
    return failure('schema-mismatch', 'Diese Datei ist kein gültiges BalkonBilanz-Backup. Deine aktuellen Daten bleiben unverändert.');
  }

  const collections: Array<[keyof BackupPayload, BackupTableName]> = [
    ['appSettings', 'appSettings'],
    ['tariffPeriods', 'tariffPeriods'],
    ['meterReadings', 'meterReadings'],
    ['pvDailyEntries', 'pvDailyEntries'],
  ];

  for (const [key] of collections) {
    if (!assertArray(raw[key])) {
      return failure('invalid-backup', 'Diese Datei ist kein gültiges BalkonBilanz-Backup. Deine aktuellen Daten bleiben unverändert.');
    }
  }

  if (!isString(raw.exportedAt)) {
    return failure('invalid-backup', 'Diese Datei ist kein gültiges BalkonBilanz-Backup. Deine aktuellen Daten bleiben unverändert.');
  }

  return success({
    schemaVersion: raw.schemaVersion,
    exportedAt: raw.exportedAt,
    appSettings: raw.appSettings as AppSettingsRecord[],
    tariffPeriods: raw.tariffPeriods as TariffPeriodRecord[],
    meterReadings: raw.meterReadings as MeterReadingRecord[],
    pvDailyEntries: raw.pvDailyEntries as PvDailyRecord[],
  });
}

function isAppSettingsRecord(value: unknown): value is AppSettingsRecord {
  return isRecord(value)
    && isNumber(value.electricityPriceEurPerKwh)
    && isNumber(value.feedInTariffEurPerKwh)
    && isString(value.qualityMode)
    && isString(value.createdAt)
    && isString(value.updatedAt);
}

function isTariffPeriodRecord(value: unknown): value is TariffPeriodRecord {
  return isRecord(value)
    && isString(value.startsOn)
    && isStringOrNull(value.endsOn)
    && isNumber(value.electricityPriceEurPerKwh)
    && isString(value.createdAt)
    && isString(value.updatedAt);
}

function isMeterReadingRecord(value: unknown): value is MeterReadingRecord {
  return isRecord(value)
    && isString(value.timestamp)
    && isNumber(value.obis180Kwh)
    && isNumber(value.obis280Kwh)
    && isString(value.createdAt)
    && isString(value.updatedAt);
}

function isPvDailyRecord(value: unknown): value is PvDailyRecord {
  return isRecord(value)
    && isString(value.day)
    && isNumber(value.generationKwh)
    && isString(value.source)
    && isString(value.createdAt)
    && isString(value.updatedAt);
}

function validateRecords(payload: BackupPayload): BackupServiceResult<BackupPayload> {
  if (!payload.appSettings.every(isAppSettingsRecord)
    || !payload.tariffPeriods.every(isTariffPeriodRecord)
    || !payload.meterReadings.every(isMeterReadingRecord)
    || !payload.pvDailyEntries.every(isPvDailyRecord)) {
    return failure('invalid-backup', 'Diese Datei ist kein gültiges BalkonBilanz-Backup. Deine aktuellen Daten bleiben unverändert.');
  }

  return success(payload);
}

function getCount(value: unknown[]): number {
  return value.length;
}

export function createBackupService(db: BalkonBilanzDb): BackupService {
  return {
    async exportBackup() {
      const payload: BackupPayload = {
        schemaVersion: BACKUP_SCHEMA_VERSION,
        exportedAt: new Date().toISOString(),
        appSettings: await db.appSettings.toArray(),
        tariffPeriods: await db.tariffPeriods.toArray(),
        meterReadings: await db.meterReadings.toArray(),
        pvDailyEntries: await db.pvDailyEntries.toArray(),
      };

      return JSON.stringify(payload, null, 2);
    },

    async previewBackup(serialized) {
      const parsed = parsePayload(serialized);
      if (!parsed.ok) {
        return parsed;
      }

      const validated = validateRecords(parsed.value);
      if (!validated.ok) {
        return validated;
      }

      return success({
        schemaVersion: validated.value.schemaVersion,
        exportedAt: validated.value.exportedAt,
        counts: {
          appSettings: getCount(validated.value.appSettings),
          tariffPeriods: getCount(validated.value.tariffPeriods),
          meterReadings: getCount(validated.value.meterReadings),
          pvDailyEntries: getCount(validated.value.pvDailyEntries),
        },
      });
    },

    async restoreBackup(serialized) {
      const parsed = parsePayload(serialized);
      if (!parsed.ok) {
        return parsed;
      }

      const validated = validateRecords(parsed.value);
      if (!validated.ok) {
        return validated;
      }

      await db.transaction('rw', db.appSettings, db.tariffPeriods, db.meterReadings, db.pvDailyEntries, async () => {
        await db.appSettings.clear();
        await db.tariffPeriods.clear();
        await db.meterReadings.clear();
        await db.pvDailyEntries.clear();

        if (validated.value.appSettings.length > 0) {
          await db.appSettings.bulkAdd(validated.value.appSettings);
        }

        if (validated.value.tariffPeriods.length > 0) {
          await db.tariffPeriods.bulkAdd(validated.value.tariffPeriods);
        }

        if (validated.value.meterReadings.length > 0) {
          await db.meterReadings.bulkAdd(validated.value.meterReadings);
        }

        if (validated.value.pvDailyEntries.length > 0) {
          await db.pvDailyEntries.bulkAdd(validated.value.pvDailyEntries);
        }
      });

      return success({ restored: true });
    },
  };
}
