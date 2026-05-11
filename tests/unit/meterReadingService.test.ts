import assert from 'node:assert/strict';
import { test } from 'node:test';
import { asMeterTimestamp, type MeterReadingRecord } from '../../src/domain/types.ts';
import { createMeterReadingService } from '../../src/services/meterReadingService.ts';
import type { MeterReadingsRepository } from '../../src/repositories/meterReadingsRepository.ts';

function createRepositoryStub(initial: MeterReadingRecord[]): MeterReadingsRepository & {
  createCalls: number;
  updateCalls: number;
} {
  const rows = new Map<number, MeterReadingRecord>(initial.map((record) => [record.id ?? 0, record]));
  let nextId = 100;
  let createCalls = 0;
  let updateCalls = 0;

  return {
    get createCalls() {
      return createCalls;
    },
    get updateCalls() {
      return updateCalls;
    },
    async create(input) {
      createCalls += 1;
      const created: MeterReadingRecord = {
        ...input,
        id: nextId++,
        createdAt: '2026-05-11T00:00:00.000Z',
        updatedAt: '2026-05-11T00:00:00.000Z',
      };
      rows.set(created.id ?? 0, created);
      return created;
    },
    async update(id, patch) {
      updateCalls += 1;
      const existing = rows.get(id);
      if (!existing) {
        return undefined;
      }
      const updated: MeterReadingRecord = {
        ...existing,
        ...patch,
        id,
        createdAt: existing.createdAt,
        updatedAt: '2026-05-11T00:00:00.000Z',
      };
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

test('meter service blocks invalid writes before repository calls', async () => {
  const repository = createRepositoryStub([
    {
      id: 1,
      timestamp: asMeterTimestamp('2026-05-10T07:00:00.000Z'),
      obis180Kwh: 1200,
      obis280Kwh: 50,
      createdAt: '2026-05-10T07:00:00.000Z',
      updatedAt: '2026-05-10T07:00:00.000Z',
    },
  ]);
  const service = createMeterReadingService(repository);

  const result = await service.create({
    timestamp: '2026-05-10T08:00:00.000Z',
    obis180Kwh: 1199,
    obis280Kwh: 49,
  });

  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.kind, 'meter-change-required');
  }
  assert.equal(repository.createCalls, 0);
});

test('meter service creates and updates only after validation passes', async () => {
  const repository = createRepositoryStub([]);
  const service = createMeterReadingService(repository);

  const created = await service.create({
    timestamp: '2026-05-11T07:00:00.000Z',
    obis180Kwh: 1205,
    obis280Kwh: 52,
    note: 'first',
  });

  assert.equal(created.ok, true);
  assert.equal(repository.createCalls, 1);

  if (created.ok) {
    const updated = await service.update(created.value.id ?? 0, {
      timestamp: '2026-05-11T08:00:00.000Z',
      obis180Kwh: 1206,
      obis280Kwh: 53,
      note: 'edited',
    });

    assert.equal(updated.ok, true);
    assert.equal(repository.updateCalls, 1);
  }
});
