<script setup lang="ts">
import { computed } from 'vue';
import { formatGermanDate } from '../../utils/dateFormatting.ts';
import { describeQualityReason } from './analysisCopy.ts';
import type { AnalysisRangeChartModel, ChartSeriesId } from './analysisRangeChartModel.ts';

const props = defineProps<{ model: AnalysisRangeChartModel }>();

function countRangeDays(): number {
  const start = new Date(`${props.model.range.start}T00:00:00.000Z`).getTime();
  const end = new Date(`${props.model.range.end}T00:00:00.000Z`).getTime();
  return Math.floor((end - start) / 86400000) + 1;
}

const qualityHint = computed(() => {
  if (props.model.quality.level === 'good' || props.model.quality.reasons.length === 0) {
    return '';
  }

  return props.model.quality.reasons
    .map((reason) => describeQualityReason(reason, {
      pvDays: props.model.meta.pvCoverageDays,
      rangeDays: countRangeDays(),
    }))
    .join(' · ');
});

const hasData = computed(() =>
  props.model.meterSeries.some((point) => point.value !== null)
  || props.model.pvSeries.some((point) => point.value !== null),
);

function pointsFor(series: ChartSeriesId) {
  if (series === 'pvKwh') {
    return props.model.pvSeries;
  }

  return props.model.meterSeries.filter((point) => point.series === series);
}

function formatValue(value: number | null) {
  return value === null ? '—' : `${value.toFixed(1)} kWh`;
}
</script>

<template>
  <section class="analysis-range-chart" aria-label="Analysezeitraum grafisch">
    <header class="analysis-range-chart__header">
      <h2>Analysezeitraum</h2>
      <p class="analysis-range-chart__subtitle">
        {{ formatGermanDate(props.model.range.start) }} – {{ formatGermanDate(props.model.range.end) }}
        · Qualitaet: {{ props.model.quality.level }}
      </p>
    </header>

    <p v-if="qualityHint" class="analysis-range-chart__quality-hint">{{ qualityHint }}</p>

    <p v-if="!hasData" class="analysis-range-chart__empty">Keine Daten fuer diesen Zeitraum.</p>

    <div v-else class="analysis-range-chart__series-grid">
      <section class="analysis-range-chart__series" aria-label="Netzbezug">
        <h3>Netzbezug</h3>
        <ol>
          <li
            v-for="point in pointsFor('importKwh')"
            :key="`import-${point.x}-${point.value ?? 'gap'}`"
            :data-series="point.series"
            :data-gap="point.qualityFlag === 'gap' ? 'true' : 'false'"
          >
            <span>{{ formatGermanDate(point.x) }}</span>
            <strong>{{ formatValue(point.value) }}</strong>
          </li>
        </ol>
      </section>

      <section class="analysis-range-chart__series" aria-label="Einspeisung">
        <h3>Einspeisung</h3>
        <ol>
          <li
            v-for="point in pointsFor('exportKwh')"
            :key="`export-${point.x}-${point.value ?? 'gap'}`"
            :data-series="point.series"
            :data-gap="point.qualityFlag === 'gap' ? 'true' : 'false'"
          >
            <span>{{ formatGermanDate(point.x) }}</span>
            <strong>{{ formatValue(point.value) }}</strong>
          </li>
        </ol>
      </section>

      <section class="analysis-range-chart__series" aria-label="PV-Ertrag">
        <h3>PV-Ertrag</h3>
        <ol>
          <li
            v-for="point in pointsFor('pvKwh')"
            :key="`pv-${point.x}-${point.value ?? 'gap'}`"
            :data-series="point.series"
            :data-gap="point.qualityFlag === 'gap' ? 'true' : 'false'"
          >
            <span>{{ formatGermanDate(point.x) }}</span>
            <strong>{{ formatValue(point.value) }}</strong>
          </li>
        </ol>
      </section>
    </div>
  </section>
</template>
