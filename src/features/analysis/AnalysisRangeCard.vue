<script setup lang="ts">
import type { AnalysisStore } from '../../stores/analysisStore.ts';

const props = defineProps<{ store: AnalysisStore }>();

function updateFrom(event: Event) {
  props.store.setRange((event.target as HTMLInputElement).value, props.store.toDay);
}

function updateTo(event: Event) {
  props.store.setRange(props.store.fromDay, (event.target as HTMLInputElement).value);
}
</script>

<template>
  <section class="analysis-range-card" aria-label="Analysezeitraum">
    <h2>Analysezeitraum</h2>
    <div class="preset-row">
      <button type="button" data-preset="7" :aria-pressed="props.store.rangePreset === 7" @click="props.store.setPreset(7)">7 Tage</button>
      <button type="button" data-preset="30" :aria-pressed="props.store.rangePreset === 30" @click="props.store.setPreset(30)">30 Tage</button>
      <button type="button" data-preset="90" :aria-pressed="props.store.rangePreset === 90" @click="props.store.setPreset(90)">90 Tage</button>
    </div>

    <label>
      Von
      <input id="analysis-from" type="date" :value="props.store.fromDay" @input="updateFrom" />
    </label>

    <label>
      Bis
      <input id="analysis-to" type="date" :value="props.store.toDay" @input="updateTo" />
    </label>

    <button type="button" class="reset-filters" @click="props.store.resetFilters()">Filter zuruecksetzen</button>
  </section>
</template>
