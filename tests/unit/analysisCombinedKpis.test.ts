import assert from 'node:assert/strict';
import { test } from 'node:test';
import { asMeterTimestamp, asPvDay, type PvDailyRecord } from '../../src/domain/types.ts';
import type { MeterIntervalResult } from '../../src/domain/analysis/intervalTypes.ts';
import { calculateCombinedKpis } from '../../src/domain/analysis/calculateCombinedKpis.ts';

const baseInterval: MeterIntervalResult = {
  start: asMeterTimestamp('2026-05-02T07:00:00.000Z'),
  end: asMeterTimestamp('2026-05-03T07:00:00.000Z'),
  durationDays: 1,
  importKwh: 7,
  exportKwh: 2,
  importKwhPerDay: 7,
  exportKwhPerDay: 2,
  costStatus: 'unavailable',
  costBasisEurPerKwh: 0.305,
  costEur: 2.135,
  costLabel: 'Kosten noch nicht verfuegbar',
  flags: [],
};

test('marks combined KPIs as estimate with neutral quality when minimal basis exists', () => {
  const pvDays: PvDailyRecord[] = [
    {
      id: 1,
      createdAt: '2026-05-03T00:00:00.000Z',
      updatedAt: '2026-05-03T00:00:00.000Z',
      day: asPvDay('2026-05-02'),
      generationKwh: 3.5,
      source: 'manual',
    },
  ];

  const result = calculateCombinedKpis([baseInterval], pvDays, { periodDays: 1 });

  assert.equal(result.isEstimate, true);
  assert.equal(result.estimateLabel, 'Naeherung');
  assert.equal(result.quality.level, 'limited');
  assert.ok(result.selfConsumptionKwh > 0);
});

test('downgrades quality and warns when PV is lower than export', () => {
  const pvDays: PvDailyRecord[] = [
    {
      id: 1,
      createdAt: '2026-05-03T00:00:00.000Z',
      updatedAt: '2026-05-03T00:00:00.000Z',
      day: asPvDay('2026-05-02'),
      generationKwh: 1,
      source: 'manual',
    },
  ];

  const result = calculateCombinedKpis([baseInterval], pvDays, { periodDays: 1 });

  assert.ok(result.warnings.includes('pv_below_export'));
  assert.notEqual(result.quality.level, 'good');
});
