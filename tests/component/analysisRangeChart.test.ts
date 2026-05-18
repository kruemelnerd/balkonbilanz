import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { test } from 'node:test';
import { buildAnalysisRangeChartModel } from '../../src/features/analysis/analysisRangeChartModel.ts';
import { mountVueComponent, flush } from '../support/vueHarness.ts';

test('analysis range chart renders points and quality hint', async () => {
  const model = buildAnalysisRangeChartModel({
    range: { start: '2026-05-10', end: '2026-05-12' },
    intervals: [
      {
        start: '2026-05-10T07:00:00.000Z',
        end: '2026-05-10T19:00:00.000Z',
        durationHours: 12,
        durationDays: 1,
        importKwh: 4,
        exportKwh: 1,
        importKwhPerDay: 4,
        exportKwhPerDay: 1,
        cost: { amountEur: null, status: 'unavailable' },
        flags: [],
      },
      {
        start: '2026-05-12T07:00:00.000Z',
        end: '2026-05-12T19:00:00.000Z',
        durationHours: 12,
        durationDays: 1,
        importKwh: 5,
        exportKwh: 2,
        importKwhPerDay: 5,
        exportKwhPerDay: 2,
        cost: { amountEur: null, status: 'unavailable' },
        flags: [],
      },
    ],
    pvDays: [
      { day: '2026-05-10', generationKwh: 3.2, source: 'manual' },
      { day: '2026-05-12', generationKwh: 1.7, source: 'manual' },
    ],
    quality: { level: 'limited', reasons: ['pv_coverage_partial'] },
  });

  const { container, unmount } = await mountVueComponent(resolve('src/features/analysis/AnalysisRangeChart.vue'), { model });

  try {
    await flush();

    assert.match(container.textContent ?? '', /Analysezeitraum/);
    assert.match(container.textContent ?? '', /Qualitaet: limited/);
    assert.match(container.textContent ?? '', /PV-Ertrag/);
    assert.equal(container.querySelectorAll('[data-series="pvKwh"]').length > 0, true);
    assert.equal(container.querySelector('[data-gap="true"]') !== null, true);
  } finally {
    unmount();
  }
});

test('analysis range chart shows the empty state without data', async () => {
  const model = buildAnalysisRangeChartModel({
    range: { start: '2026-05-10', end: '2026-05-12' },
    intervals: [],
    pvDays: [],
    quality: { level: 'good', reasons: [] },
  });

  const { container, unmount } = await mountVueComponent(resolve('src/features/analysis/AnalysisRangeChart.vue'), { model });

  try {
    await flush();

    assert.match(container.textContent ?? '', /Keine Daten fuer diesen Zeitraum/);
  } finally {
    unmount();
  }
});
