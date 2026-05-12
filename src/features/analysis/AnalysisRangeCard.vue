<script setup lang="ts">
import type { AnalysisStore } from '../../stores/analysisStore.ts';

const props = defineProps<{
  store: AnalysisStore;
}>();
</script>

<template>
  <section class="analysis-range-card" aria-label="Zeitraum">
    <header class="card-header">
      <h2>Zeitraum</h2>
      <p>Analyse startet standardmaessig mit 30 Tagen und laesst sich per Presets oder Datum anpassen.</p>
    </header>

    <p class="range-summary">Aktuell: {{ props.store.fromDay }} bis {{ props.store.toDay }}</p>

    <div class="preset-row" role="group" aria-label="Zeitraum Presets">
      <button type="button" :aria-pressed="props.store.rangePreset === 7" @click="void props.store.setPreset(7)">7 Tage</button>
      <button type="button" :aria-pressed="props.store.rangePreset === 30" @click="void props.store.setPreset(30)">30 Tage</button>
      <button type="button" :aria-pressed="props.store.rangePreset === 90" @click="void props.store.setPreset(90)">90 Tage</button>
    </div>

    <div class="field-grid">
      <label for="analysis-from">
        Von
        <input id="analysis-from" v-model="props.store.fromDay" type="date" @change="void props.store.loadAnalysis()" />
      </label>

      <label for="analysis-to">
        Bis
        <input id="analysis-to" v-model="props.store.toDay" type="date" @change="void props.store.loadAnalysis()" />
      </label>
    </div>

    <div class="actions">
      <button type="button" class="reset-button" @click="void props.store.resetFilters()">Filter zuruecksetzen</button>
    </div>
  </section>
</template>

<style scoped>
.analysis-range-card {
  background: #fff;
  border: 1px solid rgba(31, 41, 55, 0.12);
  border-radius: 20px;
  display: grid;
  gap: 16px;
  padding: 16px;
}

.card-header h2,
.card-header p,
.range-summary {
  margin: 0;
}

.card-header p,
.range-summary {
  color: #6b7280;
}

.preset-row,
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.preset-row button,
.reset-button {
  min-height: 44px;
  border-radius: 999px;
  border: 1px solid rgba(31, 41, 55, 0.18);
  background: #f7f8f4;
  color: #1f2937;
  font: inherit;
  font-weight: 600;
  padding: 10px 14px;
}

.preset-row button[aria-pressed='true'] {
  background: #1f6b5c;
  border-color: #1f6b5c;
  color: #fff;
}

.field-grid {
  display: grid;
  gap: 12px;
}

label {
  display: grid;
  gap: 8px;
  font-weight: 600;
}

input {
  min-height: 44px;
  border: 1px solid rgba(31, 41, 55, 0.18);
  border-radius: 14px;
  font: inherit;
  padding: 10px 12px;
}
</style>
