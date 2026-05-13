import type { CombinedKpiResult, DataQualityResult } from '../analysis/intervalTypes.ts';

export interface BatteryAdvisorAnalysisBasis {
  combined: Pick<CombinedKpiResult, 'exportKwh' | 'selfConsumptionKwh' | 'importKwh' | 'autarkyPercent'> | null;
  qualityLevel: DataQualityResult['level'];
  analysisPeriodDays: number;
  electricityPriceEurPerKwh: number;
}

export interface BatteryAdvisorInput {
  batteryPriceEur: number;
  storageCapacityKwh: number;
  efficiencyPercent: number;
  analysisBasis: BatteryAdvisorAnalysisBasis;
}

export interface BatteryAdvisorScenario {
  name: 'Konservativ' | 'Realistisch' | 'Optimistisch' | 'Theoretisches Maximum';
  description: string;
  usableShare: number;
  annualSavingsEur: number;
  breakEvenYears: number | null;
  isUpperBound: boolean;
}

export interface BatteryAdvisorResult {
  scenarios: BatteryAdvisorScenario[];
  warning: string | null;
  hasUsableAnalysisBasis: boolean;
}

export const BATTERY_ADVISOR_SCENARIOS = [
  { name: 'Konservativ', usableShare: 0.25, isUpperBound: false, description: 'Zurückhaltende Nutzung mit nur einem kleinen Teil des täglichen Überschusses.' },
  { name: 'Realistisch', usableShare: 0.5, isUpperBound: false, description: 'Alltagstauglicher Mittelwert für vorsichtige Planung.' },
  { name: 'Optimistisch', usableShare: 0.75, isUpperBound: false, description: 'Ambitionierte, aber noch plausible Nutzung des verfügbaren Potenzials.' },
  { name: 'Theoretisches Maximum', usableShare: 0.95, isUpperBound: true, description: 'Obere Schranke des Potenzials, kein physisches Versprechen.' },
] as const;
