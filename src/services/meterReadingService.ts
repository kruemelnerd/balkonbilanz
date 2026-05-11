import type { MeterReadingRecord } from '../domain/types.ts';
import type { MeterReadingsRepository } from '../repositories/meterReadingsRepository.ts';
import {
  validateMeterReading,
  type MeterReadingDraftInput,
  type MeterValidationIssue,
} from '../domain/validation/meterValidation.ts';

export type MeterReadingServiceFailureKind = 'validation' | 'meter-change-required' | 'not-found';

export interface MeterReadingServiceFailure {
  ok: false;
  kind: MeterReadingServiceFailureKind;
  issues: MeterValidationIssue[];
}

export interface MeterReadingServiceSuccess<T> {
  ok: true;
  value: T;
}

export type MeterReadingServiceResult<T> = MeterReadingServiceSuccess<T> | MeterReadingServiceFailure;

export interface MeterReadingService {
  create(input: MeterReadingDraftInput): Promise<MeterReadingServiceResult<MeterReadingRecord>>;
  update(id: number, input: MeterReadingDraftInput): Promise<MeterReadingServiceResult<MeterReadingRecord>>;
  delete(id: number): Promise<MeterReadingServiceResult<{ deleted: true }>>;
}

function isMeterChangeIssue(issues: MeterValidationIssue[]): boolean {
  return issues.some((issue) => issue.code === 'meter_value_decreased');
}

function sortByTimestamp(records: MeterReadingRecord[]): MeterReadingRecord[] {
  return [...records].sort((left, right) => left.timestamp.localeCompare(right.timestamp));
}

export function createMeterReadingService(repository: MeterReadingsRepository): MeterReadingService {
  return {
    async create(input) {
      const existingReadings = await repository.listNewestFirst();
      const validation = validateMeterReading(input, { existingReadings });

      if (!validation.ok) {
        return {
          ok: false,
          kind: isMeterChangeIssue(validation.issues) ? 'meter-change-required' : 'validation',
          issues: validation.issues,
        };
      }

      const created = await repository.create(validation.value);
      return { ok: true, value: created };
    },

    async update(id, input) {
      const existing = await repository.get(id);
      if (!existing) {
        return {
          ok: false,
          kind: 'not-found',
          issues: [
            {
              code: 'required_field_missing',
              field: 'timestamp',
              message: 'Datensatz wurde nicht gefunden.',
            },
          ],
        };
      }

      const validation = validateMeterReading(input, {
        existingReadings: await repository.listNewestFirst(),
        ignoreId: id,
      });

      if (!validation.ok) {
        return {
          ok: false,
          kind: isMeterChangeIssue(validation.issues) ? 'meter-change-required' : 'validation',
          issues: validation.issues,
        };
      }

      const updated = await repository.update(id, validation.value);
      if (!updated) {
        return {
          ok: false,
          kind: 'not-found',
          issues: [
            {
              code: 'required_field_missing',
              field: 'timestamp',
              message: 'Datensatz wurde nicht gefunden.',
            },
          ],
        };
      }

      return { ok: true, value: updated };
    },

    async delete(id) {
      const deleted = await repository.delete(id);
      if (!deleted) {
        return {
          ok: false,
          kind: 'not-found',
          issues: [
            {
              code: 'required_field_missing',
              field: 'timestamp',
              message: 'Datensatz wurde nicht gefunden.',
            },
          ],
        };
      }

      return { ok: true, value: { deleted: true } };
    },
  };
}

export { sortByTimestamp };
