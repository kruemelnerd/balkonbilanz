<script setup lang="ts">
import { computed, onMounted, reactive } from 'vue';
import { RouterLink } from 'vue-router';
import { createBrowserCaptureDependencies } from '../../db/database.ts';
import { createAnalysisService } from '../../services/analysis/analysisService.ts';
import { createAnalysisStore, type AnalysisStore } from '../../stores/analysisStore.ts';
import { describeCombinedWarning, describeQualityReason } from '../analysis/analysisCopy.ts';

const props = defineProps<{ store?: AnalysisStore }>();
const usingExternalStore = props.store !== undefined;

const store = reactive(
  props.store ?? createAnalysisStore({
    analysisService: createAnalysisService(createBrowserCaptureDependencies()),
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

onMounted(async () => {
  if (!usingExternalStore) {
    await store.loadAnalysis();
  }
});
</script>

<template>
  <section class="dashboard-view">
    <h1>Dashboard</h1>

    <section v-if="store.combined" class="dashboard-kpi">
      <p class="dashboard-label">{{ store.combined.estimateLabel }}</p>
      <p class="dashboard-value">{{ store.combined.selfConsumptionKwh }} kWh Eigenverbrauch</p>
      <p v-if="store.combined.warnings.length > 0" class="dashboard-warning">
        {{ describeCombinedWarning(store.combined.warnings[0]) }}
      </p>
    </section>

    <section v-if="qualityReasons.length > 0" class="dashboard-quality">
      <h2>Datenqualitaet</h2>
      <ul>
        <li v-for="reason in qualityReasons" :key="reason">{{ reason }}</li>
      </ul>
    </section>

    <section class="dashboard-quick-actions">
      <RouterLink class="quick-action" to="/capture#meter-timestamp">Zählerstand erfassen</RouterLink>
      <RouterLink class="quick-action" to="/capture#pv-day">PV-Tageswert erfassen</RouterLink>
    </section>
  </section>
</template>
