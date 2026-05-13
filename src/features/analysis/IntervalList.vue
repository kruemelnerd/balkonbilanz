<script setup lang="ts">
import type { AnalysisStore } from '../../stores/analysisStore.ts';

const props = defineProps<{ store: AnalysisStore }>();
</script>

<template>
  <section class="interval-list" aria-label="Intervalle">
    <h2>Intervalle</h2>

    <article v-for="interval in props.store.intervals" :key="`${interval.start}-${interval.end}`" class="interval-row">
      <h3>{{ interval.start }}</h3>
      <dl>
        <div><dt>Ende</dt><dd>{{ interval.end }}</dd></div>
        <div><dt>Dauer</dt><dd>{{ interval.durationDays }} Tage / {{ interval.durationHours }} h</dd></div>
        <div><dt>Bezug</dt><dd>{{ interval.importKwh }} kWh</dd></div>
        <div><dt>Einspeisung</dt><dd>{{ interval.exportKwh }} kWh</dd></div>
        <div><dt>kWh pro Tag</dt><dd>{{ interval.importKwhPerDay ?? '—' }} / {{ interval.exportKwhPerDay ?? '—' }}</dd></div>
        <div class="interval-cost"><dt>Kosten</dt><dd>{{ interval.cost.status === 'available' ? `${interval.cost.amountEur?.toFixed(2)} EUR` : 'Kosten noch nicht verfuegbar' }}</dd></div>
      </dl>

      <p v-if="interval.cost.hint" class="interval-cost-hint">{{ interval.cost.hint }}</p>

      <ul v-if="interval.flags.length > 0" class="interval-flags">
        <li v-for="flag in interval.flags" :key="flag.code">{{ flag.code }}: {{ flag.message }}</li>
      </ul>
    </article>
  </section>
</template>
