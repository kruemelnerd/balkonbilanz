import { reactive } from '@vue/reactivity';
import {
  clampAnalysisRangePreset,
  createPresetRange,
  normalizeAnalysisRange,
  type AnalysisRange,
  type AnalysisRangePreset,
  type AnalysisResult,
  type AnalysisService,
} from '../services/analysis/analysisService.ts';
import type { CombinedKpiResult, DataQualityResult, MeterIntervalResult } from '../domain/analysis/intervalTypes.ts';
import type { PvDailyRecord } from '../domain/types.ts';

export type AnalysisServiceResult = AnalysisResult;

export interface AnalysisStoreDependencies {
  analysisService: AnalysisService;
  now?: () => Date;
}

export interface AnalysisStore {
  rangePreset: AnalysisRangePreset;
  fromDay: string;
  toDay: string;
  loading: boolean;
  error: string;
  intervals: MeterIntervalResult[];
  pvDays: PvDailyRecord[];
  combined: CombinedKpiResult | null;
  quality: DataQualityResult | null;
  loadAnalysis(): Promise<void>;
  setPreset(preset: number): Promise<void>;
  resetFilters(): Promise<void>;
}

const DEFAULT_PRESET: AnalysisRangePreset = 30;

function formatError(error: unknown): string {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return 'Die Analyse konnte nicht geladen werden.';
}

export function createAnalysisStore(dependencies: AnalysisStoreDependencies): AnalysisStore {
  const now = dependencies.now ?? (() => new Date());
  const initialRange = createPresetRange(DEFAULT_PRESET, now());

  const store = reactive<AnalysisStore>({
    rangePreset: DEFAULT_PRESET,
    fromDay: initialRange.fromDay,
    toDay: initialRange.toDay,
    loading: false,
    error: '',
    intervals: [],
    pvDays: [],
    combined: null,
    quality: null,
    async loadAnalysis(): Promise<void> {
      const resolved = normalizeAnalysisRange({ fromDay: store.fromDay, toDay: store.toDay }, now());

      if (resolved.usedDefault) {
        store.rangePreset = DEFAULT_PRESET;
        store.fromDay = resolved.range.fromDay;
        store.toDay = resolved.range.toDay;
      }

      store.loading = true;
      store.error = '';

      try {
        const result = await dependencies.analysisService.loadAnalysis({
          fromDay: store.fromDay,
          toDay: store.toDay,
        });

        store.intervals = result.intervals;
        store.pvDays = result.pvDays;
        store.combined = result.combined;
        store.quality = result.quality;
      } catch (error) {
        store.error = formatError(error);
        store.intervals = [];
        store.pvDays = [];
        store.combined = null;
        store.quality = null;
      } finally {
        store.loading = false;
      }
    },
    async setPreset(preset: number): Promise<void> {
      const resolvedPreset = clampAnalysisRangePreset(preset);
      const range = createPresetRange(resolvedPreset, now());

      store.rangePreset = resolvedPreset;
      store.fromDay = range.fromDay;
      store.toDay = range.toDay;
      await store.loadAnalysis();
    },
    async resetFilters(): Promise<void> {
      await store.setPreset(DEFAULT_PRESET);
    },
  });

  return store;
}
