import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createMeterReadingService } from '../../src/services/meterReadingService.ts';
import { createPvDailyService } from '../../src/services/pvDailyService.ts';
import type { MeterReadingsRepository } from '../../src/repositories/meterReadingsRepository.ts';
import type { PvDailyRepository } from '../../src/repositories/pvDailyRepository.ts';
import { asMeterTimestamp, asPvDay, type MeterReadingRecord, type PvDailyRecord } from '../../src/domain/types.ts';

function createEmptyMeterRepository(): MeterReadingsRepository {
  const rows = new Map<number, MeterReadingRecord>();

  return {
    async create(input) {
      const created: MeterReadingRecord = { ...input, id: 1, createdAt: '2026-05-11T00:00:00.000Z', updatedAt: '2026-05-11T00:00:00.000Z' };
      rows.set(1, created);
      return created;
    },
    async update(id, patch) {
      const existing = rows.get(id);
      if (!existing) return undefined;
      const updated: MeterReadingRecord = { ...existing, ...patch, id, createdAt: existing.createdAt, updatedAt: '2026-05-11T00:00:00.000Z' };
      rows.set(id, updated);
      return updated;
    },
    async delete(id) {
      return rows.delete(id);
    },
    async get(id) {
      return rows.get(id);
    },
    async listNewestFirst() {
      return [...rows.values()];
    },
    async findByTimestamp(timestamp) {
      return [...rows.values()].find((record) => record.timestamp === timestamp);
    },
  };
}

function createEmptyPvRepository(): PvDailyRepository {
  const rows = new Map<number, PvDailyRecord>();

  return {
    async upsertByDay(input) {
      const created: PvDailyRecord = { ...input, id: 1, createdAt: '2026-05-11T00:00:00.000Z', updatedAt: '2026-05-11T00:00:00.000Z' };
      rows.set(1, created);
      return created;
    },
    async update(id, patch) {
      const existing = rows.get(id);
      if (!existing) return undefined;
      const updated: PvDailyRecord = { ...existing, ...patch, id, createdAt: existing.createdAt, updatedAt: '2026-05-11T00:00:00.000Z' };
      rows.set(id, updated);
      return updated;
    },
    async delete(id) {
      return rows.delete(id);
    },
    async get(id) {
      return rows.get(id);
    },
    async listNewestFirst() {
      return [...rows.values()];
    },
    async findByDay(day) {
      return [...rows.values()].find((record) => record.day === day);
    },
  };
}

test('meter service reports not-found for missing update/delete targets', async () => {
  const service = createMeterReadingService(createEmptyMeterRepository());

  const update = await service.update(99, {
    timestamp: '2026-05-11T07:00:00.000Z',
    obis180Kwh: 1,
    obis280Kwh: 1,
  });

  assert.equal(update.ok, false);

  const deleted = await service.delete(99);
  assert.equal(deleted.ok, false);
});

test('pv service reports not-found for missing update/delete targets', async () => {
  const service = createPvDailyService(createEmptyPvRepository());

  const update = await service.update(99, {
    day: '2026-05-10',
    generationKwh: 3.1,
    source: 'manual',
  });

  assert.equal(update.ok, false);

  const deleted = await service.delete(99);
  assert.equal(deleted.ok, false);
});

test('meter service allows identical readings when editing the same row', async () => {
  const repository = createEmptyMeterRepository();
  const created = await repository.create({
    timestamp: asMeterTimestamp('2026-05-10T07:00:00.000Z'),
    obis180Kwh: 1200,
    obis280Kwh: 50,
  });
  const service = createMeterReadingService(repository);

  const updated = await service.update(created.id ?? 0, {
    timestamp: '2026-05-10T07:00:00.000Z',
    obis180Kwh: 1200,
    obis280Kwh: 50,
  });

  assert.equal(updated.ok, true);
});

test('pv service upserts the same day without creating duplicates', async () => {
  const repository = createEmptyPvRepository();
  const service = createPvDailyService(repository);

  const created = await service.create({
    day: '2026-05-10',
    generationKwh: 3.1,
    source: 'manual',
  });

  assert.equal(created.ok, true);

  const edited = await service.create({
    day: '2026-05-10',
    generationKwh: 3.4,
    source: 'manual',
    note: 'updated',
  });

  assert.equal(edited.ok, true);
});
