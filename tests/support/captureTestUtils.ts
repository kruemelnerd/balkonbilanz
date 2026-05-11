import type { MeterReadingRecord, PvDailyRecord } from '../../src/domain/types.ts';
import type { MeterReadingsRepository } from '../../src/repositories/meterReadingsRepository.ts';
import type { PvDailyRepository } from '../../src/repositories/pvDailyRepository.ts';
import { createCaptureStore } from '../../src/stores/captureStore.ts';
import { createMeterReadingService } from '../../src/services/meterReadingService.ts';
import { createPvDailyService } from '../../src/services/pvDailyService.ts';

export function createMemoryMeterRepository(initial: MeterReadingRecord[] = []): MeterReadingsRepository {
  const rows = new Map<number, MeterReadingRecord>(initial.map((record) => [record.id ?? 0, record]));
  let nextId = Math.max(1, ...[0, ...initial.map((record) => record.id ?? 0)]) + 1;

  return {
    async create(input) {
      const created: MeterReadingRecord = {
        ...input,
        id: nextId++,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      rows.set(created.id ?? 0, created);
      return created;
    },
    async update(id, patch) {
      const existing = rows.get(id);
      if (!existing) return undefined;
      const updated: MeterReadingRecord = { ...existing, ...patch, id, createdAt: existing.createdAt, updatedAt: new Date().toISOString() };
      rows.set(id, updated);
      return updated;
    },
    async delete(id) {
      return rows.delete(id);
    },
    async get(id) {
      return rows.get(id);
    },
    async listNewestFirst() {
      return [...rows.values()].sort((left, right) => right.timestamp.localeCompare(left.timestamp));
    },
    async findByTimestamp(timestamp) {
      return [...rows.values()].find((record) => record.timestamp === timestamp);
    },
  };
}

export function createMemoryPvRepository(initial: PvDailyRecord[] = []): PvDailyRepository {
  const rows = new Map<number, PvDailyRecord>(initial.map((record) => [record.id ?? 0, record]));
  let nextId = Math.max(1, ...[0, ...initial.map((record) => record.id ?? 0)]) + 1;

  return {
    async upsertByDay(input) {
      const existing = [...rows.values()].find((record) => record.day === input.day);
      if (!existing) {
        const created: PvDailyRecord = {
          ...input,
          id: nextId++,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        rows.set(created.id ?? 0, created);
        return created;
      }

      const updated: PvDailyRecord = { ...existing, ...input, id: existing.id, createdAt: existing.createdAt, updatedAt: new Date().toISOString() };
      rows.set(existing.id ?? 0, updated);
      return updated;
    },
    async update(id, patch) {
      const existing = rows.get(id);
      if (!existing) return undefined;
      const updated: PvDailyRecord = { ...existing, ...patch, id, createdAt: existing.createdAt, updatedAt: new Date().toISOString() };
      rows.set(id, updated);
      return updated;
    },
    async delete(id) {
      return rows.delete(id);
    },
    async get(id) {
      return rows.get(id);
    },
    async listNewestFirst() {
      return [...rows.values()].sort((left, right) => right.day.localeCompare(left.day));
    },
    async findByDay(day) {
      return [...rows.values()].find((record) => record.day === day);
    },
  };
}

export function createMemoryCaptureStore(options: {
  meter?: MeterReadingRecord[];
  pv?: PvDailyRecord[];
} = {}) {
  const meterRepository = createMemoryMeterRepository(options.meter);
  const pvRepository = createMemoryPvRepository(options.pv);

  return createCaptureStore({
    meterRepository,
    meterService: createMeterReadingService(meterRepository),
    pvRepository,
    pvService: createPvDailyService(pvRepository),
  });
}
