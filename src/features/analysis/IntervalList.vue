<script setup lang="ts">
import { computed } from 'vue';
import type { AnalysisStore } from '../../stores/analysisStore.ts';

const props = defineProps<{
  store: AnalysisStore;
}>();

const intervals = computed(() => [...props.store.intervals].sort((left, right) => right.end.localeCompare(left.end)));

function formatPerDay(value: number | null): string {
  return value === null ? '—' : `${value.toFixed(2)} kWh`;
}
</script>

<template>
  <section class="interval-list" aria-label="Intervalle">
    <header class="card-header">
      <h2>Intervalle</h2>
      <p>Bezug, Einspeisung, Normalisierung und Kosten bleiben pro Intervall transparent.</p>
    </header>

    <p v-if="!intervals.length" class="empty-state">Noch keine Intervalle vorhanden.</p>

    <article v-for="interval in intervals" :key="`${interval.start}-${interval.end}`" class="interval-card">
      <header class="interval-heading">
        <strong>{{ interval.start }}</strong>
        <span>bis</span>
        <strong>{{ interval.end }}</strong>
      </header>

      <dl class="metric-grid">
        <div>
          <dt>Dauer</dt>
          <dd>{{ interval.durationDays }} Tage</dd>
        </div>
        <div>
          <dt>Bezug</dt>
          <dd>{{ interval.importKwh }} kWh</dd>
        </div>
        <div>
          <dt>Einspeisung</dt>
          <dd>{{ interval.exportKwh }} kWh</dd>
        </div>
        <div>
          <dt>kWh pro Tag</dt>
          <dd>Bezug {{ formatPerDay(interval.importKwhPerDay) }}</dd>
          <dd>Einspeisung {{ formatPerDay(interval.exportKwhPerDay) }}</dd>
        </div>
        <div class="cost-section">
          <dt>Kosten</dt>
          <dd class="cost-value">{{ interval.costLabel }}</dd>
          <dd class="cost-hint">Standardpreis 0.305 EUR/kWh als vorlaeufige Basis im Kostenkontext.</dd>
        </div>
      </dl>
    </article>
  </section>
</template>

<style scoped>
.interval-list {
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

.interval-card {
  border: 1px solid rgba(31, 41, 55, 0.08);
  border-radius: 16px;
  display: grid;
  gap: 12px;
  padding: 14px;
}

.interval-heading {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.metric-grid {
  display: grid;
  gap: 12px;
  margin: 0;
}

.metric-grid div {
  display: grid;
  gap: 4px;
}

dt,
.cost-value {
  font-weight: 600;
}

dd {
  margin: 0;
}

.cost-section {
  padding-top: 4px;
}

.cost-hint {
  color: #6b7280;
  font-size: 0.92rem;
}
</style>
