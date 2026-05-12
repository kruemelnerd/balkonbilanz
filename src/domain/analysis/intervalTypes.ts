import type { MeterTimestamp, PvDay } from '../types.ts';

export type DataQualityLevel = 'good' | 'limited' | 'poor';

export interface IntervalCostResult {
  costStatus: 'available' | 'unavailable';
  costBasisEurPerKwh: number;
  costEur: number | null;
  costLabel: string;
}

export interface MeterIntervalResult extends IntervalCostResult {
  start: MeterTimestamp;
  end: MeterTimestamp;
  durationDays: number;
  importKwh: number;
  exportKwh: number;
  importKwhPerDay: number | null;
  exportKwhPerDay: number | null;
  flags: string[];
}

export interface DataQualityResult {
  level: DataQualityLevel;
  reasons: string[];
}

export interface CombinedKpiResult {
  isEstimate: true;
  estimateLabel: 'Naeherung';
  quality: DataQualityResult;
  selfConsumptionKwh: number;
  autarkyPercent: number;
  pvTotalKwh: number;
  exportTotalKwh: number;
  warnings: string[];
  pvDays: PvDay[];
}
