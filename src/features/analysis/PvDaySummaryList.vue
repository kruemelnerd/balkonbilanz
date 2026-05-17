<script setup lang="ts">
import type { AnalysisStore } from '../../stores/analysisStore.ts';
import { formatGermanDate } from '../../utils/dateFormatting.ts';

const props = defineProps<{ store: AnalysisStore }>();
</script>

<template>
  <section class="pv-day-summary-list" aria-label="PV-Tageswerte">
    <h2>PV-Tageswerte</h2>
    <article v-for="day in props.store.pvDays" :key="day.day" class="pv-day-row">
      <h3>Tageswert {{ formatGermanDate(day.day) }}</h3>
      <p>{{ day.generationKwh }} kWh</p>
    </article>
  </section>
</template>
