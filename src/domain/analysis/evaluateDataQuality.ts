import type { PvDailyRecord } from '../types.ts';
import type { DataQualityResult, DataQualityLevel, MeterIntervalResult } from './intervalTypes.ts';

const GOOD_THRESHOLD = 0.8;
const LIMITED_THRESHOLD = 0.4;

function uniqueDays(records: PvDailyRecord[]): number {
  return new Set(records.map((record) => record.day as unknown as string)).size;
}

export function evaluateDataQuality(
  intervals: MeterIntervalResult[],
  pvDays: PvDailyRecord[],
  periodDays: number,
): DataQualityResult {
  const pvCoverage = periodDays > 0 ? uniqueDays(pvDays) / periodDays : 0;
  const hasLongInterval = intervals.some((interval) => interval.durationDays > 7);
  const reasons: string[] = [];

  if (hasLongInterval) {
    reasons.push('interval_over_7_days');
  }

  if (pvCoverage < LIMITED_THRESHOLD) {
    reasons.push('pv_coverage_low');
  } else if (pvCoverage < GOOD_THRESHOLD) {
    reasons.push('pv_coverage_partial');
  }

  let level: DataQualityLevel = 'good';

  if (pvCoverage < LIMITED_THRESHOLD) {
    level = 'poor';
  } else if (hasLongInterval || pvCoverage < GOOD_THRESHOLD) {
    level = 'limited';
  }

  return { level, reasons };
}
