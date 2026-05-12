import type { PvDailyRecord } from '../types.ts';
import type { CombinedKpiResult, MeterIntervalResult } from './intervalTypes.ts';
import { evaluateDataQuality } from './evaluateDataQuality.ts';

interface CalculateCombinedKpisOptions {
  periodDays?: number;
}

function uniqueDays(records: PvDailyRecord[]): string[] {
  return [...new Set(records.map((record) => record.day as unknown as string))];
}

export function calculateCombinedKpis(
  intervals: MeterIntervalResult[],
  pvDays: PvDailyRecord[],
  options: CalculateCombinedKpisOptions = {},
): CombinedKpiResult {
  const pvTotalKwh = pvDays.reduce((total, record) => total + record.generationKwh, 0);
  const exportTotalKwh = intervals.reduce((total, interval) => total + interval.exportKwh, 0);
  const importTotalKwh = intervals.reduce((total, interval) => total + interval.importKwh, 0);
  const quality = evaluateDataQuality(intervals, pvDays, options.periodDays ?? Math.max(1, uniqueDays(pvDays).length || intervals.length || 1));
  const warnings: string[] = [];

  if (intervals.length < 2 || pvDays.length < 2) {
    if (quality.level === 'good') {
      quality.level = 'limited';
    }
    if (!quality.reasons.includes('minimal_basis')) {
      quality.reasons.push('minimal_basis');
    }
  }

  if (pvTotalKwh < exportTotalKwh) {
    warnings.push('pv_below_export');
    if (quality.level === 'good') {
      quality.level = 'limited';
    }
  }

  const selfConsumptionKwh = Math.max(0, pvTotalKwh - Math.max(0, exportTotalKwh - importTotalKwh));
  const autarkyPercent = pvTotalKwh > 0 ? Math.min(100, (selfConsumptionKwh / pvTotalKwh) * 100) : 0;

  return {
    isEstimate: true,
    estimateLabel: 'Naeherung',
    quality,
    selfConsumptionKwh,
    autarkyPercent,
    pvTotalKwh,
    exportTotalKwh,
    warnings,
    pvDays: uniqueDays(pvDays) as PvDailyRecord['day'][],
  };
}
