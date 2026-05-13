import assert from 'node:assert/strict';
import { test } from 'node:test';

import { DEFAULT_APP_SETTINGS } from '../../src/domain/settings/types.ts';
import { createSettingsService } from '../../src/services/settingsService.ts';

test('settings service exposes balanced defaults for new users', async () => {
  const service = createSettingsService();
  const settings = await service.loadSettings();

  assert.deepEqual(settings, DEFAULT_APP_SETTINGS);
});

test('settings service blocks overlapping tariff periods with a clear error code', async () => {
  const service = createSettingsService();

  const first = await service.saveTariffPeriod({
    startDay: '2026-05-01',
    endDay: '2026-05-10',
    strompreisEurPerKwh: 0.29,
    einspeiseverguetungEurPerKwh: 0.08,
  });

  assert.equal(first.ok, true);

  const second = await service.saveTariffPeriod({
    startDay: '2026-05-05',
    endDay: '2026-05-12',
    strompreisEurPerKwh: 0.31,
    einspeiseverguetungEurPerKwh: 0.07,
  });

  assert.equal(second.ok, false);
  assert.equal(second.issues[0]?.code, 'overlapping_tariff_period');
});
