import assert from 'node:assert/strict';
import { test } from 'node:test';
import { asMeterTimestamp, asPvDay, type MeterReadingRecord, type PvDailyRecord } from '../../src/domain/types.ts';
import { calculateMeterIntervals } from '../../src/domain/analysis/calculateMeterIntervals.ts';

const readings: MeterReadingRecord[] = [
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
  {
    id: 3,
    createdAt: '2026-05-03T07:00:00.000Z',
    updatedAt: '2026-05-03T07:00:00.000Z',
    timestamp: asMeterTimestamp('2026-05-03T07:00:00.000Z'),
    obis180Kwh: 1214,
    obis280Kwh: 54,
  },
];

test('creates newest-first intervals with start, end, duration, and deltas', () => {
  const intervals = calculateMeterIntervals([readings[0], readings[2], readings[1]]);

  assert.equal(intervals.length, 2);
  assert.equal(intervals[0].start, asMeterTimestamp('2026-05-02T07:00:00.000Z'));
  assert.equal(intervals[0].end, asMeterTimestamp('2026-05-03T07:00:00.000Z'));
  assert.equal(intervals[0].durationDays, 1);
  assert.equal(intervals[0].importKwh, 7);
  assert.equal(intervals[0].exportKwh, 2);
});

test('does not normalize kWh per day for invalid duration', () => {
  const intervals = calculateMeterIntervals([
    {
      ...readings[1],
      obis180Kwh: 1210,
    },
    {
      ...readings[1],
      obis180Kwh: 1211,
    },
  ]);

  assert.equal(intervals[0].importKwhPerDay, null);
  assert.equal(intervals[0].exportKwhPerDay, null);
});

test('uses 0.305 EUR/kWh as default but keeps unavailable cost status without tariff basis', () => {
  const intervals = calculateMeterIntervals([
    readings[2],
    {
      ...readings[1],
      obis180Kwh: 1217,
      obis280Kwh: 54,
    },
  ]);

  assert.equal(intervals[0].costBasisEurPerKwh, 0.305);
  assert.equal(intervals[0].costStatus, 'unavailable');
  assert.equal(intervals[0].costLabel, 'Kosten noch nicht verfuegbar');
});

test('flags suspicious jumps and PV lower than export', () => {
  const pvDays: PvDailyRecord[] = [
    {
      id: 10,
      createdAt: '2026-05-02T00:00:00.000Z',
      updatedAt: '2026-05-02T00:00:00.000Z',
      day: asPvDay('2026-05-02'),
      generationKwh: 4,
      source: 'manual',
    },
  ];

  const intervals = calculateMeterIntervals(
    [
      {
        ...readings[0],
        timestamp: asMeterTimestamp('2026-05-02T07:00:00.000Z'),
        obis180Kwh: 1300,
        obis280Kwh: 100,
      },
      {
        ...readings[1],
        timestamp: asMeterTimestamp('2026-05-01T07:00:00.000Z'),
      },
    ],
    { pvDailyRecords: pvDays },
  );

  assert.ok(intervals[0].flags.includes('suspicious_jump'));
  assert.ok(intervals[0].flags.includes('pv_export_mismatch'));
});
