import assert from 'node:assert/strict';
import { test } from 'node:test';
import { asMeterTimestamp, type MeterReadingRecord } from '../../src/domain/types.ts';
import { calculateMeterIntervals } from '../../src/domain/analysis/calculateMeterIntervals.ts';
import type { MeterIntervalResult } from '../../src/domain/analysis/intervalTypes.ts';

const meterReadings: MeterReadingRecord[] = [
  {
    id: 1,
    timestamp: asMeterTimestamp('2026-05-12T07:00:00.000Z'),
    obis180Kwh: 1209,
    obis280Kwh: 54,
    createdAt: '2026-05-12T07:00:00.000Z',
    updatedAt: '2026-05-12T07:00:00.000Z',
  },
  {
    id: 2,
    timestamp: asMeterTimestamp('2026-05-10T07:00:00.000Z'),
    obis180Kwh: 1200,
    obis280Kwh: 50,
    createdAt: '2026-05-10T07:00:00.000Z',
    updatedAt: '2026-05-10T07:00:00.000Z',
  },
];

test('calculateMeterIntervals returns interval rows with duration and deltas', () => {
  const result = calculateMeterIntervals(meterReadings) as MeterIntervalResult[];

  assert.equal(result.length, 1);
  assert.equal(result[0]?.start, '2026-05-10T07:00:00.000Z');
  assert.equal(result[0]?.end, '2026-05-12T07:00:00.000Z');
  assert.equal(result[0]?.durationDays, 2);
  assert.equal(result[0]?.importKwh, 9);
  assert.equal(result[0]?.exportKwh, 4);
});

test('calculateMeterIntervals marks invalid durations as non-normalized', () => {
  const result = calculateMeterIntervals([
    {
      id: 1,
      timestamp: asMeterTimestamp('2026-05-10T07:00:00.000Z'),
      obis180Kwh: 1200,
      obis280Kwh: 50,
      createdAt: '2026-05-10T07:00:00.000Z',
      updatedAt: '2026-05-10T07:00:00.000Z',
    },
    {
      id: 2,
      timestamp: asMeterTimestamp('2026-05-10T07:00:00.000Z'),
      obis180Kwh: 1204,
      obis280Kwh: 52,
      createdAt: '2026-05-10T07:00:00.000Z',
      updatedAt: '2026-05-10T07:00:00.000Z',
    },
  ]) as MeterIntervalResult[];

  assert.equal(result[0]?.importKwhPerDay, null);
});
