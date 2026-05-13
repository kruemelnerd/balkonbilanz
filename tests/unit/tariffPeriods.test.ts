import assert from 'node:assert/strict';
import { test } from 'node:test';

import { validateTariffPeriod } from '../../src/domain/settings/tariffPeriods.ts';

test('tariff period validator accepts open-ended and gapless periods', () => {
  const openEnded = validateTariffPeriod({
    startDay: '2026-05-01',
    endDay: null,
    strompreisEurPerKwh: 0.305,
    einspeiseverguetungEurPerKwh: 0,
  });

  const gapless = validateTariffPeriod({
    startDay: '2026-05-11',
    endDay: '2026-05-20',
    strompreisEurPerKwh: 0.29,
    einspeiseverguetungEurPerKwh: 0.08,
    existingPeriods: [
      { id: 1, startDay: '2026-05-01', endDay: '2026-05-10', strompreisEurPerKwh: 0.305, einspeiseverguetungEurPerKwh: 0 },
    ],
  });

  assert.equal(openEnded.ok, true);
  assert.equal(gapless.ok, true);
});

test('tariff period validator rejects overlaps with a meaningful conflict reference', () => {
  const result = validateTariffPeriod({
    startDay: '2026-05-05',
    endDay: '2026-05-12',
    strompreisEurPerKwh: 0.29,
    einspeiseverguetungEurPerKwh: 0.08,
    existingPeriods: [
      { id: 7, startDay: '2026-05-01', endDay: '2026-05-10', strompreisEurPerKwh: 0.305, einspeiseverguetungEurPerKwh: 0 },
    ],
  });

  assert.equal(result.ok, false);
  assert.equal(result.issues[0]?.code, 'overlapping_tariff_period');
  assert.equal(result.issues[0]?.conflictingPeriodId, 7);
});
