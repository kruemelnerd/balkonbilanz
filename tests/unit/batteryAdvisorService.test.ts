import assert from 'node:assert/strict';
import { test } from 'node:test';

import { createBatteryAdvisorService } from '../../src/services/batteryAdvisorService.ts';

test('battery advisor exposes the fixed scenario order and usable-share ladder', async () => {
  const service = createBatteryAdvisorService();
  const result = await service.calculate({
    storagePriceEur: 5200,
    capacityKwh: 8,
    efficiency: 0.92,
    analysisPeriodDays: 30,
    qualityLevel: 'good',
  });

  assert.deepEqual(result.scenarios.map((scenario) => scenario.label), ['konservativ', 'realistisch', 'optimistisch', 'theoretisch']);
  assert.deepEqual(result.scenarios.map((scenario) => scenario.usableShare), [0.25, 0.4, 0.6, 0.8]);
});

test('battery advisor changes savings and break-even with the input parameters', async () => {
  const service = createBatteryAdvisorService();
  const low = await service.calculate({
    storagePriceEur: 5200,
    capacityKwh: 4,
    efficiency: 0.85,
    analysisPeriodDays: 90,
    qualityLevel: 'good',
  });
  const high = await service.calculate({
    storagePriceEur: 5200,
    capacityKwh: 10,
    efficiency: 0.95,
    analysisPeriodDays: 30,
    qualityLevel: 'good',
  });

  assert.notEqual(low.scenarios[1]?.annualSavingsEur, high.scenarios[1]?.annualSavingsEur);
  assert.notEqual(low.scenarios[1]?.breakEvenYears, high.scenarios[1]?.breakEvenYears);
});

test('battery advisor shows a strong warning for poor data quality', async () => {
  const service = createBatteryAdvisorService();
  const result = await service.calculate({
    storagePriceEur: 5200,
    capacityKwh: 8,
    efficiency: 0.92,
    analysisPeriodDays: 30,
    qualityLevel: 'poor',
  });

  assert.match(result.warning ?? '', /Aussagekraft eingeschränkt/);
  assert.match(result.warning ?? '', /erst längere Datenerfassung abwarten/);
});
