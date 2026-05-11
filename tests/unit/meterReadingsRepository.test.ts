import assert from 'node:assert/strict';
import { test } from 'node:test';
import { asMeterTimestamp, type MeterReadingRecord } from '../../src/domain/types.ts';
import { createMeterReadingsRepository, type RecordTable } from '../../src/repositories/meterReadingsRepository.ts';

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

test('meter repository supports CRUD, sorting, and exact timestamp lookup', async () => {
  const repository = createMeterReadingsRepository(new InMemoryTable<MeterReadingRecord>());

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

  assert.deepEqual(await repository.findByTimestamp(asMeterTimestamp('2026-05-11T18:00:00.000Z')), newer);

  const sorted = await repository.listNewestFirst();
  assert.deepEqual(sorted.map((record) => record.id), [newer.id, older.id]);

  const updated = await repository.update(older.id ?? 0, {
    note: 'updated',
  });

  assert.equal(updated?.note, 'updated');
  assert.equal(await repository.delete(older.id ?? 0), true);
  assert.equal(await repository.get(older.id ?? 0), undefined);
});
