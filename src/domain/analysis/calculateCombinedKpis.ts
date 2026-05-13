import type { PvDailyRecord } from '../types.ts';
import type { CombinedKpiResult, DataQualityResult, MeterIntervalResult } from './intervalTypes.ts';

export interface CalculateCombinedKpisOptions {
  intervals: MeterIntervalResult[];
  pvDays: PvDailyRecord[];
  quality: DataQualityResult;
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

export function calculateCombinedKpis(options: CalculateCombinedKpisOptions): CombinedKpiResult {
  const importKwh = round(options.intervals.reduce((sum, interval) => sum + interval.importKwh, 0));
  const exportKwh = round(options.intervals.reduce((sum, interval) => sum + interval.exportKwh, 0));
  const pvTotal = round(options.pvDays.reduce((sum, day) => sum + day.generationKwh, 0));
  const warnings: string[] = [];

  if (pvTotal < exportKwh) {
    warnings.push('pv_below_export');
  }

  const selfConsumptionKwh = Math.max(0, round(pvTotal - exportKwh));
  const autarkyPercent = importKwh > 0 ? round((selfConsumptionKwh / importKwh) * 100) : 0;

  const qualityLevel: DataQualityResult['level'] = warnings.length > 0 && options.quality.level !== 'poor'
    ? 'limited'
    : options.quality.level;

  return {
    estimateLabel: 'Naeherung',
    warnings,
    qualityLevel,
    qualityReasons: options.quality.reasons,
    importKwh,
    exportKwh,
    selfConsumptionKwh,
    autarkyPercent,
  };
}
