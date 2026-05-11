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

test('meter form surfaces blocking validation errors as inline issues', async () => {
  const meterRepository = createEmptyMeterRepository();
  const pvRepository = createEmptyPvRepository();
  const store = createCaptureStore({
    meterRepository,
    meterService: createMeterReadingService(meterRepository),
    pvRepository,
    pvService: createPvDailyService(pvRepository),
  });

  const result = await store.submitMeter();

  assert.equal(result.ok, false);
  assert.ok(store.meter.issues.some((issue) => issue.field === 'timestamp'));
  assert.equal(store.meter.banner, 'Bitte korrigieren Sie die markierten Felder.');
});
