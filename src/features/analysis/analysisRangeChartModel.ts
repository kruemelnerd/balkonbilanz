import type { PvDailyRecord } from '../../domain/types.ts';
import type { DataQualityResult, MeterIntervalResult } from '../../domain/analysis/intervalTypes.ts';

export type ChartSeriesId = 'importKwh' | 'exportKwh' | 'pvKwh';
export type ChartPointSource = 'meter-interval' | 'pv-day';
export type ChartQualityFlag = 'gap' | 'outside-range-trimmed';

export interface AnalysisRangeChartPoint {
  x: string;
  value: number | null;
  series: ChartSeriesId;
  source: ChartPointSource;
  qualityFlag?: ChartQualityFlag;
}

export interface AnalysisRangeChartModel {
  range: { start: string; end: string };
  meterSeries: AnalysisRangeChartPoint[];
  pvSeries: AnalysisRangeChartPoint[];
  quality: {
    level: DataQualityResult['level'];
    reasons: string[];
  };
  meta: {
    meterCoverageDays: number;
    pvCoverageDays: number;
    missingDays: string[];
  };
}

export interface BuildAnalysisRangeChartModelInput {
  range: { start: string; end: string };
  intervals: MeterIntervalResult[];
  pvDays: PvDailyRecord[];
  quality: DataQualityResult | null;
}

function normalizeRange(range: { start: string; end: string }) {
  return range.start <= range.end
    ? range
    : { start: range.end, end: range.start };
}

function toDay(value: string): string {
  return value.slice(0, 10);
}

function buildDays(range: { start: string; end: string }): string[] {
  const days: string[] = [];
  const start = new Date(`${range.start}T00:00:00.000Z`);
  const end = new Date(`${range.end}T00:00:00.000Z`);

  for (let cursor = new Date(start); cursor.getTime() <= end.getTime(); cursor.setUTCDate(cursor.getUTCDate() + 1)) {
    days.push(cursor.toISOString().slice(0, 10));
  }

  return days;
}

function withinRange(day: string, range: { start: string; end: string }): boolean {
  return day >= range.start && day <= range.end;
}

export function buildAnalysisRangeChartModel(input: BuildAnalysisRangeChartModelInput): AnalysisRangeChartModel {
  const range = normalizeRange(input.range);
  const quality = input.quality ?? { level: 'good', reasons: [] };
  const days = buildDays(range);
  const meterByDay = new Map<string, MeterIntervalResult[]>();
  const pvByDay = new Map<string, PvDailyRecord>();

  for (const interval of [...input.intervals].sort((left, right) => left.end.localeCompare(right.end) || left.start.localeCompare(right.start))) {
    const day = toDay(interval.end);

    if (!withinRange(day, range)) {
      continue;
    }

    const existing = meterByDay.get(day) ?? [];
    existing.push(interval);
    meterByDay.set(day, existing);
  }

  for (const pvDay of input.pvDays) {
    const day = toDay(pvDay.day);

    if (withinRange(day, range)) {
      pvByDay.set(day, pvDay);
    }
  }

  const meterSeries: AnalysisRangeChartPoint[] = [];
  const pvSeries: AnalysisRangeChartPoint[] = [];
  const missingDays: string[] = [];

  for (const day of days) {
    const dayIntervals = meterByDay.get(day) ?? [];
    const pvRecord = pvByDay.get(day);

    if (dayIntervals.length === 0) {
      missingDays.push(day);
      meterSeries.push({ x: day, value: null, series: 'importKwh', source: 'meter-interval', qualityFlag: 'gap' });
      meterSeries.push({ x: day, value: null, series: 'exportKwh', source: 'meter-interval', qualityFlag: 'gap' });
    } else {
      for (const interval of dayIntervals) {
        const trimmed = toDay(interval.start) < range.start || toDay(interval.end) > range.end;
        meterSeries.push({
          x: day,
          value: interval.importKwh,
          series: 'importKwh',
          source: 'meter-interval',
          ...(trimmed ? { qualityFlag: 'outside-range-trimmed' as const } : {}),
        });
        meterSeries.push({
          x: day,
          value: interval.exportKwh,
          series: 'exportKwh',
          source: 'meter-interval',
          ...(trimmed ? { qualityFlag: 'outside-range-trimmed' as const } : {}),
        });
      }
    }

    if (!pvRecord) {
      if (!missingDays.includes(day)) {
        missingDays.push(day);
      }

      pvSeries.push({ x: day, value: null, series: 'pvKwh', source: 'pv-day', qualityFlag: 'gap' });
      continue;
    }

    pvSeries.push({ x: day, value: pvRecord.generationKwh, series: 'pvKwh', source: 'pv-day' });
  }

  return {
    range,
    meterSeries,
    pvSeries,
    quality: {
      level: quality.level,
      reasons: [...quality.reasons],
    },
    meta: {
      meterCoverageDays: days.filter((day) => (meterByDay.get(day) ?? []).length > 0).length,
      pvCoverageDays: days.filter((day) => pvByDay.has(day)).length,
      missingDays,
    },
  };
}
