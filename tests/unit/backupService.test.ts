import assert from 'node:assert/strict';
import 'fake-indexeddb/auto';
import { test } from 'node:test';
import { randomUUID } from 'node:crypto';

import { asMeterTimestamp, asPvDay } from '../../src/domain/types.ts';
import { createBackupService } from '../../src/services/backupService.ts';
import { BalkonBilanzDb } from '../../src/db/database.ts';

test('backup export contains schema metadata and all local tables', async () => {
  const db = new BalkonBilanzDb(`backup-export-${randomUUID()}`);
  await db.open();

  try {
    await db.meterReadings.add({
      timestamp: asMeterTimestamp('2026-05-10T07:00:00.000Z'),
      obis180Kwh: 1200,
      obis280Kwh: 50,
      createdAt: '2026-05-10T07:00:00.000Z',
      updatedAt: '2026-05-10T07:00:00.000Z',
    });
    await db.pvDailyEntries.add({
      day: asPvDay('2026-05-10'),
      generationKwh: 3.2,
      source: 'manual',
      createdAt: '2026-05-10T00:00:00.000Z',
      updatedAt: '2026-05-10T00:00:00.000Z',
    });

    const service = createBackupService(db);
    const exportResult = await service.exportBackup();

    assert.equal(exportResult.ok, true);
    assert.equal(exportResult.value.schemaVersion, 1);
    assert.match(exportResult.value.exportedAt, /T/);
    assert.equal(exportResult.value.meterReadings.length, 1);
    assert.equal(exportResult.value.pvDailyEntries.length, 1);
  } finally {
    await db.delete();
  }
});

test('backup import preview blocks restore without explicit confirmation', async () => {
  const db = new BalkonBilanzDb(`backup-preview-${randomUUID()}`);
  await db.open();

  try {
    const service = createBackupService(db);
    const exported = await service.exportBackup();
    const preview = await service.previewImport(exported.value);
    const restore = await service.restoreBackup(exported.value, { confirmed: false });

    assert.equal(preview.ok, true);
    assert.equal(preview.value.settingsIncluded, true);
    assert.equal(restore.ok, false);
    assert.equal(restore.kind, 'confirmation-required');
  } finally {
    await db.delete();
  }
});

test('invalid backup payload is rejected without mutating existing data', async () => {
  const db = new BalkonBilanzDb(`backup-invalid-${randomUUID()}`);
  await db.open();

  try {
    await db.meterReadings.add({
      timestamp: asMeterTimestamp('2026-05-10T07:00:00.000Z'),
      obis180Kwh: 1200,
      obis280Kwh: 50,
      createdAt: '2026-05-10T07:00:00.000Z',
      updatedAt: '2026-05-10T07:00:00.000Z',
    });

    const service = createBackupService(db);
    const restore = await service.restoreBackup({ schemaVersion: 99, exportedAt: 'invalid' } as never, { confirmed: true });

    assert.equal(restore.ok, false);
    assert.equal(await db.meterReadings.count(), 1);
  } finally {
    await db.delete();
  }
});
