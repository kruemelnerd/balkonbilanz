import assert from 'node:assert/strict';
import { test } from 'node:test';
import { calculateCombinedKpis } from '../../src/domain/analysis/calculateCombinedKpis.ts';
import type { CombinedKpiResult, MeterIntervalResult, DataQualityResult } from '../../src/domain/analysis/intervalTypes.ts';

const intervals = [] as MeterIntervalResult[];
const quality = { level: 'limited', reasons: ['pv_coverage_partial'] } satisfies DataQualityResult;

test('calculateCombinedKpis produces approximate KPIs with warning labels', () => {
  const result = calculateCombinedKpis({ intervals, pvDays: [], quality }) as CombinedKpiResult;

  assert.equal(result.estimateLabel, 'Naeherung');
  assert.equal(result.qualityLevel, 'limited');
});

test('calculateCombinedKpis flags PV lower than export as suspicious', () => {
  const result = calculateCombinedKpis({
    intervals: [
      {
        start: '2026-05-10T07:00:00.000Z',
        end: '2026-05-12T07:00:00.000Z',
        durationHours: 48,
        durationDays: 2,
        importKwh: 9,
        exportKwh: 4,
        importKwhPerDay: 4.5,
        exportKwhPerDay: 2,
        cost: { amountEur: null, status: 'unavailable' },
        flags: [],
      },
    ],
    pvDays: [{ day: '2026-05-11', generationKwh: 3.1, source: 'manual' }],
    quality,
  }) as CombinedKpiResult;

  assert.ok(result.warnings.includes('pv_below_export'));
});
