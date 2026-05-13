import type { AppSettingsDraftInput, AppSettingsRecord, TariffPeriodDraftInput, TariffPeriodRecord } from '../domain/settings/settingsTypes.ts';
import { DEFAULT_APP_SETTINGS, SETTINGS_ROW_ID, QUALITY_MODES } from '../domain/settings/settingsTypes.ts';
import {
  createTariffPeriodRecord,
  type ValidationIssue,
  validateTariffPeriodDraft,
} from '../domain/settings/tariffPeriods.ts';
import type { SettingsRepository } from '../repositories/settingsRepository.ts';

export type SettingsServiceFailureKind = 'validation' | 'not-found';

export interface SettingsServiceFailure {
  ok: false;
  kind: SettingsServiceFailureKind;
  issues: ValidationIssue[];
}

export interface SettingsServiceSuccess<T> {
  ok: true;
  value: T;
}

export type SettingsServiceResult<T> = SettingsServiceSuccess<T> | SettingsServiceFailure;

export interface SettingsService {
  loadSettings(): Promise<AppSettingsRecord>;
  saveSettings(input: AppSettingsDraftInput): Promise<SettingsServiceResult<AppSettingsRecord>>;
  listTariffPeriods(): Promise<TariffPeriodRecord[]>;
  saveTariffPeriod(input: TariffPeriodDraftInput & { id?: number }): Promise<SettingsServiceResult<TariffPeriodRecord>>;
  deleteTariffPeriod(id: number): Promise<SettingsServiceResult<{ deleted: true }>>;
}

function normalizeNumber(value: number | string): number {
  return typeof value === 'number' ? value : Number(value.replace(',', '.'));
}

function isQualityMode(value: string): value is AppSettingsRecord['qualityMode'] {
  return QUALITY_MODES.includes(value as AppSettingsRecord['qualityMode']);
}

function validateSettingsInput(input: AppSettingsDraftInput): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const electricityPriceEurPerKwh = normalizeNumber(input.electricityPriceEurPerKwh);
  const feedInTariffEurPerKwh = normalizeNumber(input.feedInTariffEurPerKwh);

  if (!Number.isFinite(electricityPriceEurPerKwh) || electricityPriceEurPerKwh < 0) {
    issues.push({ code: 'invalid_number', field: 'electricityPriceEurPerKwh', message: 'Strompreis muss eine nicht-negative Zahl sein.' });
  }

  if (!Number.isFinite(feedInTariffEurPerKwh) || feedInTariffEurPerKwh < 0) {
    issues.push({ code: 'invalid_number', field: 'feedInTariffEurPerKwh', message: 'Einspeisevergütung muss eine nicht-negative Zahl sein.' });
  }

  if (!isQualityMode(input.qualityMode)) {
    issues.push({ code: 'required_field_missing', field: 'qualityMode', message: 'Datenqualitätsmodus ist erforderlich.' });
  }

  return issues;
}

function buildSettingsRecord(input: AppSettingsDraftInput, now = new Date().toISOString(), existing?: AppSettingsRecord): AppSettingsRecord {
  return {
    id: existing?.id ?? SETTINGS_ROW_ID,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    electricityPriceEurPerKwh: normalizeNumber(input.electricityPriceEurPerKwh),
    feedInTariffEurPerKwh: normalizeNumber(input.feedInTariffEurPerKwh),
    qualityMode: input.qualityMode,
  };
}

export function createSettingsService(repository: SettingsRepository): SettingsService {
  return {
    async loadSettings() {
      return (await repository.loadSettings()) ?? DEFAULT_APP_SETTINGS;
    },

    async saveSettings(input) {
      const issues = validateSettingsInput(input);
      if (issues.length > 0) {
        return { ok: false, kind: 'validation', issues };
      }

      const existing = await repository.loadSettings();
      const saved = await repository.saveSettings(buildSettingsRecord(input, new Date().toISOString(), existing));
      return { ok: true, value: saved };
    },

    listTariffPeriods() {
      return repository.listTariffPeriods();
    },

    async saveTariffPeriod(input) {
      const existingPeriods = await repository.listTariffPeriods();
      const validation = validateTariffPeriodDraft(input, {
        existingPeriods,
        ignoreId: input.id,
      });

      if (!validation.ok) {
        return { ok: false, kind: 'validation', issues: validation.issues };
      }

      const existing = input.id ? await repository.getTariffPeriod(input.id) : undefined;
      const saved = await repository.saveTariffPeriod(createTariffPeriodRecord(input, new Date().toISOString(), existing?.id ?? input.id));
      return { ok: true, value: saved };
    },

    async deleteTariffPeriod(id) {
      const deleted = await repository.deleteTariffPeriod(id);
      if (!deleted) {
        return {
          ok: false,
          kind: 'not-found',
          issues: [{ code: 'required_field_missing', field: 'startsOn', message: 'Tarifperiode wurde nicht gefunden.' }],
        };
      }

      return { ok: true, value: { deleted: true } };
    },
  };
}
