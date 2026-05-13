import assert from 'node:assert/strict';
import 'fake-indexeddb/auto';
import { randomUUID } from 'node:crypto';
import { test } from 'node:test';
import Dexie from 'dexie';
import { createSettingsService } from '../../src/services/settingsService.ts';
import {
  DEFAULT_APP_SETTINGS,
  type AppSettingsRecord,
  type TariffPeriodRecord,
} from '../../src/domain/settings/settingsTypes.ts';
import type { SettingsRepository } from '../../src/repositories/settingsRepository.ts';
import { createSettingsRepository } from '../../src/repositories/settingsRepository.ts';
import { BalkonBilanzDb } from '../../src/db/database.ts';
import { TABLE_SCHEMAS } from '../../src/db/schema.ts';

function createRepositoryStub(initialSettings: AppSettingsRecord[] = []): SettingsRepository {
  const settingsRows = new Map<number, AppSettingsRecord>(initialSettings.map((record) => [record.id ?? 0, record]));
  const tariffRows = new Map<number, TariffPeriodRecord>();

  return {
    async loadSettings() {
      return [...settingsRows.values()][0];
    },
    async saveSettings(record) {
      const next = { ...record, id: record.id ?? 1 } as AppSettingsRecord;
      settingsRows.set(next.id ?? 1, next);
      return next;
    },
    async listTariffPeriods() {
      return [...tariffRows.values()];
    },
    async getTariffPeriod() {
      return undefined;
    },
    async saveTariffPeriod(record) {
      const next = { ...record, id: record.id ?? tariffRows.size + 1 } as TariffPeriodRecord;
      tariffRows.set(next.id ?? 0, next);
      return next;
    },
    async deleteTariffPeriod(id) {
      return tariffRows.delete(id);
    },
  };
}

test('loadSettings returns defaults when no settings exist yet', async () => {
  const service = createSettingsService(createRepositoryStub());

  const loaded = await service.loadSettings();

  assert.deepEqual(loaded, DEFAULT_APP_SETTINGS);
});

test('saveTariffPeriod persists a valid period into IndexedDB', async () => {
  const db = new BalkonBilanzDb(`settings-service-${randomUUID()}`);
  await db.open();

  try {
    const service = createSettingsService(
      createSettingsRepository({
        appSettings: db.table('appSettings') as any,
        tariffPeriods: db.table('tariffPeriods') as any,
      }),
    );

    const result = await service.saveTariffPeriod({
      startsOn: '2026-05-01',
      endsOn: null,
      electricityPriceEurPerKwh: 0.31,
    });

    assert.equal(result.ok, true);
    assert.equal((await service.listTariffPeriods()).length, 1);
  } finally {
    await db.delete();
  }
});

test('settings data remains accessible while a future app-version upgrade opens the same database', async () => {
  class FutureDb extends Dexie {
    constructor(name: string) {
      super(name);
      this.version(3).stores({
        meterReadings: TABLE_SCHEMAS.meterReadings,
        pvDailyEntries: TABLE_SCHEMAS.pvDailyEntries,
        appSettings: TABLE_SCHEMAS.appSettings,
        tariffPeriods: TABLE_SCHEMAS.tariffPeriods,
      });
    }
  }

  const dbName = `settings-upgrade-${randomUUID()}`;
  const currentDb = new BalkonBilanzDb(dbName);
  await currentDb.open();

  try {
    const service = createSettingsService(
      createSettingsRepository({
        appSettings: currentDb.table('appSettings') as any,
        tariffPeriods: currentDb.table('tariffPeriods') as any,
      }),
    );

    await service.saveSettings({
      electricityPriceEurPerKwh: 0.42,
      feedInTariffEurPerKwh: 0.13,
      qualityMode: 'strict',
    });

    await service.saveTariffPeriod({
      startsOn: '2026-05-01',
      endsOn: null,
      electricityPriceEurPerKwh: 0.44,
    });

    const futureDb = new FutureDb(dbName);
    const openResult = await Promise.race([
      futureDb.open().then(() => 'opened' as const),
      new Promise<'timeout'>((resolve) => setTimeout(() => resolve('timeout'), 250)),
    ]);

    assert.equal(openResult, 'opened');

    const futureService = createSettingsService(
      createSettingsRepository({
        appSettings: futureDb.table('appSettings') as any,
        tariffPeriods: futureDb.table('tariffPeriods') as any,
      }),
    );

    assert.equal((await futureService.loadSettings()).electricityPriceEurPerKwh, 0.42);
    assert.equal((await futureService.listTariffPeriods()).length, 1);

    await futureDb.delete();
  } finally {
    await currentDb.delete();
  }
});
