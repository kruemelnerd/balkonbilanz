import assert from 'node:assert/strict';
import { test } from 'node:test';

test('buildAnalysisRangeChartModel filters the selected range and preserves quality context', async () => {
  const { buildAnalysisRangeChartModel } = await import('../../src/features/analysis/analysisRangeChartModel.ts');

  const model = buildAnalysisRangeChartModel({
    range: { start: '2026-05-10', end: '2026-05-12' },
    intervals: [
      {
        start: '2026-05-09T07:00:00.000Z',
        end: '2026-05-10T07:00:00.000Z',
        durationHours: 24,
        durationDays: 1,
        importKwh: 4,
        exportKwh: 1,
        importKwhPerDay: 4,
        exportKwhPerDay: 1,
        cost: { amountEur: null, status: 'unavailable' },
        flags: [],
      },
      {
        start: '2026-05-11T07:00:00.000Z',
        end: '2026-05-12T07:00:00.000Z',
        durationHours: 24,
        durationDays: 1,
        importKwh: 6,
        exportKwh: 2,
        importKwhPerDay: 6,
        exportKwhPerDay: 2,
        cost: { amountEur: null, status: 'unavailable' },
        flags: [],
      },
    ],
    pvDays: [
      { day: '2026-05-10', generationKwh: 3.2, source: 'manual' },
      { day: '2026-05-12', generationKwh: 1.7, source: 'manual' },
      { day: '2026-05-13', generationKwh: 9.1, source: 'manual' },
    ],
    quality: { level: 'limited', reasons: ['pv_coverage_partial'] },
  });

  assert.deepEqual(model.range, { start: '2026-05-10', end: '2026-05-12' });
  assert.equal(model.quality.level, 'limited');
  assert.deepEqual(model.quality.reasons, ['pv_coverage_partial']);
  assert.equal(model.meta.missingDays.includes('2026-05-11'), true);
  assert.equal(model.pvSeries.some((point) => point.x === '2026-05-13'), false);
  assert.equal(model.meterSeries.some((point) => point.qualityFlag === 'gap'), true);
});
