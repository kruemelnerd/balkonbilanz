import type { PvDailyRecord } from '../../domain/types.ts';
import { calculateCombinedKpis } from '../../domain/analysis/calculateCombinedKpis.ts';
import { calculateMeterIntervals } from '../../domain/analysis/calculateMeterIntervals.ts';
import type {
  CombinedKpiResult,
  DataQualityResult,
  MeterIntervalResult,
} from '../../domain/analysis/intervalTypes.ts';
import type { MeterReadingsRepository } from '../../repositories/meterReadingsRepository.ts';
import type { PvDailyRepository } from '../../repositories/pvDailyRepository.ts';

export type AnalysisRangePreset = 7 | 30 | 90;

export interface AnalysisRange {
  fromDay: string;
  toDay: string;
}

export interface AnalysisResult {
  intervals: MeterIntervalResult[];
  pvDays: PvDailyRecord[];
  combined: CombinedKpiResult;
  quality: DataQualityResult;
}

export interface AnalysisService {
  loadAnalysis(range: AnalysisRange): Promise<AnalysisResult>;
}

export interface AnalysisServiceDependencies {
  meterRepository: MeterReadingsRepository;
  pvRepository: PvDailyRepository;
  now?: () => Date;
}

const DEFAULT_RANGE_PRESET: AnalysisRangePreset = 30;
const DAY_MS = 24 * 60 * 60 * 1000;

function isSupportedPreset(value: number): value is AnalysisRangePreset {
  return value === 7 || value === 30 || value === 90;
}

function formatDay(value: Date): string {
  return value.toISOString().slice(0, 10);
}

function dayToDate(day: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) {
    return null;
  }

  const date = new Date(`${day}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function addDays(day: string, offset: number): string {
  const date = dayToDate(day);
  if (!date) {
    return day;
  }

  date.setUTCDate(date.getUTCDate() + offset);
  return formatDay(date);
}

function isDayWithinRange(day: string, fromDay: string, toDay: string): boolean {
  return day >= fromDay && day <= toDay;
}

function toMeterDay(timestamp: string): string {
  return timestamp.slice(0, 10);
}

function countInclusiveDays(fromDay: string, toDay: string): number {
  const from = dayToDate(fromDay);
  const to = dayToDate(toDay);

  if (!from || !to || to.getTime() < from.getTime()) {
    return DEFAULT_RANGE_PRESET;
  }

  return Math.floor((to.getTime() - from.getTime()) / DAY_MS) + 1;
}

export function createPresetRange(preset: AnalysisRangePreset, now = new Date()): AnalysisRange {
  const currentDay = formatDay(now);
  return {
    fromDay: addDays(currentDay, -(preset - 1)),
    toDay: currentDay,
  };
}

export function normalizeAnalysisRange(
  range: AnalysisRange,
  now = new Date(),
): { range: AnalysisRange; usedDefault: boolean } {
  const from = dayToDate(range.fromDay);
  const to = dayToDate(range.toDay);

  if (!from || !to || to.getTime() < from.getTime()) {
    return {
      range: createPresetRange(DEFAULT_RANGE_PRESET, now),
      usedDefault: true,
    };
  }

  return {
    range: {
      fromDay: formatDay(from),
      toDay: formatDay(to),
    },
    usedDefault: false,
  };
}

export function clampAnalysisRangePreset(value: number): AnalysisRangePreset {
  return isSupportedPreset(value) ? value : DEFAULT_RANGE_PRESET;
}

export function createAnalysisService(dependencies: AnalysisServiceDependencies): AnalysisService {
  return {
    async loadAnalysis(range) {
      const now = dependencies.now?.() ?? new Date();
      const resolvedRange = normalizeAnalysisRange(range, now).range;
      const meterReadings = await dependencies.meterRepository.listNewestFirst();
      const pvDaysAll = await dependencies.pvRepository.listNewestFirst();
      const pvDays = pvDaysAll.filter((record) => isDayWithinRange(record.day as unknown as string, resolvedRange.fromDay, resolvedRange.toDay));
      const meterReadingsInWindow = meterReadings.filter((record) => toMeterDay(record.timestamp) <= resolvedRange.toDay);
      const intervals = calculateMeterIntervals(meterReadingsInWindow, { pvDailyRecords: pvDays })
        .filter((interval) => isDayWithinRange(interval.end as unknown as string, resolvedRange.fromDay, resolvedRange.toDay));
      const periodDays = countInclusiveDays(resolvedRange.fromDay, resolvedRange.toDay);
      const combined = calculateCombinedKpis(intervals, pvDays, { periodDays });

      return {
        intervals,
        pvDays,
        combined,
        quality: combined.quality,
      };
    },
  };
}
