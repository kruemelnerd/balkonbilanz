import type { MeterReadingRecord, PvDailyRecord } from '../types.ts';
import type { IntervalCostResult, MeterIntervalResult } from './intervalTypes.ts';

export interface CalculateMeterIntervalsOptions {
  pvDays?: PvDailyRecord[];
  tariffPerKwh?: number | null;
  resolveTariffPerKwh?: (interval: { start: string; end: string }) => number | null | undefined;
  standardPricePerKwh?: number;
}

const DEFAULT_STANDARD_PRICE = 0.305;

function toDate(value: string): Date {
  return new Date(value);
}

function toDay(value: string): string {
  return value.slice(0, 10);
}

function differenceInDays(start: string, end: string): number {
  const startTime = toDate(start).getTime();
  const endTime = toDate(end).getTime();
  return (endTime - startTime) / (24 * 60 * 60 * 1000);
}

function round(value: number): number {
  return Math.round(value * 1000) / 1000;
}

function buildCost(importKwh: number, tariffPerKwh?: number | null, standardPricePerKwh = DEFAULT_STANDARD_PRICE): IntervalCostResult {
  if (typeof tariffPerKwh === 'number' && Number.isFinite(tariffPerKwh)) {
    return {
      amountEur: round(importKwh * tariffPerKwh),
      status: 'available',
      basisPerKwh: tariffPerKwh,
      hint: `Tarifbasis ${tariffPerKwh.toFixed(3)} EUR/kWh`,
    };
  }

  return {
    amountEur: null,
    status: 'unavailable',
    basisPerKwh: standardPricePerKwh,
    hint: `Standardpreis ${standardPricePerKwh.toFixed(3)} EUR/kWh`,
  };
}

function sumPvKwhForRange(pvDays: PvDailyRecord[] | undefined, start: string, end: string): number {
  if (!pvDays?.length) {
    return 0;
  }

  const startDay = toDay(start);
  const endDay = toDay(end);

  return pvDays
    .filter((record) => record.day >= startDay && record.day <= endDay)
    .reduce((sum, record) => sum + record.generationKwh, 0);
}

export function calculateMeterIntervals(
  readings: MeterReadingRecord[],
  options: CalculateMeterIntervalsOptions = {},
): MeterIntervalResult[] {
  const sortedReadings = [...readings].sort((left, right) => left.timestamp.localeCompare(right.timestamp));

  const intervals = sortedReadings.slice(1).map((current, index) => {
    const previous = sortedReadings[index];
    const durationDays = differenceInDays(previous.timestamp, current.timestamp);
    const durationHours = durationDays * 24;
    const tariffPerKwh = options.resolveTariffPerKwh?.({ start: previous.timestamp, end: current.timestamp })
      ?? options.tariffPerKwh;
    const importKwh = Math.max(0, round(current.obis180Kwh - previous.obis180Kwh));
    const exportKwh = Math.max(0, round(current.obis280Kwh - previous.obis280Kwh));
    const importKwhPerDay = durationDays > 0 ? round(importKwh / durationDays) : null;
    const exportKwhPerDay = durationDays > 0 ? round(exportKwh / durationDays) : null;
    const flags: MeterIntervalResult['flags'] = [];

    if ((importKwhPerDay ?? 0) > 20 || (exportKwhPerDay ?? 0) > 10) {
      flags.push({ code: 'suspicious_jump', message: 'Auffälliger Zählersprung' });
    }

    const pvTotal = sumPvKwhForRange(options.pvDays, previous.timestamp, current.timestamp);
    if (pvTotal > 0 && pvTotal < exportKwh) {
      flags.push({ code: 'pv_export_mismatch', message: 'PV-Ertrag liegt unter der Einspeisung' });
    }

    return {
      start: previous.timestamp,
      end: current.timestamp,
      durationHours: round(durationHours),
      durationDays: round(durationDays),
      importKwh,
      exportKwh,
      importKwhPerDay,
      exportKwhPerDay,
      cost: buildCost(importKwh, tariffPerKwh, options.standardPricePerKwh),
      flags,
    } satisfies MeterIntervalResult;
  });

  return intervals.reverse();
}
