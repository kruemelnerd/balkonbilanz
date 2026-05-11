import type { PvDailyRecord, PvDay } from '../domain/types';
import type { RecordTable } from './meterReadingsRepository';

export interface PvDailyCreateInput extends Omit<PvDailyRecord, 'id' | 'createdAt' | 'updatedAt'> {}

export interface PvDailyUpdateInput extends Partial<Omit<PvDailyRecord, 'id' | 'createdAt' | 'updatedAt'>> {}

export interface PvDailyRepository {
  upsertByDay(input: PvDailyCreateInput): Promise<PvDailyRecord>;
  update(id: number, patch: PvDailyUpdateInput): Promise<PvDailyRecord | undefined>;
  delete(id: number): Promise<boolean>;
  get(id: number): Promise<PvDailyRecord | undefined>;
  listNewestFirst(): Promise<PvDailyRecord[]>;
  findByDay(day: PvDay): Promise<PvDailyRecord | undefined>;
}

const compareNewestFirst = (left: string, right: string) => right.localeCompare(left);

export function createPvDailyRepository(table: RecordTable<PvDailyRecord>): PvDailyRepository {
  return {
    async upsertByDay(input) {
      const now = new Date().toISOString();
      const records = await table.toArray();
      const existing = records.find((record) => record.day === input.day);

      if (!existing) {
        const created: PvDailyRecord = {
          ...input,
          createdAt: now,
          updatedAt: now,
        };

        const id = await table.add(created);
        return { ...created, id };
      }

      const updated: PvDailyRecord = {
        ...existing,
        ...input,
        id: existing.id,
        createdAt: existing.createdAt,
        updatedAt: now,
      };

      await table.put(updated);
      return updated;
    },

    async update(id, patch) {
      const existing = await table.get(id);

      if (!existing) {
        return undefined;
      }

      const updated: PvDailyRecord = {
        ...existing,
        ...patch,
        id,
        createdAt: existing.createdAt,
        updatedAt: new Date().toISOString(),
      };

      await table.put(updated);
      return updated;
    },

    async delete(id) {
      const existing = await table.get(id);

      if (!existing) {
        return false;
      }

      await table.delete(id);
      return true;
    },

    get(id) {
      return table.get(id);
    },

    async listNewestFirst() {
      const records = await table.toArray();

      return [...records].sort((left, right) => {
        const daySort = compareNewestFirst(left.day, right.day);

        if (daySort !== 0) {
          return daySort;
        }

        return (right.id ?? 0) - (left.id ?? 0);
      });
    },

    async findByDay(day) {
      const records = await table.toArray();
      return records.find((record) => record.day === day);
    },
  };
}
