import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createBatteryAdvisorService } from '../../src/services/batteryAdvisorService.ts';

const baseInput = {
  batteryPriceEur: 6800,
  storageCapacityKwh: 40,
  efficiencyPercent: 90,
  analysisBasis: {
    combined: { exportKwh: 40, selfConsumptionKwh: 10, importKwh: 80, autarkyPercent: 20 },
    analysisPeriodDays: 30,
    electricityPriceEurPerKwh: 0.305,
    qualityLevel: 'good' as const,
  },
};

test('advisor savings change when the analysis basis changes', () => {
  const service = createBatteryAdvisorService();

  const lowBasis = service.calculate({
    ...baseInput,
    analysisBasis: { ...baseInput.analysisBasis, combined: { exportKwh: 20, selfConsumptionKwh: 5, importKwh: 80, autarkyPercent: 20 } },
  });

  const highBasis = service.calculate({
    ...baseInput,
    analysisBasis: { ...baseInput.analysisBasis, combined: { exportKwh: 60, selfConsumptionKwh: 25, importKwh: 80, autarkyPercent: 20 } },
  });

  assert.notEqual(lowBasis.scenarios[1].annualSavingsEur, highBasis.scenarios[1].annualSavingsEur);
});

test('advisor returns fixed scenario order and marks the theoretical maximum as an upper bound', () => {
  const service = createBatteryAdvisorService();
  const result = service.calculate({
    ...baseInput,
    analysisBasis: baseInput.analysisBasis,
  });

  assert.deepEqual(result.scenarios.map((scenario) => scenario.name), [
    'Konservativ',
    'Realistisch',
    'Optimistisch',
    'Theoretisches Maximum',
  ]);
  assert.equal(result.scenarios.at(-1)?.isUpperBound, true);
});

test('advisor warns clearly when the analysis quality is poor', () => {
  const service = createBatteryAdvisorService();
  const result = service.calculate({
    ...baseInput,
    analysisBasis: { ...baseInput.analysisBasis, qualityLevel: 'poor' },
  });

  assert.match(result.warning ?? '', /Erfasse länger und vollständiger/);
  assert.equal(result.scenarios[0].breakEvenYears !== null, true);
});
