export interface MeterIntervalFlag {
  code: 'suspicious_jump' | 'pv_export_mismatch';
  message: string;
}

export interface IntervalCostResult {
  amountEur: number | null;
  status: 'available' | 'unavailable';
  basisPerKwh?: number;
  hint?: string;
}

export interface MeterIntervalResult {
  start: string;
  end: string;
  durationHours: number;
  durationDays: number;
  importKwh: number;
  exportKwh: number;
  importKwhPerDay: number | null;
  exportKwhPerDay: number | null;
  cost: IntervalCostResult;
  flags: MeterIntervalFlag[];
}

export interface CombinedKpiResult {
  estimateLabel: 'Naeherung';
  warnings: string[];
  qualityLevel: 'good' | 'limited' | 'poor';
  qualityReasons: string[];
  importKwh: number;
  exportKwh: number;
  selfConsumptionKwh: number;
  autarkyPercent: number;
}

export interface DataQualityResult {
  level: 'good' | 'limited' | 'poor';
  reasons: string[];
}
