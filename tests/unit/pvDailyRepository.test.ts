import assert from 'node:assert/strict';
import { test } from 'node:test';
import { asPvDay, type PvDailyRecord } from '../../src/domain/types.ts';
import { createPvDailyRepository } from '../../src/repositories/pvDailyRepository.ts';
import type { RecordTable } from '../../src/repositories/meterReadingsRepository.ts';

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

test('pv repository upserts by day and keeps newest-first ordering', async () => {
  const repository = createPvDailyRepository(new InMemoryTable<PvDailyRecord>());

  const created = await repository.upsertByDay({
    day: asPvDay('2026-05-10'),
    generationKwh: 3.2,
    note: 'first',
    source: 'manual',
  });

  const updated = await repository.upsertByDay({
    day: asPvDay('2026-05-10'),
    generationKwh: 4.1,
    note: 'updated',
    source: 'manual',
  });

  const newer = await repository.upsertByDay({
    day: asPvDay('2026-05-11'),
    generationKwh: 2.8,
    note: 'newer',
    source: 'manual',
  });

  assert.equal(updated.id, created.id);
  assert.equal(updated.generationKwh, 4.1);
  assert.deepEqual(await repository.findByDay(asPvDay('2026-05-10')), updated);

  const sorted = await repository.listNewestFirst();
  assert.deepEqual(sorted.map((record) => record.day), ['2026-05-11', '2026-05-10']);
  assert.deepEqual(sorted[0], newer);

  assert.equal(await repository.delete(created.id ?? 0), true);
  assert.equal(await repository.get(created.id ?? 0), undefined);
});
