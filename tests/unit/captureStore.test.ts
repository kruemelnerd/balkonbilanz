import assert from 'node:assert/strict';
import { test } from 'node:test';
import { asMeterTimestamp, type MeterReadingRecord } from '../../src/domain/types.ts';
import { createMemoryCaptureStore } from '../support/captureTestUtils.ts';

test('startMeterEdit prefill uses datetime-local format without seconds or Z', async () => {
  const store = createMemoryCaptureStore({
    meter: [
      {
        id: 1,
        timestamp: asMeterTimestamp('2026-05-10T07:00:00.000Z'),
        obis180Kwh: 1200,
        obis280Kwh: 50,
        createdAt: '2026-05-10T07:00:00.000Z',
        updatedAt: '2026-05-10T07:00:00.000Z',
      },
    ] satisfies MeterReadingRecord[],
  });

  await store.startMeterEdit(1);

  assert.equal(store.meter.draft.timestamp, '2026-05-10T07:00');
});
