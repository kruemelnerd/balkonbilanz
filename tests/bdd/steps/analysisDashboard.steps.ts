import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { test } from 'node:test';
import { createAnalysisStore } from '../../../src/stores/analysisStore.ts';
import { mountVueComponent, flush } from '../../support/vueHarness.ts';

test('scenario: dashboard quick actions route to capture anchors', async () => {
  let router: any;

  const store = createAnalysisStore({
    analysisService: {
      async loadAnalysis() {
        return {
          intervals: [],
          pvDays: [],
          combined: { estimateLabel: 'Naeherung', warnings: [], qualityLevel: 'good', qualityReasons: [], importKwh: 0, exportKwh: 0, selfConsumptionKwh: 0, autarkyPercent: 0 },
          quality: { level: 'good', reasons: [] },
        };
      },
    },
    today: () => new Date('2026-05-12T12:00:00.000Z'),
  });
  store.combined = { estimateLabel: 'Naeherung', warnings: [], qualityLevel: 'good', qualityReasons: [], importKwh: 0, exportKwh: 0, selfConsumptionKwh: 0, autarkyPercent: 0 };
  store.quality = { level: 'good', reasons: [] };

  const { container, unmount } = await mountVueComponent(resolve('src/features/dashboard/DashboardView.vue'), { store }, {
    plugins: [async () => {
      const { createAppRouter } = await import('../../../src/router/index.ts');
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

    const meterAction = container.querySelector('a[href="/capture#meter-timestamp"]') as HTMLAnchorElement | null;
    assert.ok(meterAction);
    meterAction?.click();
    await flush();
    assert.equal(router.currentRoute.value.fullPath, '/capture#meter-timestamp');
  } finally {
    unmount();
  }
});

test('scenario: analysis renders readable quality reasons', async () => {
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
  store.fromDay = '2026-05-01';
  store.toDay = '2026-05-07';
  store.pvDays = [{ day: '2026-05-01', generationKwh: 1, source: 'manual' }, { day: '2026-05-02', generationKwh: 1, source: 'manual' }, { day: '2026-05-03', generationKwh: 1, source: 'manual' }] as any;

  const { container, unmount } = await mountVueComponent(resolve('src/features/analysis/AnalysisView.vue'), { store });

  try {
    await flush();

    assert.match(container.textContent ?? '', /Plausibilitaetswarnung: Einspeisung liegt ueber dem erfassten PV-Tagesertrag\./);
    assert.match(container.textContent ?? '', /Nur 3 von 7 PV-Tagen vorhanden/);
  } finally {
    unmount();
  }
});
