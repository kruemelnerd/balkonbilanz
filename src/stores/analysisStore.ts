import { reactive } from '@vue/reactivity';
import type { MeterIntervalResult, CombinedKpiResult, DataQualityResult } from '../domain/analysis/intervalTypes.ts';
import type { AnalysisService, AnalysisServiceResult } from '../services/analysis/analysisService.ts';

export type AnalysisRangePreset = 7 | 30 | 90 | null;

export interface AnalysisStoreState {
  rangePreset: AnalysisRangePreset;
  fromDay: string;
  toDay: string;
  loading: boolean;
  error: string;
  intervals: MeterIntervalResult[];
  pvDays: AnalysisServiceResult['pvDays'];
  combined: CombinedKpiResult | null;
  quality: DataQualityResult | null;
}

export interface AnalysisStoreDependencies {
  analysisService: AnalysisService;
  today?: () => Date;
}

export interface AnalysisStore extends AnalysisStoreState {
  setPreset(days: 7 | 30 | 90): void;
  setRange(fromDay: string, toDay: string): void;
  resetFilters(): void;
  loadAnalysis(): Promise<void>;
}

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

function toDay(date: Date): string {
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

function subtractDays(today: Date, days: number): string {
  const copy = new Date(today);
  copy.setUTCDate(copy.getUTCDate() - days);
  return toDay(copy);
}

function buildRange(days: number, today: Date) {
  return {
    fromDay: subtractDays(today, days - 1),
    toDay: toDay(today),
  };
}

export function createAnalysisStore(dependencies: AnalysisStoreDependencies): AnalysisStore {
  const today = dependencies.today ?? (() => new Date());
  const initial = buildRange(30, today());

  const state = reactive<AnalysisStoreState>({
    rangePreset: 30,
    fromDay: initial.fromDay,
    toDay: initial.toDay,
    loading: false,
    error: '',
    intervals: [],
    pvDays: [],
    combined: null,
    quality: null,
  });

  function setPreset(days: 7 | 30 | 90): void {
    const range = buildRange(days, today());
    state.rangePreset = days;
    state.fromDay = range.fromDay;
    state.toDay = range.toDay;
  }

  function setRange(fromDay: string, toDay: string): void {
    state.rangePreset = null;
    state.fromDay = fromDay;
    state.toDay = toDay;
  }

  function resetFilters(): void {
    setPreset(30);
  }

  async function loadAnalysis(): Promise<void> {
    state.loading = true;
    state.error = '';

    try {
      const result = await dependencies.analysisService.loadAnalysis({ fromDay: state.fromDay, toDay: state.toDay });
      state.intervals = result.intervals;
      state.pvDays = result.pvDays;
      state.combined = result.combined;
      state.quality = result.quality;
    } catch (error) {
      state.error = error instanceof Error ? error.message : 'Analyse konnte nicht geladen werden.';
    } finally {
      state.loading = false;
    }
  }

  return Object.assign(state, {
    setPreset,
    setRange,
    resetFilters,
    loadAnalysis,
  });
}
