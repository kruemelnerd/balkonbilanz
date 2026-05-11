import type { PvDailyRecord } from '../domain/types.ts';
import { asPvDay, type PvDay } from '../domain/types.ts';
import type { PvDailyRepository } from '../repositories/pvDailyRepository.ts';
import {
  validatePvDailyEntry,
  type PvDailyDraftInput,
  type PvValidationIssue,
} from '../domain/validation/pvValidation.ts';

export type PvDailyServiceFailureKind = 'validation' | 'not-found';

export interface PvDailyServiceFailure {
  ok: false;
  kind: PvDailyServiceFailureKind;
  issues: PvValidationIssue[];
}

export interface PvDailyServiceSuccess<T> {
  ok: true;
  value: T;
}

export type PvDailyServiceResult<T> = PvDailyServiceSuccess<T> | PvDailyServiceFailure;

export interface PvDailyService {
  create(input: PvDailyDraftInput): Promise<PvDailyServiceResult<PvDailyRecord>>;
  update(id: number, input: PvDailyDraftInput): Promise<PvDailyServiceResult<PvDailyRecord>>;
  delete(id: number): Promise<PvDailyServiceResult<{ deleted: true }>>;
}

function notFoundFailure(): PvDailyServiceFailure {
  return {
    ok: false,
    kind: 'not-found',
    issues: [
      {
        code: 'required_field_missing',
        field: 'day',
        message: 'Datensatz wurde nicht gefunden.',
      },
    ],
  };
}

function normalizeDayKey(value: unknown): PvDay | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? asPvDay(trimmed) : undefined;
}

export function createPvDailyService(repository: PvDailyRepository): PvDailyService {
  return {
    async create(input) {
      const existingDay = normalizeDayKey(input.day);
      const existingRecord = existingDay ? await repository.findByDay(existingDay) : undefined;
      const validation = validatePvDailyEntry(input, {
        existingRecord,
        intent: existingRecord ? 'upsert' : 'create',
      });

      if (!validation.ok) {
        return { ok: false, kind: 'validation', issues: validation.issues };
      }

      const created = await repository.upsertByDay(validation.value);
      return { ok: true, value: created };
    },

    async update(id, input) {
      const existing = await repository.get(id);
      if (!existing) {
        return notFoundFailure();
      }

      const targetDay = normalizeDayKey(input.day);
      if (targetDay && targetDay !== existing.day) {
        const dayMatch = await repository.findByDay(targetDay);
        if (dayMatch && dayMatch.id !== id) {
          return {
            ok: false,
            kind: 'validation',
            issues: [
              {
                code: 'future_or_today_day',
                field: 'day',
                message: 'Für diesen Tag existiert bereits ein anderer Eintrag.',
              },
            ],
          };
        }
      }

      const validation = validatePvDailyEntry(input, {
        existingRecord: existing,
        intent: 'update',
      });

      if (!validation.ok) {
        return { ok: false, kind: 'validation', issues: validation.issues };
      }

      const updated = await repository.update(id, validation.value);
      if (!updated) {
        return notFoundFailure();
      }

      return { ok: true, value: updated };
    },

    async delete(id) {
      const deleted = await repository.delete(id);
      if (!deleted) {
        return notFoundFailure();
      }

      return { ok: true, value: { deleted: true } };
    },
  };
}
