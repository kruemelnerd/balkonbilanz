import type { AppSettingsDraftInput, AppSettingsRecord, TariffPeriodDraftInput, TariffPeriodRecord } from '../domain/settings/settingsTypes.ts';
import { sortTariffPeriodsNewestFirst } from '../domain/settings/tariffPeriods.ts';
import type { RecordTable } from './meterReadingsRepository.ts';

export interface SettingsRepository {
  loadSettings(): Promise<AppSettingsRecord | undefined>;
  saveSettings(record: AppSettingsRecord): Promise<AppSettingsRecord>;
  listTariffPeriods(): Promise<TariffPeriodRecord[]>;
  getTariffPeriod(id: number): Promise<TariffPeriodRecord | undefined>;
  saveTariffPeriod(record: TariffPeriodRecord): Promise<TariffPeriodRecord>;
  deleteTariffPeriod(id: number): Promise<boolean>;
}

export interface SettingsRepositoryTables {
  appSettings: RecordTable<AppSettingsRecord>;
  tariffPeriods: RecordTable<TariffPeriodRecord>;
}

export function createSettingsRepository(tables: SettingsRepositoryTables): SettingsRepository {
  return {
    loadSettings() {
      return tables.appSettings.toArray().then((rows) => rows[0]);
    },

    saveSettings(record) {
      return tables.appSettings.put(record).then(() => record);
    },

    async listTariffPeriods() {
      return sortTariffPeriodsNewestFirst(await tables.tariffPeriods.toArray());
    },

    getTariffPeriod(id) {
      return tables.tariffPeriods.get(id);
    },

    async saveTariffPeriod(record) {
      await tables.tariffPeriods.put(record);
      return record;
    },

    deleteTariffPeriod(id) {
      return tables.tariffPeriods.delete(id).then(() => true);
    },
  };
}
