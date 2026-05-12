import assert from 'node:assert/strict';
import { test } from 'node:test';
import { asMeterTimestamp, asPvDay, type MeterReadingRecord, type PvDailyRecord } from '../../../src/domain/types.ts';
import { calculateMeterIntervals } from '../../../src/domain/analysis/calculateMeterIntervals.ts';
import { calculateCombinedKpis } from '../../../src/domain/analysis/calculateCombinedKpis.ts';
import { evaluateDataQuality } from '../../../src/domain/analysis/evaluateDataQuality.ts';

const meterReadings: MeterReadingRecord[] = [
  {
    id: 1,
    createdAt: '2026-05-01T07:00:00.000Z',
    updatedAt: '2026-05-01T07:00:00.000Z',
    timestamp: asMeterTimestamp('2026-05-01T07:00:00.000Z'),
    obis180Kwh: 1200,
    obis280Kwh: 50,
  },
  {
    id: 2,
    createdAt: '2026-05-02T07:00:00.000Z',
    updatedAt: '2026-05-02T07:00:00.000Z',
    timestamp: asMeterTimestamp('2026-05-02T07:00:00.000Z'),
    obis180Kwh: 1207,
    obis280Kwh: 52,
  },
];

const pvDays: PvDailyRecord[] = [
  {
    id: 1,
    createdAt: '2026-05-02T00:00:00.000Z',
    updatedAt: '2026-05-02T00:00:00.000Z',
    day: asPvDay('2026-05-02'),
    generationKwh: 3.5,
    source: 'manual',
  },
  {
    id: 2,
    createdAt: '2026-05-03T00:00:00.000Z',
    updatedAt: '2026-05-03T00:00:00.000Z',
    day: asPvDay('2026-05-03'),
    generationKwh: 3.1,
    source: 'manual',
  },
  {
    id: 3,
    createdAt: '2026-05-04T00:00:00.000Z',
    updatedAt: '2026-05-04T00:00:00.000Z',
    day: asPvDay('2026-05-04'),
    generationKwh: 2.9,
    source: 'manual',
  },
];

test('Scenario: Analyse markiert Schaetzung und ehrliche Kostenmeldung', () => {
  const intervals = calculateMeterIntervals(meterReadings);
  const result = calculateCombinedKpis(intervals, pvDays, { periodDays: 1 });

  assert.equal(result.isEstimate, true);
  assert.equal(result.estimateLabel, 'Naeherung');
  assert.ok(result.warnings.length === 0);
  assert.equal(intervals[0]?.costLabel, 'Kosten noch nicht verfuegbar');
});

test('Scenario: Datenqualitaet benennt limitierende Gruende', () => {
  const intervals = calculateMeterIntervals(meterReadings);
  const quality = evaluateDataQuality(intervals, pvDays, 7);

  assert.equal(quality.level, 'limited');
  assert.ok(quality.reasons.includes('pv_coverage_partial'));
});
