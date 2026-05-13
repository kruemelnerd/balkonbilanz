import assert from 'node:assert/strict';
import 'fake-indexeddb/auto';
import { test } from 'node:test';
import { randomUUID } from 'node:crypto';

import { asMeterTimestamp } from '../../../src/domain/types.ts';
import { createBackupService } from '../../../src/services/backupService.ts';
import { BalkonBilanzDb } from '../../../src/db/database.ts';

test('Scenario: Backup exportiert alle lokalen Daten', async () => {
  const db = new BalkonBilanzDb(`backup-bdd-export-${randomUUID()}`);
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
    const exported = await service.exportBackup();

    assert.equal(exported.ok, true);
    assert.equal(exported.value.schemaVersion, 1);
  } finally {
    await db.delete();
  }
});
