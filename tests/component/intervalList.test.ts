import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { test } from 'node:test';
import { asMeterTimestamp, asPvDay, type MeterReadingRecord, type PvDailyRecord } from '../../src/domain/types.ts';
import { createAnalysisStore, type AnalysisServiceResult } from '../../src/stores/analysisStore.ts';
import { flush, mountVueComponent } from '../support/vueHarness.ts';

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

test('interval list renders newest-first cards with honest cost fallback copy', async () => {
  const store = createAnalysisStore({
    analysisService: {
      async loadAnalysis(): Promise<AnalysisServiceResult> {
        return makeResult();
      },
    },
    now: fixedNow,
  });

  store.intervals = [
    {
      start: asMeterTimestamp('2026-05-01T07:00:00.000Z'),
      end: asMeterTimestamp('2026-05-02T07:00:00.000Z'),
      durationDays: 1,
      importKwh: 7,
      exportKwh: 2,
      importKwhPerDay: 7,
      exportKwhPerDay: 2,
      costStatus: 'unavailable',
      costBasisEurPerKwh: 0.305,
      costEur: 2.14,
      costLabel: 'Kosten noch nicht verfuegbar',
      flags: [],
    },
    {
      start: asMeterTimestamp('2026-05-02T07:00:00.000Z'),
      end: asMeterTimestamp('2026-05-03T07:00:00.000Z'),
      durationDays: 1,
      importKwh: 8,
      exportKwh: 3,
      importKwhPerDay: 8,
      exportKwhPerDay: 3,
      costStatus: 'available',
      costBasisEurPerKwh: 0.305,
      costEur: 2.44,
      costLabel: '2.44 EUR',
      flags: [],
    },
  ];

  const { container, unmount } = await mountVueComponent(resolve('src/features/analysis/IntervalList.vue'), { store });
  try {
    await flush();

    const cards = [...container.querySelectorAll('.interval-card')];
    assert.equal(cards.length, 2);
    assert.ok(cards[0].textContent?.includes('2026-05-03T07:00:00.000Z'));
    assert.ok(container.textContent?.includes('Kosten noch nicht verfuegbar'));

    const hint = container.querySelector('.cost-hint');
    assert.ok(hint?.textContent?.includes('0.305 EUR/kWh') || hint?.textContent?.includes('Standardpreis'));

    const headings = [...container.querySelectorAll('h1, h2, h3, h4')].map((heading) => heading.textContent ?? '');
    assert.ok(!headings.some((heading) => heading.includes('0.305 EUR/kWh') || heading.includes('Standardpreis')));
  } finally {
    unmount();
  }
});

test('pv day summary list keeps Tageswert separate from intervals', async () => {
  const store = createAnalysisStore({
    analysisService: {
      async loadAnalysis(): Promise<AnalysisServiceResult> {
        return makeResult();
      },
    },
    now: fixedNow,
  });

  store.pvDays = [
    {
      id: 1,
      createdAt: '2026-05-03T00:00:00.000Z',
      updatedAt: '2026-05-03T00:00:00.000Z',
      day: asPvDay('2026-05-03'),
      generationKwh: 3.1,
      source: 'manual',
    } satisfies PvDailyRecord,
  ];

  const { container, unmount } = await mountVueComponent(resolve('src/features/analysis/PvDaySummaryList.vue'), { store });
  try {
    await flush();
    assert.ok(container.textContent?.includes('Tageswert'));
  } finally {
    unmount();
  }
});
