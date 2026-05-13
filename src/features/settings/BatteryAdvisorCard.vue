<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { createBatteryAdvisorService } from '../../services/batteryAdvisorService.ts';
import type { BatteryAdvisorAnalysisBasis, BatteryAdvisorInput, BatteryAdvisorResult } from '../../domain/battery/batteryAdvisorTypes.ts';

interface BatteryAdvisorCardContext {
  analysisBasis: BatteryAdvisorAnalysisBasis;
}

const props = defineProps<{
  context: BatteryAdvisorCardContext;
  service?: ReturnType<typeof createBatteryAdvisorService>;
}>();

const service = props.service ?? createBatteryAdvisorService();

const draft = reactive({
  batteryPriceEur: 6800,
  storageCapacityKwh: 8,
  efficiencyPercent: 90,
  analysisPeriodDays: props.context.analysisBasis.analysisPeriodDays,
});

const result = ref<BatteryAdvisorResult | null>(null);
const hasCalculated = ref(false);

const hasUsableBasis = computed(() => props.context.analysisBasis.combined !== null);

function calculate() {
  if (!props.context.analysisBasis.combined) {
    result.value = null;
    return;
  }

  const input: BatteryAdvisorInput = {
    batteryPriceEur: draft.batteryPriceEur,
    storageCapacityKwh: draft.storageCapacityKwh,
    efficiencyPercent: draft.efficiencyPercent,
    analysisBasis: {
      ...props.context.analysisBasis,
      analysisPeriodDays: draft.analysisPeriodDays,
    },
  };

  result.value = service.calculate(input);
  hasCalculated.value = true;
}

watch(
  () => [
    props.context.analysisBasis.analysisPeriodDays,
    props.context.analysisBasis.electricityPriceEurPerKwh,
    props.context.analysisBasis.qualityLevel,
    props.context.analysisBasis.combined?.exportKwh,
    props.context.analysisBasis.combined?.selfConsumptionKwh,
    props.context.analysisBasis.combined?.importKwh,
    props.context.analysisBasis.combined?.autarkyPercent,
  ],
  () => {
    if (hasCalculated.value && hasUsableBasis.value) {
      calculate();
    }
  },
);

function formatEuro(value: number): string {
  return new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
}

function formatYears(value: number | null): string {
  if (value === null) {
    return 'keine Amortisation';
  }

  return `${new Intl.NumberFormat('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(value)} Jahre`;
}
</script>

<template>
  <section class="battery-advisor-card">
    <header>
      <h2>Speicherberater</h2>
      <p>Alle Werte sind Näherungen und basieren auf deinem aktuellen Analysezeitraum.</p>
    </header>

    <div class="advisor-basis" aria-label="Analysebasis">
      <p>Aktueller Analysezeitraum: {{ props.context.analysisBasis.analysisPeriodDays }} Tage</p>
      <p>Aktuelle Datenqualität: {{ props.context.analysisBasis.qualityLevel }}</p>
      <p>Aktueller Strompreis: {{ props.context.analysisBasis.electricityPriceEurPerKwh }}</p>
      <p>Hinweis: Alle Werte bleiben als Näherung gekennzeichnet.</p>
    </div>

    <p v-if="!hasUsableBasis" class="empty-state">Für den Speicherberater brauchst du zuerst Auswertungsdaten aus dem Analysezeitraum.</p>

    <p v-if="result?.warning" class="advisor-warning" role="alert">{{ result.warning }}</p>

    <label for="battery-price">
      Speicherpreis
      <input id="battery-price" v-model.number="draft.batteryPriceEur" inputmode="decimal" type="number" min="0" step="0.01" />
    </label>

    <label for="battery-capacity">
      Speicherkapazität (kWh)
      <input id="battery-capacity" v-model.number="draft.storageCapacityKwh" inputmode="decimal" type="number" min="0" step="0.1" />
    </label>

    <label for="battery-efficiency">
      Wirkungsgrad (%)
      <input id="battery-efficiency" v-model.number="draft.efficiencyPercent" inputmode="decimal" type="number" min="0" max="100" step="1" />
    </label>

    <label for="battery-period-days">
      Betrachtungszeitraum
      <input id="battery-period-days" v-model.number="draft.analysisPeriodDays" inputmode="numeric" type="number" min="1" step="1" />
    </label>

    <button type="button" :disabled="!hasUsableBasis" @click="calculate">Speicherpotenzial berechnen</button>

    <div v-if="result?.scenarios.length" class="advisor-results" aria-live="polite">
      <article v-for="scenario in result.scenarios" :key="scenario.name" class="scenario-card">
        <h3>{{ scenario.name }}</h3>
        <p>{{ scenario.description }}</p>
        <p>Nutzbarer Anteil: {{ Math.round(scenario.usableShare * 100) }}%</p>
        <p>Jahresersparnis: {{ formatEuro(scenario.annualSavingsEur) }} EUR/Jahr</p>
        <p>Break-even: {{ formatYears(scenario.breakEvenYears) }}</p>
        <p v-if="scenario.isUpperBound">Obere Schranke, kein physisches Versprechen.</p>
      </article>
    </div>
  </section>
</template>
