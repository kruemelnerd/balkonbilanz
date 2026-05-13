import type { PvDay } from '../types.ts';
import { asPvDay } from '../types.ts';
import type { SettingsValidationIssue, TariffPeriodRecord } from './types.ts';

export interface TariffPeriodDraftInput {
  startDay: string | PvDay;
  endDay?: string | PvDay | null;
  strompreisEurPerKwh: number;
  einspeiseverguetungEurPerKwh: number;
}

export interface TariffPeriodValidationContext {
  existingPeriods?: TariffPeriodRecord[];
  ignoreId?: number;
}

export interface TariffPeriodValidationSuccess {
  ok: true;
  value: TariffPeriodRecord;
}

export interface TariffPeriodValidationFailure {
  ok: false;
  issues: SettingsValidationIssue[];
}

export type TariffPeriodValidationResult = TariffPeriodValidationSuccess | TariffPeriodValidationFailure;

function isFiniteNumber(value: number): boolean {
  return typeof value === 'number' && Number.isFinite(value);
}

function normalizeDay(value: string | PvDay | null | undefined, field: 'startDay' | 'endDay') {
  if (value == null || value === '') {
    return undefined;
  }

  const normalized = String(value).trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    return { error: { code: 'invalid_tariff_range' as const, field, message: 'Tarifperioden brauchen ein gültiges Datum im Format JJJJ-MM-TT.' } };
  }

  return { value: asPvDay(normalized) };
}

function toDayNumber(value: PvDay): number {
  return new Date(`${value}T00:00:00.000Z`).getTime();
}

function periodEndDay(period: TariffPeriodRecord): PvDay | undefined {
  return period.endDay ?? undefined;
}

function overlaps(left: { startDay: PvDay; endDay?: PvDay | null }, right: { startDay: PvDay; endDay?: PvDay | null }): boolean {
  const leftStart = toDayNumber(left.startDay);
  const leftEnd = left.endDay ? toDayNumber(left.endDay) : Number.POSITIVE_INFINITY;
  const rightStart = toDayNumber(right.startDay);
  const rightEnd = right.endDay ? toDayNumber(right.endDay) : Number.POSITIVE_INFINITY;

  return leftStart <= rightEnd && rightStart <= leftEnd;
}

export function sortTariffPeriods(periods: TariffPeriodRecord[]): TariffPeriodRecord[] {
  return [...periods].sort((left, right) => {
    const startSort = left.startDay.localeCompare(right.startDay);
    if (startSort !== 0) {
      return startSort;
    }

    return (right.id ?? 0) - (left.id ?? 0);
  });
}

export function validateTariffPeriod(
  input: TariffPeriodDraftInput & TariffPeriodValidationContext,
): TariffPeriodValidationResult {
  const issues: SettingsValidationIssue[] = [];

  const startDayResult = normalizeDay(input.startDay, 'startDay');
  if (startDayResult && 'error' in startDayResult) {
    issues.push(startDayResult.error);
  }

  const endDayResult = normalizeDay(input.endDay ?? null, 'endDay');
  if (endDayResult && 'error' in endDayResult) {
    issues.push(endDayResult.error);
  }

  if (!isFiniteNumber(input.strompreisEurPerKwh) || input.strompreisEurPerKwh < 0) {
    issues.push({
      code: 'invalid_tariff_range',
      field: 'strompreisEurPerKwh',
      message: 'Strompreis muss eine nicht negative Zahl sein.',
    });
  }

  if (!isFiniteNumber(input.einspeiseverguetungEurPerKwh) || input.einspeiseverguetungEurPerKwh < 0) {
    issues.push({
      code: 'invalid_tariff_range',
      field: 'einspeiseverguetungEurPerKwh',
      message: 'Einspeisevergütung muss eine nicht negative Zahl sein.',
    });
  }

  if (startDayResult && !('error' in startDayResult) && endDayResult && !('error' in endDayResult)) {
    if (toDayNumber(endDayResult.value) < toDayNumber(startDayResult.value)) {
      issues.push({
        code: 'invalid_tariff_range',
        field: 'endDay',
        message: 'Das Enddatum muss am oder nach dem Startdatum liegen.',
      });
    }
  }

  const normalizedStartDay = startDayResult && !('error' in startDayResult) ? startDayResult.value : undefined;
  const normalizedEndDay = endDayResult && !('error' in endDayResult) ? endDayResult.value : undefined;

  if (issues.length > 0 || !normalizedStartDay) {
    return { ok: false, issues };
  }

  const candidate = {
    startDay: normalizedStartDay,
    endDay: normalizedEndDay ?? null,
  };

  for (const period of input.existingPeriods ?? []) {
    if (input.ignoreId && period.id === input.ignoreId) {
      continue;
    }

    if (overlaps(candidate, period)) {
      issues.push({
        code: 'overlapping_tariff_period',
        field: 'startDay',
        conflictingPeriodId: period.id,
        message: `Diese Tarifperiode überschneidet sich mit Periode ${period.id ?? 'ohne ID'}.`,
      });
      break;
    }
  }

  if (issues.length > 0) {
    return { ok: false, issues };
  }

  return {
    ok: true,
    value: {
      startDay: normalizedStartDay,
      endDay: normalizedEndDay ?? null,
      strompreisEurPerKwh: input.strompreisEurPerKwh,
      einspeiseverguetungEurPerKwh: input.einspeiseverguetungEurPerKwh,
    },
  };
}
