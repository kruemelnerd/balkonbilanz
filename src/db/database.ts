import Dexie, { type Table } from 'dexie';
import type { MeterReadingRecord, PvDailyRecord } from '../domain/types.ts';
import type { AppSettingsRecord, TariffPeriodRecord } from '../domain/settings/settingsTypes.ts';
import { DB_NAME, DB_VERSION, TABLE_NAMES, TABLE_SCHEMAS } from './schema.ts';
import { createMeterReadingsRepository, type RecordTable } from '../repositories/meterReadingsRepository.ts';
import { createPvDailyRepository } from '../repositories/pvDailyRepository.ts';
import { createSettingsRepository } from '../repositories/settingsRepository.ts';
import { createMeterReadingService } from '../services/meterReadingService.ts';
import { createPvDailyService } from '../services/pvDailyService.ts';
import { createCaptureStore, type CaptureStoreDependencies } from '../stores/captureStore.ts';

export class BalkonBilanzDb extends Dexie {
  meterReadings!: Table<MeterReadingRecord, number>;
  pvDailyEntries!: Table<PvDailyRecord, number>;
  appSettings!: Table<AppSettingsRecord, number>;
  tariffPeriods!: Table<TariffPeriodRecord, number>;

  constructor(name = DB_NAME) {
    super(name);

    this.on('versionchange', () => {
      this.close();
    });

    this.version(1).stores({
      meterReadings: TABLE_SCHEMAS.meterReadings,
      pvDailyEntries: TABLE_SCHEMAS.pvDailyEntries,
    });

    this.version(DB_VERSION).stores({
      meterReadings: TABLE_SCHEMAS.meterReadings,
      pvDailyEntries: TABLE_SCHEMAS.pvDailyEntries,
      appSettings: TABLE_SCHEMAS.appSettings,
      tariffPeriods: TABLE_SCHEMAS.tariffPeriods,
    });

    this.meterReadings = this.table(TABLE_NAMES.meterReadings) as Table<MeterReadingRecord, number>;
    this.pvDailyEntries = this.table(TABLE_NAMES.pvDailyEntries) as Table<PvDailyRecord, number>;
    this.appSettings = this.table(TABLE_NAMES.appSettings) as Table<AppSettingsRecord, number>;
    this.tariffPeriods = this.table(TABLE_NAMES.tariffPeriods) as Table<TariffPeriodRecord, number>;
  }
}

function asRecordTable<T extends { id?: number }>(table: Table<T, number>): RecordTable<T> {
  return table as unknown as RecordTable<T>;
}

export function createBrowserCaptureDependencies(db = new BalkonBilanzDb()): CaptureStoreDependencies {
  const meterTable = asRecordTable<MeterReadingRecord>(db.meterReadings);
  const pvTable = asRecordTable<PvDailyRecord>(db.pvDailyEntries);

  const meterRepository = createMeterReadingsRepository(meterTable);
  const pvRepository = createPvDailyRepository(pvTable);

  return {
    meterRepository,
    meterService: createMeterReadingService(meterRepository),
    pvRepository,
    pvService: createPvDailyService(pvRepository),
  };
}

export function createBrowserAnalysisDependencies(db = new BalkonBilanzDb()) {
  const meterTable = asRecordTable<MeterReadingRecord>(db.meterReadings);
  const pvTable = asRecordTable<PvDailyRecord>(db.pvDailyEntries);

  return {
    meterRepository: createMeterReadingsRepository(meterTable),
    pvRepository: createPvDailyRepository(pvTable),
    settingsRepository: createSettingsRepository({
      appSettings: db.appSettings,
      tariffPeriods: db.tariffPeriods,
    }),
  };
}

export function createBrowserCaptureStore(db = new BalkonBilanzDb()) {
  return createCaptureStore(createBrowserCaptureDependencies(db));
}

export function createBrowserSettingsDependencies(db = new BalkonBilanzDb()) {
  return {
    settingsRepository: createSettingsRepository({
      appSettings: db.appSettings,
      tariffPeriods: db.tariffPeriods,
    }),
  };
}
