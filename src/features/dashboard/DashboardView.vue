<script setup lang="ts">
import { computed, inject, onMounted, reactive } from 'vue';
import { routerKey, type Router } from 'vue-router';
import { createBrowserCaptureDependencies } from '../../db/database.ts';
import { createAnalysisService } from '../../services/analysis/analysisService.ts';
import { createCaptureStore } from '../../stores/captureStore.ts';
import { createAnalysisStore } from '../../stores/analysisStore.ts';
import type { DataQualityLevel } from '../../domain/analysis/intervalTypes.ts';
import { formatQualityReason } from '../analysis/analysisCopy.ts';

type Mode = 'empty' | 'partial' | 'filled';

interface DashboardSnapshot {
  mode: Mode;
  meterLabel?: string;
  pvLabel?: string;
  heroLabel?: string;
  heroValue?: string;
  heroBadge?: string;
  qualityLevel?: DataQualityLevel;
  qualityReasons?: string[];
}

interface DashboardState {
  mode: Mode;
  meterLabel: string;
  pvLabel: string;
  heroLabel: string;
  heroValue: string;
  heroBadge: string;
  qualityLevel: DataQualityLevel;
  qualityReasons: string[];
}

const props = defineProps<{ snapshot?: DashboardSnapshot }>();
const router = inject<Router | null>(routerKey, null);

function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('de-DE', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function formatDay(value: string): string {
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('de-DE', { dateStyle: 'medium' }).format(date);
}

function createLiveState() {
  const dependencies = createBrowserCaptureDependencies();
  const captureStore = createCaptureStore(dependencies);
  const analysisStore = createAnalysisStore({
    analysisService: createAnalysisService({
      meterRepository: dependencies.meterRepository,
      pvRepository: dependencies.pvRepository,
    }),
  });

  const state = reactive({ loading: true });

  onMounted(async () => {
    await captureStore.loadMeterReadings();
    await captureStore.loadPvEntries();
    await analysisStore.loadAnalysis();
    state.loading = false;
  });

  return { captureStore, analysisStore, state };
}

function createEmptyState(): DashboardState {
  return {
    mode: 'empty',
    meterLabel: 'Noch keine Zählerablesung vorhanden.',
    pvLabel: 'Noch kein PV-Tageswert vorhanden.',
    heroLabel: 'Noch keine Auswertung moeglich',
    heroValue: 'Erfasse zuerst mindestens zwei Zählerstände und einen vergangenen PV-Tag.',
    heroBadge: '',
    qualityLevel: 'limited',
    qualityReasons: ['Erfasse zuerst mindestens zwei Zaehlerstaende und einen vergangenen PV-Tag.'],
  };
}

function countInclusiveDays(fromDay: string, toDay: string): number {
  const from = new Date(`${fromDay}T00:00:00.000Z`);
  const to = new Date(`${toDay}T00:00:00.000Z`);

  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || to.getTime() < from.getTime()) {
    return 0;
  }

  return Math.floor((to.getTime() - from.getTime()) / (24 * 60 * 60 * 1000)) + 1;
}

function deriveLiveState(captureStore: ReturnType<typeof createCaptureStore>, analysisStore: ReturnType<typeof createAnalysisStore>): DashboardState {
  const latestMeter = captureStore.meter.readings[0];
  const latestPv = captureStore.pv.entries[0];
  const combined = analysisStore.combined;
  const quality = analysisStore.quality ?? (latestMeter || latestPv
    ? { level: 'limited' as const, reasons: ['Noch keine kombinierte Auswertung verfuegbar.'] }
    : { level: 'limited' as const, reasons: ['Erfasse zuerst lokale Daten.'] });

  if (!latestMeter && !latestPv) {
    return createEmptyState();
  }

  return {
    mode: latestMeter && latestPv ? 'filled' : 'partial',
    meterLabel: latestMeter ? `Letzte Zaehlerablesung: ${formatDateTime(latestMeter.timestamp)}` : 'Letzte Zaehlerablesung: fehlt noch',
    pvLabel: latestPv ? `Letzter PV-Tageswert: ${formatDay(latestPv.day)}` : 'Letzter PV-Tageswert: fehlt noch',
    heroLabel: 'Eigenverbrauch als Naeherung',
    heroValue: combined ? `${combined.selfConsumptionKwh.toFixed(1)} kWh` : 'Auswertung laeuft noch',
    heroBadge: combined ? 'Naeherung' : '',
    qualityLevel: quality.level,
    qualityReasons: quality.reasons.length > 0
      ? quality.reasons.map((reason) => formatQualityReason(reason, {
          pvDayCount: analysisStore.pvDays.length,
          periodDays: countInclusiveDays(analysisStore.fromDay, analysisStore.toDay),
        }))
      : ['Noch keine kombinierte Auswertung verfuegbar.'],
  };
}

const live = props.snapshot ? null : createLiveState();

