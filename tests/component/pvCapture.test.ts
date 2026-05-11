import assert from 'node:assert/strict';
import { test } from 'node:test';
import { asPvDay, type PvDailyRecord } from '../../src/domain/types.ts';
import { createCaptureStore, createEmptyPvDraft } from '../../src/stores/captureStore.ts';
import type { PvDailyRepository } from '../../src/repositories/pvDailyRepository.ts';
import { createPvDailyService } from '../../src/services/pvDailyService.ts';
import { createMeterReadingService } from '../../src/services/meterReadingService.ts';
import type { MeterReadingsRepository } from '../../src/repositories/meterReadingsRepository.ts';
import type { MeterReadingRecord } from '../../src/domain/types.ts';

function createRepositoryStub(initial: PvDailyRecord[]): PvDailyRepository {
  const rows = new Map<number, PvDailyRecord>(initial.map((record) => [record.id ?? 0, record]));
  let nextId = 3;

  return {
    async upsertByDay(input) {
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

      const updated: PvDailyRecord = { ...existing, ...input, id: existing.id, createdAt: existing.createdAt, updatedAt: '2026-05-11T00:00:00.000Z' };
      rows.set(existing.id ?? 0, updated);
      return updated;
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
      return [...rows.values()].sort((left, right) => right.day.localeCompare(left.day));
    },
    async findByDay(day) {
      return [...rows.values()].find((record) => record.day === day);
    },
  };
}

function createEmptyMeterRepository(): MeterReadingsRepository {
  const rows = new Map<number, MeterReadingRecord>();

  return {
    async create(input) {
      const created: MeterReadingRecord = {
        ...input,
        id: 1,
        createdAt: '2026-05-11T00:00:00.000Z',
        updatedAt: '2026-05-11T00:00:00.000Z',
      };
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
      return [...rows.values()].sort((left, right) => right.timestamp.localeCompare(left.timestamp));
    },
    async findByTimestamp(timestamp) {
      return [...rows.values()].find((record) => record.timestamp === timestamp);
    },
  };
}

test('pv capture store blocks today and supports same-day upsert editing', async () => {
  const repository = createRepositoryStub([
    {
      id: 1,
      day: asPvDay('2026-05-10'),
      generationKwh: 3.2,
      source: 'manual',
      createdAt: '2026-05-10T00:00:00.000Z',
      updatedAt: '2026-05-10T00:00:00.000Z',
    },
  ]);
  const meterRepository = createEmptyMeterRepository();
  const store = createCaptureStore({
    meterRepository,
    meterService: createMeterReadingService(meterRepository),
    pvRepository: repository,
    pvService: createPvDailyService(repository),
  });

  await store.loadPvEntries();
  assert.equal(store.pv.entries.length, 1);

  store.updatePvDraft({ day: '2026-05-11', generationKwh: '3.2', source: 'manual' });
  const blocked = await store.submitPv();
  assert.equal(blocked.ok, false);
  assert.ok(store.pv.issues.some((issue) => issue.code === 'future_or_today_day'));

  store.startPvCreate();
  store.updatePvDraft({ day: '2026-05-10', generationKwh: '4.1', source: 'manual', note: 'updated' });
  const upserted = await store.submitPv();
  assert.equal(upserted.ok, true);
  assert.equal(store.pv.entries[0]?.generationKwh, 4.1);

  const editStarted = await store.startPvEdit(store.pv.entries[0]?.id ?? 0);
  assert.equal(editStarted, true);
  store.updatePvDraft({ generationKwh: '4.4' });
  const updated = await store.submitPv();
  assert.equal(updated.ok, true);

  const deleted = await store.deletePv(store.pv.entries[0]?.id ?? 0);
  assert.equal(deleted, true);
});

test('pv capture store exposes a clean empty draft for new entries', () => {
  const draft = createEmptyPvDraft();

  assert.deepEqual(draft, {
    day: '',
    generationKwh: '',
    source: 'manual',
    note: '',
  });
});
