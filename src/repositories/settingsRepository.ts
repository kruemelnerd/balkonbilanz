import type { Table } from 'dexie';
import { DEFAULT_APP_SETTINGS, type AppSettingsRecord, type SettingsTableRecord, type TariffPeriodRecord } from '../domain/settings/types.ts';
import { sortTariffPeriods } from '../domain/settings/tariffPeriods.ts';

export interface SettingsRepository {
  load(): Promise<AppSettingsRecord>;
  save(input: AppSettingsRecord): Promise<AppSettingsRecord>;
}

export interface TariffPeriodsRepository {
  list(): Promise<TariffPeriodRecord[]>;
  get(id: number): Promise<TariffPeriodRecord | undefined>;
  save(input: TariffPeriodRecord): Promise<TariffPeriodRecord>;
  delete(id: number): Promise<boolean>;
}

export interface SettingsRepositoryDependencies {
  settings: Table<SettingsTableRecord, 'current'>;
  tariffPeriods: Table<TariffPeriodRecord, number>;
}

export function createSettingsRepository(settingsTable: Table<SettingsTableRecord, 'current'>): SettingsRepository {
  return {
    async load() {
      const record = await settingsTable.get('current');
      if (!record) {
        return { ...DEFAULT_APP_SETTINGS };
      }

      const { key, updatedAt, ...settings } = record;
      return settings;
    },

    async save(input) {
      const record: SettingsTableRecord = { key: 'current', ...input, updatedAt: new Date().toISOString() };
      await settingsTable.put(record);
      return input;
    },
  };
}

export function createTariffPeriodsRepository(tariffPeriodsTable: Table<TariffPeriodRecord, number>): TariffPeriodsRepository {
  return {
    async list() {
      return sortTariffPeriods(await tariffPeriodsTable.toArray());
    },

    get(id) {
      return tariffPeriodsTable.get(id);
    },

    async save(input) {
      const now = new Date().toISOString();
      const existing = input.id ? await tariffPeriodsTable.get(input.id) : undefined;
      const record: TariffPeriodRecord = {
        ...input,
        id: input.id,
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
      };

      if (record.id) {
        await tariffPeriodsTable.put(record);
        return record;
      }

      const id = await tariffPeriodsTable.add(record);
      return { ...record, id };
    },

    async delete(id) {
      const existing = await tariffPeriodsTable.get(id);
      if (!existing) {
        return false;
      }

      await tariffPeriodsTable.delete(id);
      return true;
    },
  };
}
