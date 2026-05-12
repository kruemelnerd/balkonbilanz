import assert from 'node:assert/strict';
import { test } from 'node:test';
import { asMeterTimestamp, asPvDay, type PvDailyRecord } from '../../src/domain/types.ts';
import type { MeterIntervalResult } from '../../src/domain/analysis/intervalTypes.ts';
import { evaluateDataQuality } from '../../src/domain/analysis/evaluateDataQuality.ts';

const interval: MeterIntervalResult = {
  start: asMeterTimestamp('2026-05-02T07:00:00.000Z'),
  end: asMeterTimestamp('2026-05-03T07:00:00.000Z'),
  durationDays: 1,
  importKwh: 7,
  exportKwh: 2,
  importKwhPerDay: 7,
  exportKwhPerDay: 2,
  costStatus: 'available',
  costBasisEurPerKwh: 0.305,
  costEur: 2.135,
  costLabel: '2.14 EUR',
  flags: [],
};

test('returns good when the range is covered and no interval is too long', () => {
  const pvDays: PvDailyRecord[] = Array.from({ length: 7 }, (_, index) => ({
    id: index + 1,
    createdAt: '2026-05-03T00:00:00.000Z',
    updatedAt: '2026-05-03T00:00:00.000Z',
    day: asPvDay(`2026-05-0${index + 1}`),
    generationKwh: 3 + index * 0.1,
    source: 'manual',
  }));

  const result = evaluateDataQuality([interval], pvDays, 7);

  assert.equal(result.level, 'good');
  assert.deepEqual(result.reasons, []);
});

test('returns limited when coverage is partial', () => {
  const pvDays: PvDailyRecord[] = [
    {
      id: 1,
      createdAt: '2026-05-03T00:00:00.000Z',
      updatedAt: '2026-05-03T00:00:00.000Z',
      day: asPvDay('2026-05-01'),
      generationKwh: 3,
      source: 'manual',
    },
    {
      id: 2,
      createdAt: '2026-05-03T00:00:00.000Z',
      updatedAt: '2026-05-03T00:00:00.000Z',
      day: asPvDay('2026-05-02'),
      generationKwh: 3,
      source: 'manual',
    },
    {
      id: 3,
      createdAt: '2026-05-03T00:00:00.000Z',
      updatedAt: '2026-05-03T00:00:00.000Z',
      day: asPvDay('2026-05-03'),
      generationKwh: 3,
      source: 'manual',
    },
  ];

  const result = evaluateDataQuality([interval], pvDays, 7);

  assert.equal(result.level, 'limited');
  assert.ok(result.reasons.includes('pv_coverage_partial'));
});

test('returns poor when an interval exceeds seven days and PV coverage is weak', () => {
  const longInterval: MeterIntervalResult = {
    ...interval,
    durationDays: 9,
    flags: ['long_interval'],
  };
  const pvDays: PvDailyRecord[] = [
    {
      id: 1,
      createdAt: '2026-05-03T00:00:00.000Z',
      updatedAt: '2026-05-03T00:00:00.000Z',
      day: asPvDay('2026-05-01'),
      generationKwh: 3,
      source: 'manual',
    },
  ];

  const result = evaluateDataQuality([longInterval], pvDays, 10);

  assert.equal(result.level, 'poor');
  assert.ok(result.reasons.includes('interval_over_7_days'));
  assert.ok(result.reasons.includes('pv_coverage_low'));
});
