import type { MeterReadingRecord, PvDailyRecord } from '../domain/types.ts';
import type { AppSettingsRecord, TariffPeriodRecord } from '../domain/settings/settingsTypes.ts';

export const DB_NAME = 'balkonbilanz';
export const DB_VERSION = 2 as const;

export const TABLE_NAMES = {
  meterReadings: 'meterReadings',
  pvDailyEntries: 'pvDailyEntries',
  appSettings: 'appSettings',
  tariffPeriods: 'tariffPeriods',
} as const;

export const TABLE_SCHEMAS = {
  meterReadings: '++id, &timestamp',
  pvDailyEntries: '++id, &day',
  appSettings: '++id',
  tariffPeriods: '++id, &startsOn',
} as const;

export interface DatabaseShape {
  meterReadings: MeterReadingRecord;
  pvDailyEntries: PvDailyRecord;
  appSettings: AppSettingsRecord;
  tariffPeriods: TariffPeriodRecord;
}

export type DatabaseTables = keyof DatabaseShape;
