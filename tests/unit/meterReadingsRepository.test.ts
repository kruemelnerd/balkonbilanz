import assert from 'node:assert/strict';
import 'fake-indexeddb/auto';
import { randomUUID } from 'node:crypto';
import { test } from 'node:test';
import { asMeterTimestamp, type MeterReadingRecord } from '../../src/domain/types.ts';
import { createMeterReadingsRepository, type RecordTable } from '../../src/repositories/meterReadingsRepository.ts';
import { BalkonBilanzDb } from '../../src/db/database.ts';

class InMemoryTable<T extends { id?: number }> implements RecordTable<T> {
  private readonly rows = new Map<number, T>();
  private nextId = 1;

  async add(entity: T): Promise<number> {
    const id = this.nextId++;
    this.rows.set(id, { ...entity, id });
    return id;
  }

  async put(entity: T): Promise<number> {
    const id = entity.id ?? this.nextId++;
    this.rows.set(id, { ...entity, id });
    return id;
  }

  async get(key: number): Promise<T | undefined> {
    return this.rows.get(key);
  }

  async delete(key: number): Promise<void> {
    this.rows.delete(key);
  }

  async toArray(): Promise<T[]> {
    return [...this.rows.values()];
  }
}

test('meter repository persists readings across repository instances', async () => {
  const db = new BalkonBilanzDb(`meter-repository-${randomUUID()}`);
  await db.open();

  try {
    const repository = createMeterReadingsRepository(db.table('meterReadings') as unknown as RecordTable<MeterReadingRecord>);

    const older = await repository.create({
      timestamp: asMeterTimestamp('2026-05-10T07:00:00.000Z'),
      obis180Kwh: 1200,
      obis280Kwh: 50,
      note: 'older',
    });

    const newer = await repository.create({
      timestamp: asMeterTimestamp('2026-05-11T18:00:00.000Z'),
      obis180Kwh: 1205,
      obis280Kwh: 52,
      note: 'newer',
    });

    const rereadRepository = createMeterReadingsRepository(db.table('meterReadings') as unknown as RecordTable<MeterReadingRecord>);
    assert.deepEqual(await rereadRepository.findByTimestamp(asMeterTimestamp('2026-05-11T18:00:00.000Z')), newer);

    const sorted = await rereadRepository.listNewestFirst();
    assert.deepEqual(sorted.map((record) => record.id), [newer.id, older.id]);

    const updated = await rereadRepository.update(older.id ?? 0, {
      note: 'updated',
    });

    assert.equal(updated?.note, 'updated');
    assert.equal(await rereadRepository.delete(older.id ?? 0), true);
    assert.equal(await rereadRepository.get(older.id ?? 0), undefined);
  } finally {
    await db.delete();
  }
});