const view = computed<DashboardState>(() => {
  if (props.snapshot) {
    if (props.snapshot.mode === 'empty') {
      return createEmptyState();
    }

    return {
      mode: props.snapshot.mode,
      meterLabel: props.snapshot.meterLabel ?? 'Letzte Zaehlerablesung: fehlt noch',
      pvLabel: props.snapshot.pvLabel ?? 'Letzter PV-Tageswert: fehlt noch',
      heroLabel: props.snapshot.heroLabel ?? 'Eigenverbrauch als Naeherung',
      heroValue: props.snapshot.heroValue ?? '—',
      heroBadge: props.snapshot.heroBadge ?? '',
      qualityLevel: props.snapshot.qualityLevel ?? 'limited',
      qualityReasons: (props.snapshot.qualityReasons ?? []).map((reason) => formatQualityReason(reason)),
    };
  }

  if (!live) {
    return createEmptyState();
  }

  if (live.state.loading) {
    return {
      mode: 'partial',
      meterLabel: 'Daten werden geladen …',
      pvLabel: 'Daten werden geladen …',
      heroLabel: 'Datenqualitaet wird geladen',
      heroValue: 'Bitte warten',
      heroBadge: '',
      qualityLevel: 'limited',
      qualityReasons: ['Lokale Daten werden geladen.'],
    };
  }

  return deriveLiveState(live.captureStore, live.analysisStore);
});

function navigateToCapture(hash: 'meter-timestamp' | 'pv-day') {
  if (!router) {
    return;
  }

  void router.push(`/capture#${hash}`);
}
</script>

<template>
  <main class="dashboard-view">
    <header class="dashboard-view__header">
      <h1>Dashboard</h1>
      <p>Mobile-Startpunkt fuer die lokale BalkonBilanz-Auswertung.</p>
    </header>

    <section v-if="view.mode === 'empty'" class="dashboard-card dashboard-card--hero">
      <span v-if="view.heroBadge" class="badge">{{ view.heroBadge }}</span>
      <h2>{{ view.heroLabel }}</h2>
      <p>{{ view.heroValue }}</p>

      <div class="quick-actions">
        <button type="button" @click="navigateToCapture('meter-timestamp')">Zaehlerstand erfassen</button>
        <button type="button" @click="navigateToCapture('pv-day')">PV-Tageswert erfassen</button>
      </div>
    </section>

    <template v-else>
      <section class="dashboard-card dashboard-card--hero">
        <span v-if="view.heroBadge" class="badge">{{ view.heroBadge }}</span>
        <h2>{{ view.heroLabel }}</h2>
        <p class="hero-value">{{ view.heroValue }}</p>
        <p class="hint">Berechnet aus Zaehlerintervallen und PV-Tageswerten.</p>
      </section>

      <section class="dashboard-card dashboard-card--quality">
        <h2>Datenqualitaet</h2>
        <p class="quality-level">{{ view.qualityLevel }}</p>
        <ul>
          <li v-for="reason in view.qualityReasons" :key="reason">{{ reason }}</li>
        </ul>
      </section>

      <section class="dashboard-grid">
        <article class="dashboard-card">
          <h2>Letzte Zaehlerablesung</h2>
          <p>{{ view.meterLabel }}</p>
        </article>

        <article class="dashboard-card">
          <h2>Letzter PV-Tageswert</h2>
          <p>{{ view.pvLabel }}</p>
        </article>
      </section>

      <div class="quick-actions">
        <button type="button" @click="navigateToCapture('meter-timestamp')">Zaehlerstand erfassen</button>
        <button type="button" @click="navigateToCapture('pv-day')">PV-Tageswert erfassen</button>
      </div>
    </template>
  </main>
</template>

<style scoped>
.dashboard-view {
  display: grid;
  gap: 16px;
  padding: 16px;
}

.dashboard-view__header h1,
.dashboard-view__header p,
.dashboard-card h2,
.dashboard-card p,
.dashboard-card ul {
  margin: 0;
}

.dashboard-view__header p,
.hint,
.quality-level {
  color: #6b7280;
}

.dashboard-card {
  background: #fff;
  border: 1px solid rgba(31, 41, 55, 0.12);
  border-radius: 20px;
  display: grid;
  gap: 12px;
  padding: 16px;
}

.dashboard-card--hero {
  background: #f7f8f4;
}

.badge {
  align-self: start;
  background: #1f6b5c;
  border-radius: 999px;
  color: #fff;
  font-size: 0.9rem;
  font-weight: 600;
  padding: 6px 10px;
}

.hero-value {
  font-size: 1.8rem;
  font-weight: 600;
}

.dashboard-grid,
.quick-actions {
  display: grid;
  gap: 12px;
}

.quick-actions button {
  min-height: 44px;
  border-radius: 16px;
  border: 1px solid rgba(31, 41, 55, 0.16);
  background: #fff;
  font: inherit;
  font-weight: 600;
  padding: 12px 14px;
}

ul {
  padding-left: 18px;
}

@media (min-width: 720px) {
  .dashboard-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
