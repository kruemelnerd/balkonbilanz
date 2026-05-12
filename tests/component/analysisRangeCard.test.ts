import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { test } from 'node:test';
import { createAnalysisStore, type AnalysisRange, type AnalysisServiceResult } from '../../src/stores/analysisStore.ts';
import { clickElement, flush, mountVueComponent, setInputValue } from '../support/vueHarness.ts';

function fixedNow(): Date {
  return new Date('2026-05-12T12:00:00.000Z');
}

function makeResult(): AnalysisServiceResult {
  return {
    intervals: [],
    pvDays: [],
    combined: {
      isEstimate: true,
      estimateLabel: 'Naeherung',
      quality: { level: 'limited', reasons: ['minimal_basis'] },
      selfConsumptionKwh: 0,
      autarkyPercent: 0,
      pvTotalKwh: 0,
      exportTotalKwh: 0,
      warnings: [],
      pvDays: [],
    },
    quality: { level: 'limited', reasons: ['minimal_basis'] },
  };
}

test('analysis range card updates presets, dates, and reset behavior', async () => {
  const ranges: AnalysisRange[] = [];
  const store = createAnalysisStore({
    analysisService: {
      async loadAnalysis(range: AnalysisRange): Promise<AnalysisServiceResult> {
        ranges.push(range);
        return makeResult();
      },
    },
    now: fixedNow,
  });

  const { container, unmount } = await mountVueComponent(resolve('src/features/analysis/AnalysisRangeCard.vue'), { store });
  try {
    await flush();

    assert.ok(container.textContent?.includes('7 Tage'));
    assert.ok(container.textContent?.includes('30 Tage'));
    assert.ok(container.textContent?.includes('90 Tage'));
    assert.ok(container.textContent?.includes('Filter zuruecksetzen'));

    const sevenButton = [...container.querySelectorAll('button')].find((button) => button.textContent?.includes('7 Tage')) as HTMLButtonElement;
    clickElement(sevenButton);
    await flush();

    assert.equal(store.rangePreset, 7);
    assert.equal((container.querySelector('#analysis-from') as HTMLInputElement).value, '2026-05-06');
    assert.equal((container.querySelector('#analysis-to') as HTMLInputElement).value, '2026-05-12');

    setInputValue(container.querySelector('#analysis-from') as HTMLInputElement, '2026-05-01');
    setInputValue(container.querySelector('#analysis-to') as HTMLInputElement, '2026-05-08');
    await store.loadAnalysis();
    await flush();

    assert.equal((container.querySelector('#analysis-from') as HTMLInputElement).value, '2026-05-01');
    assert.equal((container.querySelector('#analysis-to') as HTMLInputElement).value, '2026-05-08');

    const resetButton = [...container.querySelectorAll('button')].find((button) => button.textContent?.includes('Filter zuruecksetzen')) as HTMLButtonElement;
    clickElement(resetButton);
    await flush();

    assert.equal(store.rangePreset, 30);
    assert.equal((container.querySelector('#analysis-from') as HTMLInputElement).value, '2026-04-13');
    assert.equal((container.querySelector('#analysis-to') as HTMLInputElement).value, '2026-05-12');
  } finally {
    unmount();
  }
});
