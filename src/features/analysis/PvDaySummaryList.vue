<script setup lang="ts">
import { computed } from 'vue';
import type { AnalysisStore } from '../../stores/analysisStore.ts';

const props = defineProps<{
  store: AnalysisStore;
}>();

const pvDays = computed(() => [...props.store.pvDays].sort((left, right) => right.day.localeCompare(left.day)));
</script>

<template>
  <section class="pv-day-summary-list" aria-label="PV-Tageswerte">
    <header class="card-header">
      <h2>PV-Tageswerte</h2>
      <p>Die Tageswerte bleiben separat von den Intervallen sichtbar.</p>
    </header>

    <p v-if="!pvDays.length" class="empty-state">Noch keine PV-Tageswerte vorhanden.</p>

    <article v-for="entry in pvDays" :key="entry.id ?? entry.day" class="pv-day-card">
      <div class="day-line">
        <span class="label">Tageswert</span>
        <strong>{{ entry.day }}</strong>
      </div>
      <div>{{ entry.generationKwh }} kWh</div>
      <div>Quelle: {{ entry.source }}</div>
      <p v-if="entry.note">{{ entry.note }}</p>
    </article>
  </section>
</template>

<style scoped>
.pv-day-summary-list {
  background: #fff;
  border: 1px solid rgba(31, 41, 55, 0.12);
  border-radius: 20px;
  display: grid;
  gap: 16px;
  padding: 16px;
}

.card-header h2,
.card-header p,
.empty-state {
  margin: 0;
}

.card-header p,
.empty-state {
  color: #6b7280;
}

.pv-day-card {
  border: 1px solid rgba(31, 41, 55, 0.08);
  border-radius: 16px;
  display: grid;
  gap: 8px;
  padding: 14px;
}

.day-line {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.label {
  color: #1f6b5c;
  font-weight: 600;
}
</style>
