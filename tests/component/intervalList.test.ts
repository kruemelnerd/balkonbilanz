import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { test } from 'node:test';
import { createAnalysisStore } from '../../src/stores/analysisStore.ts';
import { flush, mountVueComponent } from '../support/vueHarness.ts';

test('interval list shows newest intervals first with honest cost fallback', async () => {
  const store = createAnalysisStore({
    analysisService: { async loadAnalysis() { return { intervals: [], pvDays: [], combined: { estimateLabel: 'Naeherung', warnings: [], qualityLevel: 'good', qualityReasons: [], importKwh: 0, exportKwh: 0, selfConsumptionKwh: 0, autarkyPercent: 0 }, quality: { level: 'good', reasons: [] } }; } },
    today: () => new Date('2026-05-12T12:00:00.000Z'),
  });

  store.intervals = [
    {
      start: '2026-05-01T07:00:00.000Z',
      end: '2026-05-03T07:00:00.000Z',
      durationHours: 48,
      durationDays: 2,
      importKwh: 8,
      exportKwh: 3,
      importKwhPerDay: 4,
      exportKwhPerDay: 1.5,
      cost: { amountEur: null, status: 'unavailable', basisPerKwh: 0.305, hint: 'Standardpreis 0.305 EUR/kWh' },
      flags: [{ code: 'suspicious_jump', message: 'Auffälliger Zählersprung' }],
    },
    {
      start: '2026-05-03T07:00:00.000Z',
      end: '2026-05-12T07:00:00.000Z',
      durationHours: 216,
      durationDays: 9,
      importKwh: 42,
      exportKwh: 24,
      importKwhPerDay: 4.667,
      exportKwhPerDay: 2.667,
      cost: { amountEur: 12.78, status: 'available', basisPerKwh: 0.305, hint: 'Tarifbasis 0.305 EUR/kWh' },
      flags: [],
    },
  ];

  const { container, unmount } = await mountVueComponent(resolve('src/features/analysis/IntervalList.vue'), { store });

  try {
    await flush();

    assert.match(container.textContent ?? '', /03\.05\.2026/);
    assert.match(container.textContent ?? '', /12\.05\.2026/);
    assert.match(container.textContent ?? '', /\d{2}:\d{2}/);
    assert.doesNotMatch(container.textContent ?? '', /2026-05-03T07:00:00\.000Z/);
    assert.match(container.textContent ?? '', /Kosten noch nicht verfuegbar/);
    assert.match(container.textContent ?? '', /Standardpreis 0.305 EUR\/kWh/);
    assert.match(container.textContent ?? '', /Auffaelliger Zaehlersprung/);
  } finally {
    unmount();
  }
});
