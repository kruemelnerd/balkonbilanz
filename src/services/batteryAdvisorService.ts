import type { BatteryAdvisorInput, BatteryAdvisorResult } from '../domain/battery/batteryAdvisorTypes.ts';
import { BATTERY_ADVISOR_SCENARIOS } from '../domain/battery/batteryAdvisorTypes.ts';

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

function calculateEffectiveEnergyPerPeriod(input: BatteryAdvisorInput, usableShare: number): number {
  if (!input.analysisBasis.combined) {
    return 0;
  }

  const analysisSignal = (input.analysisBasis.combined.exportKwh * 0.75)
    + (input.analysisBasis.combined.selfConsumptionKwh * 0.25);
  const capacityLimit = input.storageCapacityKwh * usableShare;
  return Math.min(analysisSignal, capacityLimit);
}

function calculateAnnualSavings(input: BatteryAdvisorInput, usableShare: number): number {
  const periodEnergyKwh = calculateEffectiveEnergyPerPeriod(input, usableShare);
  const annualizationFactor = 365 / Math.max(1, input.analysisBasis.analysisPeriodDays);
  const efficiency = input.efficiencyPercent / 100;
  return round(periodEnergyKwh * annualizationFactor * input.analysisBasis.electricityPriceEurPerKwh * efficiency);
}

function calculateBreakEvenYears(batteryPriceEur: number, annualSavingsEur: number): number | null {
  if (annualSavingsEur <= 0) {
    return null;
  }

  return round(batteryPriceEur / annualSavingsEur);
}

export function createBatteryAdvisorService() {
  return {
    calculate(input: BatteryAdvisorInput): BatteryAdvisorResult {
      const hasUsableAnalysisBasis = input.analysisBasis.combined !== null
        && (input.analysisBasis.combined.exportKwh > 0
          || input.analysisBasis.combined.selfConsumptionKwh > 0
          || input.analysisBasis.combined.importKwh > 0);

      const scenarios = BATTERY_ADVISOR_SCENARIOS.map((scenario) => {
        const annualSavingsEur = calculateAnnualSavings(input, scenario.usableShare);
        return {
          name: scenario.name,
          description: scenario.description,
          usableShare: scenario.usableShare,
          annualSavingsEur,
          breakEvenYears: calculateBreakEvenYears(input.batteryPriceEur, annualSavingsEur),
          isUpperBound: scenario.isUpperBound,
        };
      });

      return {
        scenarios,
        hasUsableAnalysisBasis,
        warning: input.analysisBasis.qualityLevel === 'poor'
          ? 'Die Aussagekraft ist derzeit eingeschränkt. Erfasse länger und vollständiger, bevor du eine Speicherkaufentscheidung triffst.'
          : null,
      };
    },
  };
}
