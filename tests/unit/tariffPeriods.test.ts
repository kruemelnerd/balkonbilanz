import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  validateTariffPeriodDraft,
  type TariffPeriodRecord,
} from '../../src/domain/settings/tariffPeriods.ts';

test('tariff period validation blocks overlapping periods', () => {
  const existing: TariffPeriodRecord[] = [
    {
      id: 1,
      startsOn: '2026-01-01',
      endsOn: '2026-03-31',
      electricityPriceEurPerKwh: 0.29,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
  ];

  const result = validateTariffPeriodDraft(
    {
      startsOn: '2026-03-15',
      endsOn: '2026-04-30',
      electricityPriceEurPerKwh: 0.31,
    },
    { existingPeriods: existing },
  );

  assert.equal(result.ok, false);
  assert.ok(result.issues.some((issue) => issue.code === 'tariff_period_overlap'));
});

test('tariff period validation allows open-ended periods with valid start and price', () => {
  const result = validateTariffPeriodDraft(
    {
      startsOn: '2026-05-01',
      endsOn: null,
      electricityPriceEurPerKwh: 0.32,
    },
    { existingPeriods: [] },
  );

  assert.equal(result.ok, true);
});
