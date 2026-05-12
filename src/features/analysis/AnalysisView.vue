<script setup lang="ts">
import { computed, onMounted, reactive } from 'vue';
import { createBrowserCaptureDependencies } from '../../db/database.ts';
import { createAnalysisService } from '../../services/analysis/analysisService.ts';
import { createAnalysisStore } from '../../stores/analysisStore.ts';
import AnalysisRangeCard from './AnalysisRangeCard.vue';
import IntervalList from './IntervalList.vue';
import PvDaySummaryList from './PvDaySummaryList.vue';
import type { DataQualityLevel } from '../../domain/analysis/intervalTypes.ts';

interface KpiCard {
  label: string;
  value: string;
  muted?: boolean;
}

interface AnalysisSnapshot {
  periodLabel: string;
  qualityLevel: DataQualityLevel;
  qualityReasons: string[];
  warning?: string;
  kpis: KpiCard[];
  combinedLabel?: string;
}

interface AnalysisState {
  periodLabel: string;
  qualityLevel: DataQualityLevel;
  qualityReasons: string[];
  warning: string;
  kpis: KpiCard[];
  combinedLabel: string;
}

const props = defineProps<{ snapshot?: AnalysisSnapshot }>();

function createLiveState() {
  const dependencies = createBrowserCaptureDependencies();
  const analysisStore = createAnalysisStore({
    analysisService: createAnalysisService({
      meterRepository: dependencies.meterRepository,
      pvRepository: dependencies.pvRepository,
    }),
  });
  const state = reactive({ loading: true });

  onMounted(async () => {
    await analysisStore.loadAnalysis();
    state.loading = false;
  });

  return { analysisStore, state };
}

function createLoadingState(): AnalysisState {
  return {
    periodLabel: 'Analysezeitraum wird geladen …',
    qualityLevel: 'limited',
    qualityReasons: ['Lokale Analyse wird geladen.'],
    warning: '',
    kpis: [
      { label: 'Eigenverbrauch', value: '—', muted: true },
      { label: 'Autarkie', value: '—', muted: true },
    ],
    combinedLabel: 'Naeherung',
  };
}

function createEmptyState(): AnalysisState {
  return {
    periodLabel: 'Analysezeitraum: noch nicht geladen',
    qualityLevel: 'limited',
    qualityReasons: ['Noch keine kombinierte Auswertung verfuegbar.'],
    warning: '',
    kpis: [
      { label: 'Eigenverbrauch', value: '—', muted: true },
      { label: 'Autarkie', value: '—', muted: true },
    ],
    combinedLabel: 'Naeherung',
  };
}

function deriveLiveState(analysisStore: ReturnType<typeof createAnalysisStore>): AnalysisState {
  const quality = analysisStore.quality ?? { level: 'limited' as const, reasons: ['Noch keine kombinierte Auswertung verfuegbar.'] };
  const combined = analysisStore.combined;
  const warning = combined?.warnings[0] ?? '';

  return {
    periodLabel: `Analysezeitraum: ${analysisStore.fromDay} bis ${analysisStore.toDay}`,
    qualityLevel: quality.level,
    qualityReasons: quality.reasons.length > 0 ? quality.reasons : ['Noch keine kombinierte Auswertung verfuegbar.'],
    warning,
    kpis: combined
      ? [
          { label: 'Eigenverbrauch', value: `${combined.selfConsumptionKwh.toFixed(1)} kWh`, muted: quality.level === 'poor' },
          { label: 'Autarkie', value: `${combined.autarkyPercent.toFixed(0)} %`, muted: quality.level === 'poor' },
          { label: 'PV gesamt', value: `${combined.pvTotalKwh.toFixed(1)} kWh`, muted: quality.level === 'poor' },
        ]
      : [
          { label: 'Eigenverbrauch', value: '—', muted: true },
          { label: 'Autarkie', value: '—', muted: true },
        ],
    combinedLabel: combined?.estimateLabel ?? 'Naeherung',
  };
}

const live = props.snapshot ? null : createLiveState();

