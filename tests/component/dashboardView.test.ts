import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { test } from 'node:test';
import { createAnalysisStore } from '../../src/stores/analysisStore.ts';
import { mountVueComponent, flush } from '../support/vueHarness.ts';

test('dashboard view shows mapped warnings and quick action links', async () => {
  let router: any;

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
  store.pvDays = [{ day: '2026-05-10', generationKwh: 3.1, source: 'manual' } as any];
  store.fromDay = '2026-05-06';
  store.toDay = '2026-05-12';

  const { container, unmount } = await mountVueComponent(resolve('src/features/dashboard/DashboardView.vue'), { store }, {
    plugins: [async () => {
      const { createAppRouter } = await import('../../src/router/index.ts');
      router = createAppRouter({
        views: {
          dashboard: { template: '<div>Dashboard Stub</div>' } as any,
          capture: { template: '<div>Capture Stub</div>' } as any,
          analysis: { template: '<div>Analysis Stub</div>' } as any,
        },
      });
      return router;
    }],
  });

  try {
    await flush();

    assert.match(container.textContent ?? '', /Plausibilitaetswarnung: Einspeisung liegt ueber dem erfassten PV-Tagesertrag\./);
    assert.match(container.textContent ?? '', /Nur 1 von 7 PV-Tagen vorhanden/);
    assert.match(container.textContent ?? '', /Zählerstand erfassen/);
    assert.match(container.textContent ?? '', /PV-Tageswert erfassen/);
    assert.equal((container.querySelector('a[href="/capture#meter-timestamp"]') as HTMLAnchorElement | null)?.getAttribute('href'), '/capture#meter-timestamp');
    assert.equal((container.querySelector('a[href="/capture#pv-day"]') as HTMLAnchorElement | null)?.getAttribute('href'), '/capture#pv-day');
  } finally {
    unmount();
  }
});
