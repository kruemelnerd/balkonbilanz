import assert from 'node:assert/strict';
import { test } from 'node:test';
import { asMeterTimestamp, type MeterReadingRecord } from '../../src/domain/types.ts';
import { createCaptureStore, createEmptyMeterDraft } from '../../src/stores/captureStore.ts';
import type { MeterReadingsRepository } from '../../src/repositories/meterReadingsRepository.ts';
import { createMeterReadingService } from '../../src/services/meterReadingService.ts';

function createRepositoryStub(initial: MeterReadingRecord[]): MeterReadingsRepository {
  const rows = new Map<number, MeterReadingRecord>(initial.map((record) => [record.id ?? 0, record]));
  let nextId = 3;

  return {
    async create(input) {
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

test('meter capture store creates, edits, and deletes readings', async () => {
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
  const store = createCaptureStore({
    meterRepository: repository,
    meterService: createMeterReadingService(repository),
  });

  await store.loadMeterReadings();
  assert.equal(store.meter.readings.length, 1);

  store.updateMeterDraft({
    timestamp: '2026-05-11T07:00:00.000Z',
    obis180Kwh: '1204.5',
    obis280Kwh: '52',
    note: 'Morning read',
  });
  const created = await store.submitMeter();

  assert.equal(created.ok, true);
  assert.equal(store.meter.readings[0]?.timestamp, asMeterTimestamp('2026-05-11T07:00:00.000Z'));

  const editStarted = await store.startMeterEdit(store.meter.readings[0]?.id ?? 0);
  assert.equal(editStarted, true);
  assert.equal(store.meter.editingId, store.meter.readings[0]?.id ?? 0);

  store.updateMeterDraft({ obis180Kwh: '1205', note: 'edited' });
  const updated = await store.submitMeter();
  assert.equal(updated.ok, true);

  const deleted = await store.deleteMeter(store.meter.readings[0]?.id ?? 0);
  assert.equal(deleted, true);
  assert.equal(store.meter.readings.length, 1);
});

test('meter capture store exposes hard validation feedback for invalid form input', async () => {
  const repository = createRepositoryStub([]);
  const store = createCaptureStore({ meterRepository: repository, meterService: createMeterReadingService(repository) });

  store.updateMeterDraft(createEmptyMeterDraft());
  const result = await store.submitMeter();

  assert.equal(result.ok, false);
  assert.ok(store.meter.issues.some((issue) => issue.code === 'required_field_missing'));
  assert.equal(store.meter.banner, 'Bitte korrigieren Sie die markierten Felder.');
});
