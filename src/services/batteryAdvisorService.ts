import type { DataQualityLevel } from '../domain/analysis/intervalTypes.ts';
import { BATTERY_ADVISOR_SCENARIOS } from '../domain/batteryAdvisor/scenarios.ts';
import { DEFAULT_APP_SETTINGS } from '../domain/settings/types.ts';

export interface BatteryAdvisorInput {
  storagePriceEur: number;
  capacityKwh: number;
  efficiency: number;
  analysisPeriodDays: number;
  analysisBasisKwh?: number;
  qualityLevel: DataQualityLevel;
  electricityPriceEurPerKwh?: number;
}

export interface BatteryAdvisorScenarioResult {
  label: string;
  usableShare: number;
  annualSavingsEur: number;
  breakEvenYears: number | null;
  confidenceNote: string;
}

export interface BatteryAdvisorSuccess {
  ok: true;
  warning: string | null;
  scenarios: BatteryAdvisorScenarioResult[];
}

export interface BatteryAdvisorFailure {
  ok: false;
  kind: 'validation';
  issues: Array<{ code: 'invalid_input'; field: string; message: string }>;
}

export type BatteryAdvisorResult = BatteryAdvisorSuccess | BatteryAdvisorFailure;

export interface BatteryAdvisorService {
  calculate(input: BatteryAdvisorInput): Promise<BatteryAdvisorResult>;
}

function isPositiveFinite(value: number): boolean {
  return Number.isFinite(value) && value > 0;
}

function clampEfficiency(value: number): number {
  return Math.min(Math.max(value, 0), 1);
}

function annualCyclesFromPeriodDays(periodDays: number): number {
  return Math.min(Math.max(365 / periodDays, 1), 12);
}

function annualEnergyFromAnalysisBasis(periodDays: number, analysisBasisKwh?: number): number | null {
  if (analysisBasisKwh === undefined) {
    return null;
  }

  return (analysisBasisKwh / periodDays) * 365;
}

function validateInput(input: BatteryAdvisorInput) {
  const issues: BatteryAdvisorFailure['issues'] = [];

  if (!Number.isFinite(input.storagePriceEur) || input.storagePriceEur < 0) {
    issues.push({ code: 'invalid_input', field: 'storagePriceEur', message: 'Der Speicherpreis muss eine nicht negative Zahl sein.' });
  }

  if (!isPositiveFinite(input.capacityKwh)) {
    issues.push({ code: 'invalid_input', field: 'capacityKwh', message: 'Die Kapazität muss größer als 0 sein.' });
  }

  if (!Number.isFinite(input.efficiency) || input.efficiency < 0 || input.efficiency > 1) {
    issues.push({ code: 'invalid_input', field: 'efficiency', message: 'Der Wirkungsgrad muss zwischen 0 und 1 liegen.' });
  }

  if (!isPositiveFinite(input.analysisPeriodDays)) {
    issues.push({ code: 'invalid_input', field: 'analysisPeriodDays', message: 'Der Betrachtungszeitraum muss größer als 0 sein.' });
  }

  if (input.analysisBasisKwh !== undefined && (!Number.isFinite(input.analysisBasisKwh) || input.analysisBasisKwh < 0)) {
    issues.push({ code: 'invalid_input', field: 'analysisBasisKwh', message: 'Die Analysebasis muss eine nicht negative Zahl sein.' });
  }

  if (input.electricityPriceEurPerKwh !== undefined && (!Number.isFinite(input.electricityPriceEurPerKwh) || input.electricityPriceEurPerKwh < 0)) {
    issues.push({ code: 'invalid_input', field: 'electricityPriceEurPerKwh', message: 'Der Strompreis muss eine nicht negative Zahl sein.' });
  }

  return issues;
}

function formatConfidenceNote(qualityLevel: DataQualityLevel): string {
  if (qualityLevel === 'poor') {
    return 'Aussagekraft eingeschränkt — erst längere Datenerfassung abwarten.';
  }

  if (qualityLevel === 'limited') {
    return 'Schätzung auf Basis des aktuellen Analysezeitraums.';
  }

  return 'Schätzung auf Basis des aktuellen Analysezeitraums.';
}

export function createBatteryAdvisorService(): BatteryAdvisorService {
  return {
    async calculate(input) {
      const issues = validateInput(input);
      if (issues.length > 0) {
        return { ok: false, kind: 'validation', issues };
      }

      const electricityPrice = input.electricityPriceEurPerKwh ?? DEFAULT_APP_SETTINGS.strompreisEurPerKwh;
      const annualCycles = annualCyclesFromPeriodDays(input.analysisPeriodDays);
      const efficiency = clampEfficiency(input.efficiency);
      const annualAnalysisEnergy = annualEnergyFromAnalysisBasis(input.analysisPeriodDays, input.analysisBasisKwh);
      const warning = input.qualityLevel === 'poor'
        ? 'Aussagekraft eingeschränkt — erst längere Datenerfassung abwarten.'
        : null;

      return {
        ok: true,
        warning,
        scenarios: BATTERY_ADVISOR_SCENARIOS.map((scenario) => {
          const batteryThroughputKwh = input.capacityKwh * scenario.usableShare * annualCycles * efficiency;
          const annualKwh = annualAnalysisEnergy == null
            ? batteryThroughputKwh
            : Math.min(batteryThroughputKwh, annualAnalysisEnergy);
          const annualSavingsEur = annualKwh * electricityPrice;
          const breakEvenYears = annualSavingsEur > 0 ? input.storagePriceEur / annualSavingsEur : null;

          return {
            label: scenario.label,
            usableShare: scenario.usableShare,
            annualSavingsEur,
            breakEvenYears,
            confidenceNote: formatConfidenceNote(input.qualityLevel),
          };
        }),
      };
    },
  };
}
