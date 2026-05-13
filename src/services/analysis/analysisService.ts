import type { MeterReadingRecord, PvDailyRecord } from '../../domain/types.ts';
import { calculateCombinedKpis } from '../../domain/analysis/calculateCombinedKpis.ts';
import { calculateMeterIntervals } from '../../domain/analysis/calculateMeterIntervals.ts';
import { evaluateDataQuality } from '../../domain/analysis/evaluateDataQuality.ts';
import type { CombinedKpiResult, DataQualityResult, MeterIntervalResult } from '../../domain/analysis/intervalTypes.ts';
import type { MeterReadingsRepository } from '../../repositories/meterReadingsRepository.ts';
import type { PvDailyRepository } from '../../repositories/pvDailyRepository.ts';

export interface AnalysisRange {
  fromDay: string;
  toDay: string;
}

export interface AnalysisServiceResult {
  intervals: MeterIntervalResult[];
  pvDays: PvDailyRecord[];
  combined: CombinedKpiResult;
  quality: DataQualityResult;
}

export interface AnalysisServiceDependencies {
  meterRepository: MeterReadingsRepository;
  pvRepository: PvDailyRepository;
}

export interface AnalysisService {
  loadAnalysis(range: AnalysisRange): Promise<AnalysisServiceResult>;
}

function normalizeRange(range: AnalysisRange): AnalysisRange {
  return range.fromDay <= range.toDay
    ? range
    : { fromDay: range.toDay, toDay: range.fromDay };
}

function toDay(timestamp: string): string {
  return timestamp.slice(0, 10);
}

function isWithinRange(day: string, range: AnalysisRange): boolean {
  return day >= range.fromDay && day <= range.toDay;
}

function countInclusiveDays(range: AnalysisRange): number {
  const start = new Date(`${range.fromDay}T00:00:00.000Z`).getTime();
  const end = new Date(`${range.toDay}T00:00:00.000Z`).getTime();
  return Math.floor((end - start) / 86400000) + 1;
}

function selectMeterReadings(readings: MeterReadingRecord[], range: AnalysisRange): MeterReadingRecord[] {
  const sorted = [...readings].sort((left, right) => left.timestamp.localeCompare(right.timestamp));
  const inRange = sorted.filter((record) => isWithinRange(toDay(record.timestamp), range));
  const anchor = [...sorted].reverse().find((record) => toDay(record.timestamp) < range.fromDay);

  if (anchor && !inRange.some((record) => record.id === anchor.id)) {
    inRange.unshift(anchor);
  }

  return inRange;
}

export function createAnalysisService(dependencies: AnalysisServiceDependencies): AnalysisService {
  return {
    async loadAnalysis(range) {
      const normalizedRange = normalizeRange(range);
      const meterReadings = await dependencies.meterRepository.listNewestFirst();
      const pvDays = await dependencies.pvRepository.listNewestFirst();
      const meterSubset = selectMeterReadings(meterReadings, normalizedRange);
      const pvSubset = pvDays.filter((record) => isWithinRange(record.day, normalizedRange));
      const intervals = calculateMeterIntervals(meterSubset, { pvDays: pvSubset });
      const quality = evaluateDataQuality({
        intervals,
        pvDays: pvSubset,
        rangeDays: countInclusiveDays(normalizedRange),
      });
      const combined = calculateCombinedKpis({ intervals, pvDays: pvSubset, quality });

      return {
        intervals,
        pvDays: pvSubset,
        combined,
        quality,
      };
    },
  };
}
