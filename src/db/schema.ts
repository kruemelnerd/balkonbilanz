import type { MeterReadingRecord, PvDailyRecord } from '../domain/types';

export const DB_NAME = 'balkonbilanz';
export const DB_VERSION = 1 as const;

export const TABLE_NAMES = {
  meterReadings: 'meterReadings',
  pvDailyEntries: 'pvDailyEntries',
} as const;

export const TABLE_SCHEMAS = {
  meterReadings: '++id, &timestamp',
  pvDailyEntries: '++id, &day',
} as const;

export interface DatabaseShape {
  meterReadings: MeterReadingRecord;
  pvDailyEntries: PvDailyRecord;
}

export type DatabaseTables = keyof DatabaseShape;
