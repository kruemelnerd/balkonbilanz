import assert from 'node:assert/strict';
import { test } from 'node:test';
import { evaluateDataQuality } from '../../src/domain/analysis/evaluateDataQuality.ts';
import type { DataQualityResult } from '../../src/domain/analysis/intervalTypes.ts';

test('evaluateDataQuality returns good/limited/poor with reasons', () => {
  const result = evaluateDataQuality({
    rangeDays: 10,
    intervals: [
      {
        start: '2026-05-01T07:00:00.000Z',
        end: '2026-05-09T07:00:00.000Z',
        durationHours: 192,
        durationDays: 8,
        importKwh: 12,
        exportKwh: 4,
        importKwhPerDay: 1.5,
        exportKwhPerDay: 0.5,
        cost: { amountEur: null, status: 'unavailable' },
        flags: [],
      },
    ],
    pvDays: [{ day: '2026-05-01' }, { day: '2026-05-02' }, { day: '2026-05-03' }],
  }) as DataQualityResult;

  assert.equal(result.level, 'poor');
  assert.ok(result.reasons.length > 0);
});

test('evaluateDataQuality downgrades long intervals past 7 days', () => {
  const result = evaluateDataQuality({
    rangeDays: 10,
    intervals: [
      {
        start: '2026-05-01T07:00:00.000Z',
        end: '2026-05-12T07:00:00.000Z',
        durationHours: 264,
        durationDays: 11,
        importKwh: 30,
        exportKwh: 11,
        importKwhPerDay: 2.7,
        exportKwhPerDay: 1,
        cost: { amountEur: null, status: 'unavailable' },
        flags: [],
      },
    ],
    pvDays: [{ day: '2026-05-01' }, { day: '2026-05-02' }, { day: '2026-05-03' }, { day: '2026-05-04' }, { day: '2026-05-05' }, { day: '2026-05-06' }, { day: '2026-05-07' }, { day: '2026-05-08' }, { day: '2026-05-09' }, { day: '2026-05-10' }],
  }) as DataQualityResult;

  assert.equal(result.level, 'limited');
  assert.ok(result.reasons.includes('interval_over_7_days'));
});
