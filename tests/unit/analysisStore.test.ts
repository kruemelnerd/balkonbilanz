import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createAnalysisStore } from '../../src/stores/analysisStore.ts';
import type { AnalysisService } from '../../src/services/analysis/analysisService.ts';

function createStubService(): AnalysisService & { calls: Array<{ fromDay: string; toDay: string }> } {
  return {
    calls: [],
    async loadAnalysis(range) {
      this.calls.push(range);
      return {
        intervals: [],
        pvDays: [],
        combined: {
          estimateLabel: 'Naeherung',
          warnings: [],
          qualityLevel: 'good',
          qualityReasons: [],
          importKwh: 0,
          exportKwh: 0,
          selfConsumptionKwh: 0,
          autarkyPercent: 0,
        },
        quality: { level: 'good', reasons: [] },
      };
    },
  } as AnalysisService & { calls: Array<{ fromDay: string; toDay: string }> };
}

test('analysis store initialises with the last 30 days and supports presets', async () => {
  const service = createStubService();
  const store = createAnalysisStore({
    analysisService: service,
    today: () => new Date('2026-05-12T12:00:00.000Z'),
  });

  assert.equal(store.rangePreset, 30);
  assert.equal(store.fromDay, '2026-04-13');
  assert.equal(store.toDay, '2026-05-12');

  store.setPreset(7);
  assert.equal(store.rangePreset, 7);
  assert.equal(store.fromDay, '2026-05-06');
  assert.equal(store.toDay, '2026-05-12');

  store.setPreset(90);
  assert.equal(store.rangePreset, 90);
  assert.equal(store.fromDay, '2026-02-12');
  assert.equal(store.toDay, '2026-05-12');

  store.resetFilters();
  assert.equal(store.rangePreset, 30);
  assert.equal(store.fromDay, '2026-04-13');
});

test('analysis store loads data and clears loading on failure', async () => {
  const failingStore = createAnalysisStore({
    analysisService: {
      async loadAnalysis() {
        throw new Error('Analyse konnte nicht geladen werden.');
      },
    },
    today: () => new Date('2026-05-12T12:00:00.000Z'),
  });

  await failingStore.loadAnalysis();
  assert.equal(failingStore.loading, false);
  assert.match(failingStore.error, /Analyse konnte nicht geladen werden/);
});
