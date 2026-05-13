import type { SettingsValidationIssue, AppSettingsRecord, TariffPeriodRecord, SettingsQualityMode } from '../domain/settings/types.ts';
import { validateTariffPeriod, type TariffPeriodDraftInput } from '../domain/settings/tariffPeriods.ts';
import { BalkonBilanzDb } from '../db/database.ts';
import { createSettingsRepository, createTariffPeriodsRepository, type SettingsRepository, type TariffPeriodsRepository } from '../repositories/settingsRepository.ts';

export interface SettingsServiceFailure {
  ok: false;
  kind: 'validation' | 'not-found';
  issues: SettingsValidationIssue[];
}

export interface SettingsServiceSuccess<T> {
  ok: true;
  value: T;
}

export type SettingsServiceResult<T> = SettingsServiceSuccess<T> | SettingsServiceFailure;

export interface SettingsServiceDependencies {
  settingsRepository: SettingsRepository;
  tariffPeriodsRepository: TariffPeriodsRepository;
}

export interface SettingsDraftInput {
  strompreisEurPerKwh: number;
  einspeiseverguetungEurPerKwh: number;
  qualityMode: SettingsQualityMode;
}

function defaultDependencies(): SettingsServiceDependencies {
  const db = new BalkonBilanzDb();
  return {
    settingsRepository: createSettingsRepository(db.settings),
    tariffPeriodsRepository: createTariffPeriodsRepository(db.tariffPeriods),
  };
}

function validateSettingsInput(input: SettingsDraftInput): SettingsServiceFailure | null {
  const issues: SettingsValidationIssue[] = [];

  if (!Number.isFinite(input.strompreisEurPerKwh) || input.strompreisEurPerKwh < 0) {
    issues.push({
      code: 'invalid_price',
      field: 'strompreisEurPerKwh',
      message: 'Strompreis muss eine nicht negative Zahl sein.',
    });
  }

  if (!Number.isFinite(input.einspeiseverguetungEurPerKwh) || input.einspeiseverguetungEurPerKwh < 0) {
    issues.push({
      code: 'invalid_price',
      field: 'einspeiseverguetungEurPerKwh',
      message: 'Einspeisevergütung muss eine nicht negative Zahl sein.',
    });
  }

  if (!['relaxed', 'balanced', 'strict'].includes(input.qualityMode)) {
    issues.push({
      code: 'invalid_quality_mode',
      field: 'qualityMode',
      message: 'Der Datenqualitätsmodus muss relaxed, balanced oder strict sein.',
    });
  }

  return issues.length > 0 ? { ok: false, kind: 'validation', issues } : null;
}

export interface SettingsService {
  loadSettings(): Promise<AppSettingsRecord>;
  saveSettings(input: SettingsDraftInput): Promise<SettingsServiceResult<AppSettingsRecord>>;
  listTariffPeriods(): Promise<TariffPeriodRecord[]>;
  saveTariffPeriod(input: TariffPeriodDraftInput & { id?: number }): Promise<SettingsServiceResult<TariffPeriodRecord>>;
  deleteTariffPeriod(id: number): Promise<SettingsServiceResult<{ deleted: true }>>;
}

export function createSettingsService(dependencies: Partial<SettingsServiceDependencies> = {}): SettingsService {
  const fallback = defaultDependencies();
  const settingsRepository = dependencies.settingsRepository ?? fallback.settingsRepository;
  const tariffPeriodsRepository = dependencies.tariffPeriodsRepository ?? fallback.tariffPeriodsRepository;

  return {
    async loadSettings() {
      return settingsRepository.load();
    },

    async saveSettings(input) {
      const validation = validateSettingsInput(input);
      if (validation) {
        return validation;
      }

      const saved = await settingsRepository.save(input);
      return { ok: true, value: saved };
    },

    listTariffPeriods() {
      return tariffPeriodsRepository.list();
    },

    async saveTariffPeriod(input) {
      const existingPeriods = await tariffPeriodsRepository.list();
      const validation = validateTariffPeriod({ ...input, existingPeriods, ignoreId: input.id });

      if (!validation.ok) {
        return validation;
      }

      const existing = input.id ? await tariffPeriodsRepository.get(input.id) : undefined;
      const saved = await tariffPeriodsRepository.save({
        ...validation.value,
        id: input.id,
        createdAt: existing?.createdAt,
        updatedAt: existing?.updatedAt,
      });

      return { ok: true, value: saved };
    },

    async deleteTariffPeriod(id) {
      const deleted = await tariffPeriodsRepository.delete(id);
      if (!deleted) {
        return {
          ok: false,
          kind: 'not-found',
          issues: [
            {
              code: 'required_field_missing',
              field: 'startDay',
              message: 'Die Tarifperiode wurde nicht gefunden.',
            },
          ],
        };
      }

      return { ok: true, value: { deleted: true } };
    },
  };
}
