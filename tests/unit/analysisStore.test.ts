import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createAnalysisStore, type AnalysisRange, type AnalysisServiceResult } from '../../src/stores/analysisStore.ts';

function fixedNow(): Date {
  return new Date('2026-05-12T12:00:00.000Z');
}

function makeResult(): AnalysisServiceResult {
  return {
    intervals: [{ label: 'interval' } as never],
    pvDays: [{ label: 'pv-day' } as never],
    combined: { label: 'combined' } as never,
    quality: { level: 'limited', reasons: ['minimal_basis'] },
  };
}

test('initialises analysis range to the latest 30 days', () => {
  const store = createAnalysisStore({
    analysisService: {
      async loadAnalysis(_range: AnalysisRange): Promise<AnalysisServiceResult> {
        return makeResult();
      },
    },
    now: fixedNow,
  });

  assert.equal(store.rangePreset, 30);
  assert.equal(store.fromDay, '2026-04-13');
  assert.equal(store.toDay, '2026-05-12');
});

test('setPreset supports 7, 30, and 90 days and reloads the selected range', async () => {
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

  await store.setPreset(7);
  assert.equal(store.rangePreset, 7);
  assert.equal(store.fromDay, '2026-05-06');
  assert.equal(store.toDay, '2026-05-12');

  await store.setPreset(90);
  assert.equal(store.rangePreset, 90);
  assert.equal(store.fromDay, '2026-02-12');
  assert.equal(store.toDay, '2026-05-12');

  assert.deepEqual(ranges[0], { fromDay: '2026-05-06', toDay: '2026-05-12' });
  assert.deepEqual(ranges[1], { fromDay: '2026-02-12', toDay: '2026-05-12' });
});

test('resetFilters returns the analysis to the 30-day default', async () => {
  const store = createAnalysisStore({
    analysisService: {
      async loadAnalysis(_range: AnalysisRange): Promise<AnalysisServiceResult> {
        return makeResult();
      },
    },
    now: fixedNow,
  });

  await store.setPreset(7);
  await store.resetFilters();

  assert.equal(store.rangePreset, 30);
  assert.equal(store.fromDay, '2026-04-13');
  assert.equal(store.toDay, '2026-05-12');
});

test('loadAnalysis clears loading and sets a readable error when the service fails', async () => {
  const store = createAnalysisStore({
    analysisService: {
      async loadAnalysis(): Promise<AnalysisServiceResult> {
        throw new Error('kaputt');
      },
    },
    now: fixedNow,
  });

  await store.loadAnalysis();

  assert.equal(store.loading, false);
  assert.ok(store.error.length > 0);
});
