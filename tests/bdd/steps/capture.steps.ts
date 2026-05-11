import { Before, Given, Then, When } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import { asMeterTimestamp, asPvDay, type MeterReadingRecord, type PvDailyRecord } from '../../../src/domain/types.ts';
import { createCaptureStore } from '../../../src/stores/captureStore.ts';
import { createMeterReadingService } from '../../../src/services/meterReadingService.ts';
import { createPvDailyService } from '../../../src/services/pvDailyService.ts';
import type { MeterReadingsRepository } from '../../../src/repositories/meterReadingsRepository.ts';
import type { PvDailyRepository } from '../../../src/repositories/pvDailyRepository.ts';

function createMeterRepository(): MeterReadingsRepository {
  const rows = new Map<number, MeterReadingRecord>();
  return {
    async create(input) { const created: MeterReadingRecord = { ...input, id: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }; rows.set(1, created); return created; },
    async update(id, patch) { const existing = rows.get(id); if (!existing) return undefined; const updated: MeterReadingRecord = { ...existing, ...patch, id, createdAt: existing.createdAt, updatedAt: new Date().toISOString() }; rows.set(id, updated); return updated; },
    async delete(id) { return rows.delete(id); },
    async get(id) { return rows.get(id); },
    async listNewestFirst() { return [...rows.values()].sort((a, b) => b.timestamp.localeCompare(a.timestamp)); },
    async findByTimestamp(timestamp) { return [...rows.values()].find((row) => row.timestamp === timestamp); },
  };
}

function createPvRepository(): PvDailyRepository {
  const rows = new Map<number, PvDailyRecord>();
  return {
    async upsertByDay(input) { const existing = [...rows.values()].find((row) => row.day === input.day); if (!existing) { const created: PvDailyRecord = { ...input, id: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }; rows.set(1, created); return created; } const updated: PvDailyRecord = { ...existing, ...input, id: existing.id, createdAt: existing.createdAt, updatedAt: new Date().toISOString() }; rows.set(existing.id ?? 1, updated); return updated; },
    async update(id, patch) { const existing = rows.get(id); if (!existing) return undefined; const updated: PvDailyRecord = { ...existing, ...patch, id, createdAt: existing.createdAt, updatedAt: new Date().toISOString() }; rows.set(id, updated); return updated; },
    async delete(id) { return rows.delete(id); },
    async get(id) { return rows.get(id); },
    async listNewestFirst() { return [...rows.values()].sort((a, b) => b.day.localeCompare(a.day)); },
    async findByDay(day) { return [...rows.values()].find((row) => row.day === day); },
  };
}

let store: ReturnType<typeof createCaptureStore>;

Before(() => {
  const meterRepository = createMeterRepository();
  const pvRepository = createPvRepository();
  store = createCaptureStore({
    meterRepository,
    meterService: createMeterReadingService(meterRepository),
    pvRepository,
    pvService: createPvDailyService(pvRepository),
  });
});

Given('an empty meter capture store', async () => {
  await store.loadMeterReadings();
  assert.equal(store.meter.readings.length, 0);
});

When('the user enters a meter reading for {string}', async (timestamp: string) => {
  store.updateMeterDraft({ timestamp, obis180Kwh: '1200', obis280Kwh: '50', note: 'manual' });
});

When('saves the meter reading', async () => {
  const result = await store.submitMeter();
  assert.equal(result.ok, true);
});

Then('the reading is visible in the newest-first list', () => {
  assert.equal(store.meter.readings[0]?.timestamp, asMeterTimestamp('2026-05-10T07:00:00.000Z'));
});

When('the user edits the newest meter reading', async () => {
  await store.startMeterEdit(store.meter.readings[0]?.id ?? 0);
  store.updateMeterDraft({ obis180Kwh: '1201' });
});

When('saves the meter reading again', async () => {
  const result = await store.submitMeter();
  assert.equal(result.ok, true);
});

Then('the meter reading is updated', () => {
  assert.equal(store.meter.readings[0]?.obis180Kwh, 1201);
});

Given('an empty PV capture store', async () => {
  await store.loadPvEntries();
  assert.equal(store.pv.entries.length, 0);
});

When('the user enters PV generation for {string}', async (day: string) => {
  store.updatePvDraft({ day, generationKwh: '3.2', source: 'manual', note: 'manual' });
});

When('saves the PV entry', async () => {
  const result = await store.submitPv();
  assert.equal(result.ok, true);
});

Then('the entry is visible in the newest-first list', () => {
  assert.equal(store.pv.entries[0]?.day, asPvDay('2026-05-10'));
});

When('the user tries to save PV generation for today', async () => {
  store.startPvCreate();
  store.updatePvDraft({ day: new Date().toISOString().slice(0, 10), generationKwh: '3.2', source: 'manual' });
  const result = await store.submitPv();
  assert.equal(result.ok, false);
});

Then('the form shows a blocking date error', () => {
  assert.ok(store.pv.issues.some((issue) => issue.code === 'future_or_today_day'));
});
