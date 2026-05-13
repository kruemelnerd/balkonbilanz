import type { TariffPeriodDraftInput, TariffPeriodRecord } from './settingsTypes.ts';

export interface ValidationIssue {
  code: 'required_field_missing' | 'invalid_number' | 'invalid_date' | 'tariff_period_overlap' | 'invalid_period_range';
  field: string;
  message: string;
}

export interface ValidationSuccess<T> {
  ok: true;
  value: T;
}

export interface ValidationFailure {
  ok: false;
  issues: ValidationIssue[];
}

export type ValidationResult<T> = ValidationSuccess<T> | ValidationFailure;

export interface TariffPeriodValidationContext {
  existingPeriods: TariffPeriodRecord[];
  ignoreId?: number;
}

function toNumber(value: string | number): number {
  return typeof value === 'number' ? value : Number(value.replace(',', '.'));
}

function isValidDay(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(`${value}T00:00:00.000Z`).getTime());
}

function overlaps(left: { startsOn: string; endsOn: string | null }, right: { startsOn: string; endsOn: string | null }): boolean {
  const leftEnd = left.endsOn ?? '9999-12-31';
  const rightEnd = right.endsOn ?? '9999-12-31';
  return left.startsOn <= rightEnd && right.startsOn <= leftEnd;
}

export function sortTariffPeriodsNewestFirst(periods: TariffPeriodRecord[]): TariffPeriodRecord[] {
  return [...periods].sort((left, right) => right.startsOn.localeCompare(left.startsOn) || (right.id ?? 0) - (left.id ?? 0));
}

export function validateTariffPeriodDraft(
  draft: TariffPeriodDraftInput,
  context: TariffPeriodValidationContext,
): ValidationResult<{ startsOn: string; endsOn: string | null; electricityPriceEurPerKwh: number }> {
  const issues: ValidationIssue[] = [];
  const startsOn = draft.startsOn.trim();
  const endsOn = draft.endsOn?.trim() ? draft.endsOn.trim() : null;
  const electricityPriceEurPerKwh = toNumber(draft.electricityPriceEurPerKwh);

  if (!startsOn) {
    issues.push({ code: 'required_field_missing', field: 'startsOn', message: 'Gültig ab ist erforderlich.' });
  } else if (!isValidDay(startsOn)) {
    issues.push({ code: 'invalid_date', field: 'startsOn', message: 'Gültig ab muss ein gültiges Datum sein.' });
  }

  if (endsOn !== null && !isValidDay(endsOn)) {
    issues.push({ code: 'invalid_date', field: 'endsOn', message: 'Gültig bis muss ein gültiges Datum sein.' });
  }

  if (startsOn && endsOn !== null && isValidDay(startsOn) && isValidDay(endsOn) && endsOn < startsOn) {
    issues.push({ code: 'invalid_period_range', field: 'endsOn', message: 'Gültig bis darf nicht vor Gültig ab liegen.' });
  }

  if (!Number.isFinite(electricityPriceEurPerKwh) || electricityPriceEurPerKwh < 0) {
    issues.push({ code: 'invalid_number', field: 'electricityPriceEurPerKwh', message: 'Strompreis muss eine nicht-negative Zahl sein.' });
  }

  if (issues.length === 0) {
    const candidate = { startsOn, endsOn };
    const overlapping = context.existingPeriods.find((period) => {
      if (context.ignoreId !== undefined && period.id === context.ignoreId) {
        return false;
      }

      return overlaps(candidate, period);
    });

    if (overlapping) {
      issues.push({
        code: 'tariff_period_overlap',
        field: 'startsOn',
        message: `Tarifperiode überlappt mit bestehender Periode ab ${overlapping.startsOn}.`,
      });
    }
  }

  if (issues.length > 0) {
    return { ok: false, issues };
  }

  return {
    ok: true,
    value: {
      startsOn,
      endsOn,
      electricityPriceEurPerKwh,
    },
  };
}

export function createTariffPeriodRecord(
  draft: TariffPeriodDraftInput,
  now = new Date().toISOString(),
  id?: number,
): TariffPeriodRecord {
  const validTo = draft.endsOn?.trim() ? draft.endsOn.trim() : null;
  return {
    id,
    createdAt: now,
    updatedAt: now,
    startsOn: draft.startsOn.trim(),
    endsOn: validTo,
    electricityPriceEurPerKwh: toNumber(draft.electricityPriceEurPerKwh),
  };
}
