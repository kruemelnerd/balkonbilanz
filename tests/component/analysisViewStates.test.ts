import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { test } from 'node:test';
import { createAnalysisStore } from '../../src/stores/analysisStore.ts';
import { mountVueComponent, flush } from '../support/vueHarness.ts';

test('analysis view renders readable warnings, qualities, and no raw codes', async () => {
  const store = createAnalysisStore({
    analysisService: {
      async loadAnalysis() {
        return {
          intervals: [],
          pvDays: [],
          combined: {
            estimateLabel: 'Naeherung',
            warnings: ['pv_below_export'],
            qualityLevel: 'limited',
            qualityReasons: ['pv_coverage_partial'],
            importKwh: 9,
            exportKwh: 4,
            selfConsumptionKwh: 0,
            autarkyPercent: 0,
          },
          quality: { level: 'limited', reasons: ['pv_coverage_partial'] },
        };
      },
    },
    today: () => new Date('2026-05-12T12:00:00.000Z'),
  });

  store.combined = {
    estimateLabel: 'Naeherung',
    warnings: ['pv_below_export'],
    qualityLevel: 'limited',
    qualityReasons: ['pv_coverage_partial'],
    importKwh: 9,
    exportKwh: 4,
    selfConsumptionKwh: 0,
    autarkyPercent: 0,
  };
  store.quality = { level: 'limited', reasons: ['pv_coverage_partial'] };
  store.intervals = [
    {
      start: '2026-05-10T07:00:00.000Z',
      end: '2026-05-12T07:00:00.000Z',
      durationHours: 48,
      durationDays: 2,
      importKwh: 9,
      exportKwh: 4,
      importKwhPerDay: 4.5,
      exportKwhPerDay: 2,
      cost: { amountEur: null, status: 'unavailable', basisPerKwh: 0.305, hint: 'Standardpreis 0.305 EUR/kWh' },
      flags: [],
    },
  ];
  store.pvDays = [{ day: '2026-05-10', generationKwh: 3.1, source: 'manual' } as any];
  store.fromDay = '2026-05-06';
  store.toDay = '2026-05-12';

  const { container, unmount } = await mountVueComponent(resolve('src/features/analysis/AnalysisView.vue'), { store });

  try {
    await flush();

    assert.match(container.textContent ?? '', /Plausibilitaetswarnung: Einspeisung liegt ueber dem erfassten PV-Tagesertrag\./);
    assert.match(container.textContent ?? '', /Nur 1 von 7 PV-Tagen vorhanden/);
    assert.match(container.textContent ?? '', /Naeherung/);
    assert.match(container.textContent ?? '', /Tageswert 10\.05\.2026/);
    assert.doesNotMatch(container.textContent ?? '', /Tageswert 2026-05-10/);
    assert.doesNotMatch(container.textContent ?? '', /pv_below_export/);
    assert.doesNotMatch(container.textContent ?? '', /pv_coverage_partial/);
  } finally {
    unmount();
  }
});

test('analysis view refreshes the range chart when the store reloads a new period', async () => {
  const store = createAnalysisStore({
    analysisService: {
      async loadAnalysis(range) {
        if (range.fromDay === '2026-05-10') {
          return {
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
                cost: { amountEur: null, status: 'unavailable', basisPerKwh: 0.305, hint: 'Standardpreis 0.305 EUR/kWh' },
                flags: [],
              },
            ],
            pvDays: [{ day: '2026-05-10', generationKwh: 3.1, source: 'manual' } as any],
            combined: {
              estimateLabel: 'Naeherung',
              warnings: [],
              qualityLevel: 'limited',
              qualityReasons: ['pv_coverage_partial'],
              importKwh: 4,
              exportKwh: 1,
              selfConsumptionKwh: 0,
              autarkyPercent: 0,
            },
            quality: { level: 'limited', reasons: ['pv_coverage_partial'] },
          };
        }

        return {
          intervals: [
            {
              start: '2026-05-11T07:00:00.000Z',
              end: '2026-05-11T19:00:00.000Z',
              durationHours: 12,
              durationDays: 1,
              importKwh: 5,
              exportKwh: 2,
              importKwhPerDay: 5,
              exportKwhPerDay: 2,
              cost: { amountEur: null, status: 'unavailable', basisPerKwh: 0.305, hint: 'Standardpreis 0.305 EUR/kWh' },
              flags: [],
            },
          ],
          pvDays: [{ day: '2026-05-11', generationKwh: 4.2, source: 'manual' } as any],
          combined: {
            estimateLabel: 'Naeherung',
            warnings: [],
            qualityLevel: 'good',
            qualityReasons: [],
            importKwh: 5,
            exportKwh: 2,
            selfConsumptionKwh: 0,
            autarkyPercent: 0,
          },
          quality: { level: 'good', reasons: [] },
        };
      },
    },
    today: () => new Date('2026-05-12T12:00:00.000Z'),
  });

  store.setRange('2026-05-10', '2026-05-12');
  await store.loadAnalysis();

  const { container, unmount } = await mountVueComponent(resolve('src/features/analysis/AnalysisView.vue'), { store });

  try {
    await flush();

    assert.match(container.textContent ?? '', /Analysezeitraum/);
    assert.match(container.textContent ?? '', /Qualitaet: limited/);
    assert.match(container.textContent ?? '', /Nur 1 von 3 PV-Tagen vorhanden/);

    store.setRange('2026-05-11', '2026-05-12');
    await store.loadAnalysis();
    await flush();

    assert.match(container.textContent ?? '', /Qualitaet: good/);
    assert.doesNotMatch(container.textContent ?? '', /Nur 1 von 3 PV-Tagen vorhanden/);
    assert.match(container.textContent ?? '', /11\.05\.2026/);
  } finally {
    unmount();
  }
});
