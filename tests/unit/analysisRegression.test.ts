import assert from 'node:assert/strict';
import { test } from 'node:test';
import { asMeterTimestamp, asPvDay, type PvDailyRecord } from '../../src/domain/types.ts';
import { createAnalysisStore } from '../../src/stores/analysisStore.ts';

test('analysis store reloads the same base result lengths after a repeat load', async () => {
  const calls: Array<{ fromDay: string; toDay: string }> = [];
  const pvDays: PvDailyRecord[] = [
    {
      id: 1,
      createdAt: '2026-05-01T00:00:00.000Z',
      updatedAt: '2026-05-01T00:00:00.000Z',
      day: asPvDay('2026-05-01'),
      generationKwh: 3.2,
      source: 'manual',
    },
  ];

  const store = createAnalysisStore({
    now: () => new Date('2026-05-31T12:00:00.000Z'),
    analysisService: {
      async loadAnalysis(range) {
        calls.push(range);

        return {
          intervals: [
            {
              start: asMeterTimestamp('2026-05-01T07:00:00.000Z'),
              end: asMeterTimestamp('2026-05-08T07:00:00.000Z'),
              durationDays: 7,
              importKwh: 14.1,
              exportKwh: 2.4,
              importKwhPerDay: 2.01,
              exportKwhPerDay: 0.34,
              costStatus: 'available',
              costBasisEurPerKwh: 0.305,
              costEur: 4.31,
              costLabel: '4.31 EUR',
              flags: [],
            },
          ],
          pvDays,
          combined: {
            isEstimate: true,
            estimateLabel: 'Naeherung',
            quality: { level: 'limited', reasons: ['Nur 1 von 7 PV-Tagen vorhanden'] },
            selfConsumptionKwh: 8.1,
            autarkyPercent: 42,
            pvTotalKwh: 3.2,
            exportTotalKwh: 2.4,
            warnings: [],
            pvDays: pvDays.map((entry) => entry.day),
          },
          quality: { level: 'limited', reasons: ['Nur 1 von 7 PV-Tagen vorhanden'] },
        };
      },
    },
  });

  await store.loadAnalysis();
  const firstIntervals = store.intervals.length;
  const firstPvDays = store.pvDays.length;

  await store.loadAnalysis();

  assert.equal(calls.length, 2);
  assert.deepEqual(calls[0], calls[1]);
  assert.equal(store.intervals.length, firstIntervals);
  assert.equal(store.pvDays.length, firstPvDays);
  assert.equal(store.quality?.level, 'limited');
});
