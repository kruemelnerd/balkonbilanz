import type { MeterReadingRecord, PvDailyRecord } from '../domain/types';
import type { AppSettingsRecord, SettingsTableRecord, TariffPeriodRecord } from '../domain/settings/types.ts';

export const DB_NAME = 'balkonbilanz';
export const DB_VERSION = 2 as const;

export const TABLE_NAMES = {
  meterReadings: 'meterReadings',
  pvDailyEntries: 'pvDailyEntries',
  settings: 'settings',
  tariffPeriods: 'tariffPeriods',
} as const;

export const TABLE_SCHEMAS = {
  meterReadings: '++id, &timestamp',
  pvDailyEntries: '++id, &day',
  settings: '&key',
  tariffPeriods: '++id, &startDay',
} as const;

export interface DatabaseShape {
  meterReadings: MeterReadingRecord;
  pvDailyEntries: PvDailyRecord;
  settings: SettingsTableRecord;
  tariffPeriods: TariffPeriodRecord;
}

export type DatabaseTables = keyof DatabaseShape;
