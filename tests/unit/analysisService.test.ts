import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createAnalysisService } from '../../src/services/analysis/analysisService.ts';
import { asMeterTimestamp, type MeterReadingRecord, type PvDailyRecord } from '../../src/domain/types.ts';
import type { MeterReadingsRepository } from '../../src/repositories/meterReadingsRepository.ts';
import type { PvDailyRepository } from '../../src/repositories/pvDailyRepository.ts';
import type { SettingsRepository } from '../../src/repositories/settingsRepository.ts';
import type { TariffPeriodRecord } from '../../src/domain/settings/settingsTypes.ts';

function createMeterRepository(records: MeterReadingRecord[]): MeterReadingsRepository {
  return {
    async listNewestFirst() {
      return records;
    },
  } as MeterReadingsRepository;
}

function createPvRepository(records: PvDailyRecord[] = []): PvDailyRepository {
  return {
    async listNewestFirst() {
      return records;
    },
  } as PvDailyRepository;
}

function createSettingsRepository(periods: TariffPeriodRecord[]): SettingsRepository {
  return {
    async listTariffPeriods() {
      return periods;
    },
  } as SettingsRepository;
}

test('analysis service resolves live interval costs from saved tariff periods without faking tariff-change intervals', async () => {
  const service = createAnalysisService({
    meterRepository: createMeterRepository([
      {
        id: 3,
        timestamp: asMeterTimestamp('2026-05-06T07:00:00.000Z'),
        obis180Kwh: 112,
        obis280Kwh: 13,
        createdAt: '2026-05-06T07:00:00.000Z',
        updatedAt: '2026-05-06T07:00:00.000Z',
      },
      {
        id: 2,
        timestamp: asMeterTimestamp('2026-05-03T07:00:00.000Z'),
        obis180Kwh: 106,
        obis280Kwh: 12,
        createdAt: '2026-05-03T07:00:00.000Z',
        updatedAt: '2026-05-03T07:00:00.000Z',
      },
      {
        id: 1,
        timestamp: asMeterTimestamp('2026-05-01T07:00:00.000Z'),
        obis180Kwh: 100,
        obis280Kwh: 10,
        createdAt: '2026-05-01T07:00:00.000Z',
        updatedAt: '2026-05-01T07:00:00.000Z',
      },
    ]),
    pvRepository: createPvRepository(),
    settingsRepository: createSettingsRepository([
      {
        id: 2,
        startsOn: '2026-05-05',
        endsOn: null,
        electricityPriceEurPerKwh: 0.42,
        createdAt: '2026-05-05T00:00:00.000Z',
        updatedAt: '2026-05-05T00:00:00.000Z',
      },
      {
        id: 1,
        startsOn: '2026-05-01',
        endsOn: '2026-05-04',
        electricityPriceEurPerKwh: 0.31,
        createdAt: '2026-05-01T00:00:00.000Z',
        updatedAt: '2026-05-01T00:00:00.000Z',
      },
    ]),
  });

  const result = await service.loadAnalysis({ fromDay: '2026-05-01', toDay: '2026-05-06' });

  assert.equal(result.intervals[1]?.cost.status, 'available');
  assert.equal(result.intervals[1]?.cost.amountEur, 1.86);
  assert.equal(result.intervals[1]?.cost.basisPerKwh, 0.31);
  assert.match(result.intervals[1]?.cost.hint ?? '', /Tarifbasis 0\.310 EUR\/kWh/);

  assert.equal(result.intervals[0]?.cost.status, 'unavailable');
  assert.equal(result.intervals[0]?.cost.amountEur, null);
  assert.equal(result.intervals[0]?.cost.basisPerKwh, 0.305);
});
