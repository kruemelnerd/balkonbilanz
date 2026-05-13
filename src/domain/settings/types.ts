import type { PvDay } from '../types.ts';

export type SettingsQualityMode = 'relaxed' | 'balanced' | 'strict';

export interface AppSettingsRecord {
  strompreisEurPerKwh: number;
  einspeiseverguetungEurPerKwh: number;
  qualityMode: SettingsQualityMode;
  updatedAt?: string;
}

export interface TariffPeriodRecord {
  id?: number;
  startDay: PvDay;
  endDay?: PvDay | null;
  strompreisEurPerKwh: number;
  einspeiseverguetungEurPerKwh: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface SettingsValidationIssue {
  code:
    | 'invalid_price'
    | 'invalid_quality_mode'
    | 'invalid_tariff_range'
    | 'overlapping_tariff_period'
    | 'required_field_missing';
  field: 'strompreisEurPerKwh' | 'einspeiseverguetungEurPerKwh' | 'qualityMode' | 'startDay' | 'endDay';
  message: string;
  conflictingPeriodId?: number;
}

export const DEFAULT_APP_SETTINGS: AppSettingsRecord = {
  strompreisEurPerKwh: 0.305,
  einspeiseverguetungEurPerKwh: 0,
  qualityMode: 'balanced',
};