const view = computed<AnalysisState>(() => {
  if (props.snapshot) {
    return {
      periodLabel: props.snapshot.periodLabel,
      qualityLevel: props.snapshot.qualityLevel,
      qualityReasons: props.snapshot.qualityReasons,
      warning: props.snapshot.warning ?? '',
      kpis: props.snapshot.kpis,
      combinedLabel: props.snapshot.combinedLabel ?? 'Naeherung',
    };
  }

  if (!live) {
    return createEmptyState();
  }

  if (live.state.loading) {
    return createLoadingState();
  }

  return deriveLiveState(live.analysisStore);
});

const qualityLabels: DataQualityLevel[] = ['good', 'limited', 'poor'];
</script>

<template>
  <main class="analysis-view">
    <header class="analysis-view__header">
      <h1>Analyse</h1>
      <p>Schaetzung und Naeherung werden hier transparent eingeordnet.</p>
    </header>

    <p class="period-label">{{ view.periodLabel }}</p>

    <section v-if="view.warning" class="warning-card">
      <strong>{{ view.warning }}</strong>
    </section>

    <section class="quality-card">
      <h2>Datenqualitaet</h2>
      <p class="quality-current">{{ view.qualityLevel }}</p>
      <div class="quality-labels" aria-label="Qualitaetsstufen">
        <span v-for="label in qualityLabels" :key="label" :class="['quality-pill', { 'quality-pill--active': label === view.qualityLevel }]">{{ label }}</span>
      </div>
      <ul>
        <li v-for="reason in view.qualityReasons" :key="reason">{{ reason }}</li>
      </ul>
    </section>

    <section class="kpi-grid" :class="{ 'kpi-grid--poor': view.qualityLevel === 'poor' }">
      <article v-for="card in view.kpis" :key="card.label" :class="['kpi-card', { 'kpi-card--muted': card.muted || view.qualityLevel === 'poor' }]">
        <h2>{{ card.label }}</h2>
        <p class="kpi-value">{{ card.value }}</p>
        <p class="kpi-hint">{{ view.combinedLabel }}</p>
      </article>
    </section>

    <section class="analysis-layout">
      <AnalysisRangeCard v-if="!props.snapshot" :store="live!.analysisStore" />
      <IntervalList v-if="!props.snapshot" :store="live!.analysisStore" />
      <PvDaySummaryList v-if="!props.snapshot" :store="live!.analysisStore" />
    </section>
  </main>
</template>

<style scoped>
.analysis-view {
  display: grid;
  gap: 16px;
  padding: 16px;
}

.analysis-view__header h1,
.analysis-view__header p,
.period-label,
.quality-card h2,
.quality-card p,
.quality-card ul,
.warning-card strong,
.kpi-card h2,
.kpi-card p {
  margin: 0;
}

.period-label,
.quality-current,
.kpi-hint {
  color: #6b7280;
}

.warning-card,
.quality-card,
.kpi-card {
  background: #fff;
  border: 1px solid rgba(31, 41, 55, 0.12);
  border-radius: 20px;
  display: grid;
  gap: 12px;
  padding: 16px;
}

.warning-card {
  border-color: #b54708;
  color: #b54708;
}

.quality-labels,
.kpi-grid {
  display: grid;
  gap: 12px;
}

.quality-labels {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.quality-pill {
  border: 1px solid rgba(31, 41, 55, 0.18);
  border-radius: 999px;
  font-weight: 600;
  padding: 8px 10px;
  text-align: center;
}

.quality-pill--active {
  background: #1f6b5c;
  border-color: #1f6b5c;
  color: #fff;
}

.kpi-value {
  font-size: 1.4rem;
  font-weight: 600;
}

.kpi-card--muted {
  opacity: 0.55;
}

.kpi-grid--poor .kpi-card {
  opacity: 0.55;
}

.analysis-layout {
  display: grid;
  gap: 16px;
}

ul {
  padding-left: 18px;
}

@media (min-width: 720px) {
  .kpi-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
