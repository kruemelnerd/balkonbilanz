import type { MeterIntervalResult } from './intervalTypes.ts';

export interface EvaluateDataQualityOptions {
  intervals: MeterIntervalResult[];
  pvDays: Array<{ day: string }>;
  rangeDays: number;
}

function clampLevel(level: 'good' | 'limited' | 'poor'): 'good' | 'limited' | 'poor' {
  return level;
}

export function evaluateDataQuality(options: EvaluateDataQualityOptions) {
  const reasons: string[] = [];
  const longIntervals = options.intervals.filter((interval) => interval.durationDays > 7);
  const pvCoverage = options.rangeDays > 0 ? options.pvDays.length / options.rangeDays : 0;

  if (longIntervals.length > 0) {
    reasons.push('interval_over_7_days');
  }

  if (options.intervals.length === 0 || options.pvDays.length === 0) {
    reasons.push('minimal_basis');
  }

  if (pvCoverage < 0.5) {
    reasons.push('pv_coverage_partial');
  }

  let level: 'good' | 'limited' | 'poor' = 'good';

  if (options.intervals.length === 0 || options.pvDays.length === 0 || pvCoverage < 0.3) {
    level = 'poor';
  } else if (pvCoverage < 0.8 || longIntervals.length > 0) {
    level = 'limited';
  }

  if (longIntervals.length > 0 && pvCoverage < 0.8) {
    level = 'poor';
  }

  return {
    level: clampLevel(level),
    reasons,
  };
}
