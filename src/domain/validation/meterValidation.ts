import type { MeterReadingRecord, MeterTimestamp } from '../types.ts';
import { asMeterTimestamp } from '../types.ts';

export type MeterValidationCode =
  | 'required_field_missing'
  | 'invalid_timestamp_format'
  | 'invalid_number_format'
  | 'negative_value'
  | 'duplicate_timestamp'
  | 'meter_value_decreased';

export interface MeterValidationIssue {
  code: MeterValidationCode;
  field: 'timestamp' | 'obis180Kwh' | 'obis280Kwh';
  message: string;
  details?: Record<string, string | number>;
}

export interface MeterReadingDraftInput {
  timestamp: unknown;
  obis180Kwh: unknown;
  obis280Kwh: unknown;
  note?: unknown;
}

export interface MeterReadingValidationContext {
  existingReadings?: Array<Pick<MeterReadingRecord, 'id' | 'timestamp' | 'obis180Kwh' | 'obis280Kwh'>>;
  ignoreId?: number;
}

export interface ValidMeterReadingInput {
  timestamp: MeterTimestamp;
  obis180Kwh: number;
  obis280Kwh: number;
  note?: string;
}

export type MeterValidationResult =
  | { ok: true; value: ValidMeterReadingInput }
  | { ok: false; issues: MeterValidationIssue[] };

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

function parseTimestamp(value: unknown): string | undefined {
  const text = toTrimmedString(value);
  if (!text) {
    return undefined;
  }

  const parsed = new Date(text);
  if (Number.isNaN(parsed.getTime())) {
    return undefined;
  }

  return parsed.toISOString();
}

function isMissingText(value: unknown): boolean {
  return typeof value !== 'string' || value.trim().length === 0;
}

function createIssue(
  code: MeterValidationCode,
  field: MeterValidationIssue['field'],
  message: string,
  details?: Record<string, string | number>,
): MeterValidationIssue {
  return { code, field, message, details };
}

function compareTimestamp(left: string, right: string): number {
  return new Date(left).getTime() - new Date(right).getTime();
}

export function validateMeterReading(
  input: MeterReadingDraftInput,
  context: MeterReadingValidationContext = {},
): MeterValidationResult {
  const issues: MeterValidationIssue[] = [];

  const normalizedTimestamp = parseTimestamp(input.timestamp);
  if (isMissingText(input.timestamp)) {
    issues.push(createIssue('required_field_missing', 'timestamp', requiredFieldMessage));
  } else if (!normalizedTimestamp) {
    issues.push(createIssue('invalid_timestamp_format', 'timestamp', 'Zeitpunkt ist ungültig.'));
  }

  const obis180 = parseNumber(input.obis180Kwh);
  if (input.obis180Kwh === undefined || input.obis180Kwh === null || (typeof input.obis180Kwh === 'string' && input.obis180Kwh.trim().length === 0)) {
    issues.push(createIssue('required_field_missing', 'obis180Kwh', requiredFieldMessage));
  } else if (obis180 === undefined) {
    issues.push(createIssue('invalid_number_format', 'obis180Kwh', 'Zaehlerstand muss eine Zahl sein.'));
  }

  const obis280 = parseNumber(input.obis280Kwh);
  if (input.obis280Kwh === undefined || input.obis280Kwh === null || (typeof input.obis280Kwh === 'string' && input.obis280Kwh.trim().length === 0)) {
    issues.push(createIssue('required_field_missing', 'obis280Kwh', requiredFieldMessage));
  } else if (obis280 === undefined) {
    issues.push(createIssue('invalid_number_format', 'obis280Kwh', 'Zaehlerstand muss eine Zahl sein.'));
  }

  const note = toTrimmedString(input.note);

  if (obis180 !== undefined && obis180 < 0) {
    issues.push(createIssue('negative_value', 'obis180Kwh', 'Zaehlerstand darf nicht negativ sein.'));
  }

  if (obis280 !== undefined && obis280 < 0) {
    issues.push(createIssue('negative_value', 'obis280Kwh', 'Zaehlerstand darf nicht negativ sein.'));
  }

  const existingReadings = (context.existingReadings ?? []).filter((reading) => reading.id !== context.ignoreId);

  if (normalizedTimestamp) {
    const duplicate = existingReadings.find((reading) => reading.timestamp === normalizedTimestamp);
    if (duplicate) {
      issues.push(
        createIssue('duplicate_timestamp', 'timestamp', 'Es existiert bereits eine Ablesung mit diesem Zeitpunkt.', {
          duplicateId: duplicate.id ?? 0,
        }),
      );
    }
  }

  if (normalizedTimestamp && obis180 !== undefined && obis280 !== undefined) {
    const earlierReadings = existingReadings
      .filter((reading) => compareTimestamp(reading.timestamp, normalizedTimestamp) < 0)
      .sort((left, right) => compareTimestamp(left.timestamp, right.timestamp));
    const previous = earlierReadings[earlierReadings.length - 1];

    if (previous) {
      if (obis180 < previous.obis180Kwh) {
        issues.push(
          createIssue('meter_value_decreased', 'obis180Kwh', 'Der Zählerstand darf nicht kleiner sein als die vorherige Ablesung.', {
            previousValue: previous.obis180Kwh,
          }),
        );
      }

      if (obis280 < previous.obis280Kwh) {
        issues.push(
          createIssue('meter_value_decreased', 'obis280Kwh', 'Der Zählerstand darf nicht kleiner sein als die vorherige Ablesung.', {
            previousValue: previous.obis280Kwh,
          }),
        );
      }
    }
  }

  if (issues.length > 0) {
    return { ok: false, issues };
  }

  return {
    ok: true,
    value: {
      timestamp: asMeterTimestamp(normalizedTimestamp!),
      obis180Kwh: obis180!,
      obis280Kwh: obis280!,
      ...(note ? { note } : {}),
    },
  };
}
