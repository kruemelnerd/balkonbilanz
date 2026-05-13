import assert from 'node:assert/strict';
import 'fake-indexeddb/auto';
import { randomUUID } from 'node:crypto';
import { test } from 'node:test';
import { createSettingsService } from '../../src/services/settingsService.ts';
import {
  DEFAULT_APP_SETTINGS,
  type AppSettingsRecord,
  type TariffPeriodRecord,
} from '../../src/domain/settings/settingsTypes.ts';
import type { SettingsRepository } from '../../src/repositories/settingsRepository.ts';
import { createSettingsRepository } from '../../src/repositories/settingsRepository.ts';
import { BalkonBilanzDb } from '../../src/db/database.ts';

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
