import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { test } from 'node:test';
import { createAnalysisStore } from '../../src/stores/analysisStore.ts';
import { flush, mountVueComponent } from '../support/vueHarness.ts';

test('analysis range card switches presets and resets to 30 days', async () => {
  const store = createAnalysisStore({
    analysisService: { async loadAnalysis() { return { intervals: [], pvDays: [], combined: { estimateLabel: 'Naeherung', warnings: [], qualityLevel: 'good', qualityReasons: [], importKwh: 0, exportKwh: 0, selfConsumptionKwh: 0, autarkyPercent: 0 }, quality: { level: 'good', reasons: [] } }; } },
    today: () => new Date('2026-05-12T12:00:00.000Z'),
  });

  const { container, unmount } = await mountVueComponent(resolve('src/features/analysis/AnalysisRangeCard.vue'), { store });

  try {
    await flush();

    assert.equal((container.querySelector('#analysis-from') as HTMLInputElement).value, '2026-04-13');

    (container.querySelector('button[data-preset="7"]') as HTMLElement).click();
    await flush();
    assert.equal(store.rangePreset, 7);
    assert.equal((container.querySelector('#analysis-from') as HTMLInputElement).value, '2026-05-06');

    (container.querySelector('#analysis-from') as HTMLInputElement).value = '2026-05-01';
    (container.querySelector('#analysis-from') as HTMLInputElement).dispatchEvent(new Event('input', { bubbles: true }));
    await flush();
    assert.equal(store.rangePreset, null);

    (container.querySelector('button.reset-filters') as HTMLElement).click();
    await flush();
    assert.equal(store.rangePreset, 30);
    assert.equal((container.querySelector('#analysis-from') as HTMLInputElement).value, '2026-04-13');
  } finally {
    unmount();
  }
});
