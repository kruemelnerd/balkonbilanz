import assert from 'node:assert/strict';
import { test } from 'node:test';

import { createBatteryAdvisorService } from '../../../src/services/batteryAdvisorService.ts';

test('Scenario: Vier Szenarien bleiben in fixer Reihenfolge', async () => {
  const service = createBatteryAdvisorService();
  const result = await service.calculate({
    storagePriceEur: 5200,
    capacityKwh: 8,
    efficiency: 0.92,
    analysisPeriodDays: 30,
    qualityLevel: 'good',
  });

  assert.deepEqual(result.scenarios.map((scenario) => scenario.label), ['konservativ', 'realistisch', 'optimistisch', 'theoretisch']);
});
