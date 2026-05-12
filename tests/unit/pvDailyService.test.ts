import assert from 'node:assert/strict';
import { test } from 'node:test';
import { asPvDay, type PvDailyRecord } from '../../src/domain/types.ts';
import { createPvDailyService } from '../../src/services/pvDailyService.ts';
import type { PvDailyRepository } from '../../src/repositories/pvDailyRepository.ts';

function createRepositoryStub(initial: PvDailyRecord[]): PvDailyRepository & { upsertCalls: number; updateCalls: number } {
  const rows = new Map<number, PvDailyRecord>(initial.map((record) => [record.id ?? 0, record]));
  let nextId = 100;
  let upsertCalls = 0;
  let updateCalls = 0;

  return {
    get upsertCalls() {
      return upsertCalls;
    },
    get updateCalls() {
      return updateCalls;
    },
    async upsertByDay(input) {
      upsertCalls += 1;
      const existing = [...rows.values()].find((record) => record.day === input.day);
      if (!existing) {
        const created: PvDailyRecord = {
          ...input,
          id: nextId++,
          createdAt: '2026-05-11T00:00:00.000Z',
          updatedAt: '2026-05-11T00:00:00.000Z',
        };
        rows.set(created.id ?? 0, created);
        return created;
      }

      const updated: PvDailyRecord = {
        ...existing,
        ...input,
        id: existing.id,
        createdAt: existing.createdAt,
        updatedAt: '2026-05-11T00:00:00.000Z',
      };
      rows.set(existing.id ?? 0, updated);
      return updated;
    },
    async update(id, patch) {
      updateCalls += 1;
      const existing = rows.get(id);
      if (!existing) {
        return undefined;
      }
      const updated: PvDailyRecord = {
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
    async findByDay(day) {
      return [...rows.values()].find((record) => record.day === day);
    },
  };
}

test('pv service blocks today entries before repository writes', async () => {
  const repository = createRepositoryStub([]);
  const service = createPvDailyService(repository);
  const today = new Date().toISOString().slice(0, 10);

  const result = await service.create({
    day: today,
    generationKwh: 3.2,
    source: 'manual',
  });

  assert.equal(result.ok, false);
  assert.equal(repository.upsertCalls, 0);
});

test('pv service creates, upserts, and updates valid records', async () => {
  const repository = createRepositoryStub([
    {
      id: 1,
      day: asPvDay('2026-05-10'),
      generationKwh: 3,
      source: 'manual',
      createdAt: '2026-05-10T00:00:00.000Z',
      updatedAt: '2026-05-10T00:00:00.000Z',
    },
  ]);
  const service = createPvDailyService(repository);

  const created = await service.create({
    day: '2026-05-10',
    generationKwh: '4.1',
    source: 'manual',
  });

  assert.equal(created.ok, true);
  assert.equal(repository.upsertCalls, 1);

  const updated = await service.update(1, {
    day: '2026-05-10',
    generationKwh: 4.4,
    source: 'manual',
    note: 'edited',
  });

  assert.equal(updated.ok, true);
  assert.equal(repository.updateCalls, 1);
});
