import type { BaseRecord } from '../types.ts';

export type QualityMode = 'relaxed' | 'balanced' | 'strict';

export const QUALITY_MODES: readonly QualityMode[] = ['relaxed', 'balanced', 'strict'] as const;

export interface AppSettingsRecord extends BaseRecord {
  electricityPriceEurPerKwh: number;
  feedInTariffEurPerKwh: number;
  qualityMode: QualityMode;
}

export interface AppSettingsDraftInput {
  electricityPriceEurPerKwh: number | string;
  feedInTariffEurPerKwh: number | string;
  qualityMode: QualityMode;
}

export interface TariffPeriodRecord extends BaseRecord {
  startsOn: string;
  endsOn: string | null;
  electricityPriceEurPerKwh: number;
}

export interface TariffPeriodDraftInput {
  startsOn: string;
  endsOn?: string | null;
  electricityPriceEurPerKwh: number | string;
}

export const DEFAULT_APP_SETTINGS: AppSettingsRecord = {
  id: 1,
  createdAt: '1970-01-01T00:00:00.000Z',
  updatedAt: '1970-01-01T00:00:00.000Z',
  electricityPriceEurPerKwh: 0.305,
  feedInTariffEurPerKwh: 0,
  qualityMode: 'balanced',
};

export const SETTINGS_ROW_ID = 1 as const;
