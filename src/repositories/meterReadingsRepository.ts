import type { MeterReadingRecord, MeterTimestamp } from '../domain/types';

export interface RecordTable<T extends { id?: number }> {
  add(entity: T): Promise<number>;
  put(entity: T): Promise<number>;
  get(key: number): Promise<T | undefined>;
  delete(key: number): Promise<void>;
  toArray(): Promise<T[]>;
}

export interface MeterReadingCreateInput
  extends Omit<MeterReadingRecord, 'id' | 'createdAt' | 'updatedAt'> {}

export interface MeterReadingUpdateInput
  extends Partial<Omit<MeterReadingRecord, 'id' | 'createdAt' | 'updatedAt'>> {}

export interface MeterReadingsRepository {
  create(input: MeterReadingCreateInput): Promise<MeterReadingRecord>;
  update(id: number, patch: MeterReadingUpdateInput): Promise<MeterReadingRecord | undefined>;
  delete(id: number): Promise<boolean>;
  get(id: number): Promise<MeterReadingRecord | undefined>;
  listNewestFirst(): Promise<MeterReadingRecord[]>;
  findByTimestamp(timestamp: MeterTimestamp): Promise<MeterReadingRecord | undefined>;
}

const compareNewestFirst = (left: string, right: string) => right.localeCompare(left);

export function createMeterReadingsRepository(
  table: RecordTable<MeterReadingRecord>,
): MeterReadingsRepository {
  return {
    async create(input) {
      const now = new Date().toISOString();
      const timestampedRecord: MeterReadingRecord = {
        ...input,
        createdAt: now,
        updatedAt: now,
      };

      const id = await table.add(timestampedRecord);
      return { ...timestampedRecord, id };
    },

    async update(id, patch) {
      const existing = await table.get(id);

      if (!existing) {
        return undefined;
      }

      const updated: MeterReadingRecord = {
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
        const timestampSort = compareNewestFirst(left.timestamp, right.timestamp);

        if (timestampSort !== 0) {
          return timestampSort;
        }

        return (right.id ?? 0) - (left.id ?? 0);
      });
    },

    async findByTimestamp(timestamp) {
      const records = await table.toArray();
      return records.find((record) => record.timestamp === timestamp);
    },
  };
}
