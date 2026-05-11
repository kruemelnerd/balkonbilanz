import type { PvDailyRecord, PvDay } from '../types.ts';
import { asPvDay } from '../types.ts';

export type PvValidationCode =
  | 'required_field_missing'
  | 'invalid_day_format'
  | 'invalid_number_format'
  | 'negative_value'
  | 'future_or_today_day';

export interface PvValidationIssue {
  code: PvValidationCode;
  field: 'day' | 'generationKwh' | 'source';
  message: string;
  details?: Record<string, string | number>;
}

export interface PvDailyDraftInput {
  day: unknown;
  generationKwh: unknown;
  note?: unknown;
  source: unknown;
}

export interface PvDailyValidationContext {
  referenceDate?: Date;
  existingRecord?: Pick<PvDailyRecord, 'id' | 'day'> | null;
  intent?: 'create' | 'update' | 'upsert';
}

export interface ValidPvDailyInput {
  day: PvDay;
  generationKwh: number;
  source: string;
  note?: string;
  writeMode: 'create' | 'update' | 'upsert';
}

export type PvValidationResult =
  | { ok: true; value: ValidPvDailyInput }
  | { ok: false; issues: PvValidationIssue[] };

const requiredFieldMessage = 'Pflichtfeld fehlt.';

function toTrimmedString(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function parseNumber(value: unknown): number | undefined {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : undefined;
  }

  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return undefined;
  }

  const parsed = Number(trimmed.replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : undefined;
}

function isMissingText(value: unknown): boolean {
  return typeof value !== 'string' || value.trim().length === 0;
}

function normalizeDay(value: unknown): string | undefined {
  const text = toTrimmedString(value);
  if (!text || !/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return undefined;
  }

  const parsed = new Date(`${text}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== text) {
    return undefined;
  }

  return text;
}

function toUtcDay(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function createIssue(
  code: PvValidationCode,
  field: PvValidationIssue['field'],
  message: string,
  details?: Record<string, string | number>,
): PvValidationIssue {
  return { code, field, message, details };
}

export function validatePvDailyEntry(
  input: PvDailyDraftInput,
  context: PvDailyValidationContext = {},
): PvValidationResult {
  const issues: PvValidationIssue[] = [];

  const day = normalizeDay(input.day);
  if (isMissingText(input.day)) {
    issues.push(createIssue('required_field_missing', 'day', requiredFieldMessage));
  } else if (!day) {
    issues.push(createIssue('invalid_day_format', 'day', 'Kalendertag ist ungültig.'));
  }

  const source = toTrimmedString(input.source);
  if (!source) {
    issues.push(createIssue('required_field_missing', 'source', requiredFieldMessage));
  }

  const generationKwh = parseNumber(input.generationKwh);
  if (input.generationKwh === undefined || input.generationKwh === null || (typeof input.generationKwh === 'string' && input.generationKwh.trim().length === 0)) {
    issues.push(createIssue('required_field_missing', 'generationKwh', requiredFieldMessage));
  } else if (generationKwh === undefined) {
    issues.push(createIssue('invalid_number_format', 'generationKwh', 'Ertrag muss eine Zahl sein.'));
  }

  const note = toTrimmedString(input.note);

  if (day) {
    const referenceDay = toUtcDay(context.referenceDate ?? new Date());
    if (day >= referenceDay) {
      issues.push(
        createIssue('future_or_today_day', 'day', 'Nur abgeschlossene vergangene Tage sind erlaubt.', {
          referenceDay,
        }),
      );
    }
  }

  if (generationKwh !== undefined && generationKwh < 0) {
    issues.push(createIssue('negative_value', 'generationKwh', 'Ertrag darf nicht negativ sein.'));
  }

  const writeMode = context.intent === 'update' ? 'update' : context.existingRecord ? 'upsert' : 'create';

  if (issues.length > 0) {
    return { ok: false, issues };
  }

  return {
    ok: true,
    value: {
      day: asPvDay(day!),
      generationKwh: generationKwh!,
      source: source!,
      ...(note ? { note } : {}),
      writeMode,
    },
  };
}
