import type { MeterReadingRecord, PvDailyRecord } from '../types.ts';
import type { MeterIntervalResult } from './intervalTypes.ts';

const DAY_MS = 24 * 60 * 60 * 1000;
const DEFAULT_COST_PER_KWH = 0.305;
const SUSPICIOUS_JUMP_THRESHOLD_KWH = 50;

interface CalculateMeterIntervalsOptions {
  defaultCostPerKwh?: number;
  tariffPerKwh?: number | null;
  pvDailyRecords?: PvDailyRecord[];
}

function toTime(value: string): number {
  return new Date(value).getTime();
}

function toDay(value: string): string {
  return value.slice(0, 10);
}

function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}

function sumPvWithinRange(records: PvDailyRecord[] | undefined, start: string, end: string): number {
  if (!records?.length) {
    return 0;
  }

  return records.reduce((total, record) => {
    const day = record.day as unknown as string;
    if (day >= toDay(start) && day <= toDay(end)) {
      return total + record.generationKwh;
    }

    return total;
  }, 0);
}

export function calculateMeterIntervals(
  readings: MeterReadingRecord[],
  options: CalculateMeterIntervalsOptions = {},
): MeterIntervalResult[] {
  const sorted = [...readings].sort((left, right) => toTime(right.timestamp) - toTime(left.timestamp));
  const defaultCostPerKwh = options.defaultCostPerKwh ?? DEFAULT_COST_PER_KWH;
  const costStatus: MeterIntervalResult['costStatus'] =
    typeof options.tariffPerKwh === 'number' && Number.isFinite(options.tariffPerKwh) ? 'available' : 'unavailable';
  const costBasisEurPerKwh = costStatus === 'available' ? (options.tariffPerKwh as number) : defaultCostPerKwh;

  return sorted.slice(0, -1).map((current, index) => {
    const previous = sorted[index + 1];
    const durationDays = (toTime(current.timestamp) - toTime(previous.timestamp)) / DAY_MS;
    const importKwh = current.obis180Kwh - previous.obis180Kwh;
    const exportKwh = current.obis280Kwh - previous.obis280Kwh;
    const isValidDuration = Number.isFinite(durationDays) && durationDays > 0;
    const importKwhPerDay = isValidDuration ? importKwh / durationDays : null;
    const exportKwhPerDay = isValidDuration ? exportKwh / durationDays : null;
    const flags: string[] = [];

    if (Math.max(importKwh, exportKwh) >= SUSPICIOUS_JUMP_THRESHOLD_KWH) {
      flags.push('suspicious_jump');
    }

    const pvTotalKwh = sumPvWithinRange(options.pvDailyRecords, previous.timestamp, current.timestamp);
    if (pvTotalKwh > 0 && exportKwh > pvTotalKwh) {
      flags.push('pv_export_mismatch');
    }

    const costEur = roundCurrency(importKwh * costBasisEurPerKwh);

    return {
      start: previous.timestamp,
      end: current.timestamp,
      durationDays,
      importKwh,
      exportKwh,
      importKwhPerDay,
      exportKwhPerDay,
      costStatus,
      costBasisEurPerKwh,
      costEur,
      costLabel: costStatus === 'available' ? `${costEur.toFixed(2)} EUR` : 'Kosten noch nicht verfuegbar',
      flags,
    };
  });
}
