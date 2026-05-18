<script setup lang="ts">
import { computed, onMounted, reactive, watch } from 'vue';
import { createBrowserAnalysisDependencies } from '../../db/database.ts';
import { createAnalysisService } from '../../services/analysis/analysisService.ts';
import { createAnalysisStore, type AnalysisStore } from '../../stores/analysisStore.ts';
import AnalysisRangeCard from './AnalysisRangeCard.vue';
import AnalysisRangeChart from './AnalysisRangeChart.vue';
import { buildAnalysisRangeChartModel } from './analysisRangeChartModel.ts';
import IntervalList from './IntervalList.vue';
import PvDaySummaryList from './PvDaySummaryList.vue';
import { describeCombinedWarning, describeQualityReason } from './analysisCopy.ts';

const props = defineProps<{ store?: AnalysisStore }>();
const usingExternalStore = props.store !== undefined;

const store = reactive(
  props.store ?? createAnalysisStore({
    analysisService: createAnalysisService(createBrowserAnalysisDependencies()),
  }),
);

function rangeDays(): number {
  const start = new Date(`${store.fromDay}T00:00:00.000Z`).getTime();
  const end = new Date(`${store.toDay}T00:00:00.000Z`).getTime();
  return Math.floor((end - start) / 86400000) + 1;
}

const qualityReasons = computed(() => {
  const intervalDays = store.intervals.find((interval) => interval.durationDays > 7)?.durationDays;
  return (store.quality?.reasons ?? []).map((reason) => describeQualityReason(reason, {
    pvDays: store.pvDays.length,
    rangeDays: rangeDays(),
    intervalDays,
  }));
});

const rangeChartModel = computed(() => buildAnalysisRangeChartModel({
  range: { start: store.fromDay, end: store.toDay },
  intervals: store.intervals,
  pvDays: store.pvDays,
  quality: store.quality,
}));

if (!usingExternalStore) {
  watch(
    () => [store.fromDay, store.toDay],
    async () => {
      await store.loadAnalysis();
    },
    { immediate: true },
  );
}

onMounted(async () => {
  if (!usingExternalStore && store.intervals.length === 0 && !store.loading) {
    await store.loadAnalysis();
  }
});
</script>

<template>
  <main class="analysis-view">
    <h1>Analyse</h1>

    <p class="analysis-estimate">{{ store.combined?.estimateLabel ?? 'Naeherung' }}</p>

    <section v-if="store.combined?.warnings.length" class="analysis-warning-card">
      <h2>Plausibilitaetswarnung</h2>
      <p>{{ describeCombinedWarning(store.combined.warnings[0]) }}</p>
    </section>

    <section v-if="qualityReasons.length > 0" class="analysis-quality-card">
      <h2>Datenqualitaet</h2>
      <ul>
        <li v-for="reason in qualityReasons" :key="reason">{{ reason }}</li>
      </ul>
    </section>

    <AnalysisRangeChart :model="rangeChartModel" />
    <AnalysisRangeCard :store="store" />
    <IntervalList :store="store" />
    <PvDaySummaryList :store="store" />
  </main>
</template>
