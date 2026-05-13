import assert from 'node:assert/strict';
import 'fake-indexeddb/auto';
import { randomUUID } from 'node:crypto';
import { test } from 'node:test';
import { BalkonBilanzDb } from '../../src/db/database.ts';
import { createBackupService } from '../../src/services/backupService.ts';
import { DEFAULT_APP_SETTINGS } from '../../src/domain/settings/settingsTypes.ts';
import { asMeterTimestamp, asPvDay } from '../../src/domain/types.ts';

test('backup export contains schema metadata and all collections', async () => {
  const db = new BalkonBilanzDb(`backup-export-${randomUUID()}`);
  await db.open();

  try {
    await db.appSettings.put(DEFAULT_APP_SETTINGS);
    await db.tariffPeriods.put({
      id: 1,
      createdAt: '2026-05-01T00:00:00.000Z',
      updatedAt: '2026-05-01T00:00:00.000Z',
      startsOn: '2026-05-01',
      endsOn: null,
      electricityPriceEurPerKwh: 0.31,
    });
    await db.meterReadings.put({
      id: 1,
      createdAt: '2026-05-10T00:00:00.000Z',
      updatedAt: '2026-05-10T00:00:00.000Z',
      timestamp: asMeterTimestamp('2026-05-10T07:00:00.000Z'),
      obis180Kwh: 1200,
      obis280Kwh: 50,
    });
    await db.pvDailyEntries.put({
      id: 1,
      createdAt: '2026-05-10T00:00:00.000Z',
      updatedAt: '2026-05-10T00:00:00.000Z',
      day: asPvDay('2026-05-10'),
      generationKwh: 3.2,
      source: 'manual',
    });

    const service = createBackupService(db);
    const exported = JSON.parse(await service.exportBackup());

    assert.equal(exported.schemaVersion, 1);
    assert.ok(exported.exportedAt);
    assert.equal(exported.appSettings.length, 1);
    assert.equal(exported.tariffPeriods.length, 1);
    assert.equal(exported.meterReadings.length, 1);
    assert.equal(exported.pvDailyEntries.length, 1);
  } finally {
    await db.delete();
  }
});

test('backup preview returns counts and rejects malformed JSON', async () => {
  const db = new BalkonBilanzDb(`backup-preview-${randomUUID()}`);
  await db.open();

  try {
    const service = createBackupService(db);

    const invalid = await service.previewBackup('{ not-json');
    assert.equal(invalid.ok, false);

    const valid = await service.previewBackup(JSON.stringify({
      schemaVersion: 1,
      exportedAt: '2026-05-13T00:00:00.000Z',
      appSettings: [DEFAULT_APP_SETTINGS],
      tariffPeriods: [],
      meterReadings: [],
      pvDailyEntries: [],
    }));

    assert.equal(valid.ok, true);
    assert.equal(valid.value.counts.appSettings, 1);
  } finally {
    await db.delete();
  }
});

test('backup restore fails closed for invalid input and restores valid data transactionally', async () => {
  const db = new BalkonBilanzDb(`backup-restore-${randomUUID()}`);
  await db.open();

  try {
    await db.meterReadings.put({
      id: 7,
      createdAt: '2026-05-01T00:00:00.000Z',
      updatedAt: '2026-05-01T00:00:00.000Z',
      timestamp: asMeterTimestamp('2026-05-01T07:00:00.000Z'),
      obis180Kwh: 1000,
      obis280Kwh: 50,
    });

    const service = createBackupService(db);

    const invalid = await service.restoreBackup('{"schemaVersion":2}');
    assert.equal(invalid.ok, false);
    assert.equal(await db.meterReadings.count(), 1);

    const validBackup = JSON.stringify({
      schemaVersion: 1,
      exportedAt: '2026-05-13T00:00:00.000Z',
      appSettings: [DEFAULT_APP_SETTINGS],
      tariffPeriods: [
        {
          id: 1,
          createdAt: '2026-05-01T00:00:00.000Z',
          updatedAt: '2026-05-01T00:00:00.000Z',
          startsOn: '2026-05-01',
          endsOn: null,
          electricityPriceEurPerKwh: 0.31,
        },
      ],
      meterReadings: [],
      pvDailyEntries: [],
    });

    const restored = await service.restoreBackup(validBackup);
    assert.equal(restored.ok, true);
    assert.equal(await db.meterReadings.count(), 0);
    assert.equal(await db.tariffPeriods.count(), 1);
  } finally {
    await db.delete();
  }
});
