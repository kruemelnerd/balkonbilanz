import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createCaptureStore } from '../../src/stores/captureStore.ts';
import { createMeterReadingService } from '../../src/services/meterReadingService.ts';
import { createPvDailyService } from '../../src/services/pvDailyService.ts';
import type { MeterReadingsRepository } from '../../src/repositories/meterReadingsRepository.ts';
import type { PvDailyRepository } from '../../src/repositories/pvDailyRepository.ts';

function createEmptyMeterRepository(): MeterReadingsRepository {
  return {
    async create() { throw new Error('not used'); },
    async update() { return undefined; },
    async delete() { return false; },
    async get() { return undefined; },
    async listNewestFirst() { return []; },
    async findByTimestamp() { return undefined; },
  };
}

function createEmptyPvRepository(): PvDailyRepository {
  return {
    async upsertByDay() { throw new Error('not used'); },
    async update() { return undefined; },
    async delete() { return false; },
    async get() { return undefined; },
    async listNewestFirst() { return []; },
    async findByDay() { return undefined; },
  };
}

test('pv form surfaces today-blocking validation errors as inline issues', async () => {
  const meterRepository = createEmptyMeterRepository();
  const pvRepository = createEmptyPvRepository();
  const store = createCaptureStore({
    meterRepository,
    meterService: createMeterReadingService(meterRepository),
    pvRepository,
    pvService: createPvDailyService(pvRepository),
  });

  store.updatePvDraft({ day: new Date().toISOString().slice(0, 10), generationKwh: '3.2', source: 'manual' });
  const result = await store.submitPv();

  assert.equal(result.ok, false);
  assert.ok(store.pv.issues.some((issue) => issue.code === 'future_or_today_day'));
  assert.equal(store.pv.banner, 'Bitte korrigieren Sie die markierten Felder.');
});
