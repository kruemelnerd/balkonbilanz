import type { AppSettingsRecord, TariffPeriodRecord } from '../settings/types.ts';
import type { MeterReadingRecord, PvDailyRecord } from '../types.ts';

export const BACKUP_SCHEMA_VERSION = 1 as const;

export interface BackupCounts {
  meterReadings: number;
  pvDailyEntries: number;
  tariffPeriods: number;
}

export interface BackupPayload {
  schemaVersion: typeof BACKUP_SCHEMA_VERSION;
  exportedAt: string;
  settings: AppSettingsRecord;
  meterReadings: MeterReadingRecord[];
  pvDailyEntries: PvDailyRecord[];
  tariffPeriods: TariffPeriodRecord[];
}

export interface BackupPreview extends BackupCounts {
  schemaVersion: typeof BACKUP_SCHEMA_VERSION;
  exportedAt: string;
  settingsIncluded: boolean;
}

export interface BackupValidationIssue {
  code: 'invalid_schema' | 'invalid_payload' | 'confirmation_required';
  field: 'schemaVersion' | 'exportedAt' | 'payload' | 'confirmation';
  message: string;
}

export interface BackupExportResult {
  ok: true;
  value: BackupPayload;
}

export interface BackupPreviewResult {
  ok: true;
  value: BackupPreview;
}

export interface BackupRestoreSuccess {
  ok: true;
  value: { restored: true };
}

export interface BackupRestoreFailure {
  ok: false;
  kind: 'validation' | 'confirmation-required';
  issues: BackupValidationIssue[];
}

export type BackupRestoreResult = BackupRestoreSuccess | BackupRestoreFailure;
