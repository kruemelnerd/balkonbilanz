<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import type { DataQualityLevel } from '../../domain/analysis/intervalTypes.ts';
import { createBatteryAdvisorService, type BatteryAdvisorScenarioResult } from '../../services/batteryAdvisorService.ts';

interface BatteryAdvisorSnapshot {
  input?: {
    storagePriceEur: number;
    capacityKwh: number;
    efficiency: number;
    analysisPeriodDays: number;
    qualityLevel: DataQualityLevel;
    electricityPriceEurPerKwh?: number;
  };
}

const props = defineProps<{ snapshot?: BatteryAdvisorSnapshot }>();

const service = createBatteryAdvisorService();
const loading = ref(true);
const warning = ref('');
const scenarios = ref<BatteryAdvisorScenarioResult[]>([]);

const draft = reactive({
  storagePriceEur: 5200,
  capacityKwh: 8,
  efficiency: 0.92,
  analysisPeriodDays: 30,
  qualityLevel: 'good' as DataQualityLevel,
  electricityPriceEurPerKwh: undefined as number | undefined,
});

function formatMoney(value: number): string {
  return `${value.toFixed(2)} €`;
}

function formatBreakEven(value: number | null): string {
  return value == null ? '—' : `${value.toFixed(1)} Jahre`;
}

function setQuality(level: DataQualityLevel) {
  draft.qualityLevel = level;
}

async function calculate() {
  const result = await service.calculate({ ...draft });

  if (!result.ok) {
    warning.value = result.issues[0]?.message ?? '';
    scenarios.value = [];
    return;
  }

  warning.value = result.warning ?? '';
  scenarios.value = result.scenarios;
}

onMounted(async () => {
  if (props.snapshot?.input) {
    Object.assign(draft, props.snapshot.input);
  }

  await calculate();
  loading.value = false;
});
</script>

<template>
  <section class="battery-card settings-card">
    <h2>Speicherberater</h2>

    <div class="field-grid">
      <label class="field">
        <span>Speicherpreis</span>
        <input id="battery-storage-price" v-model.number="draft.storagePriceEur" type="number" step="0.01" min="0" />
      </label>

      <label class="field">
        <span>Kapazität</span>
        <input id="battery-capacity" v-model.number="draft.capacityKwh" type="number" step="0.1" min="0" />
      </label>

      <label class="field">
        <span>Wirkungsgrad</span>
        <input id="battery-efficiency" v-model.number="draft.efficiency" type="number" step="0.01" min="0" max="1" />
      </label>

      <label class="field">
        <span>Betrachtungszeitraum</span>
        <input id="battery-period-days" v-model.number="draft.analysisPeriodDays" type="number" step="1" min="1" />
      </label>
    </div>

    <div class="segmented" role="radiogroup" aria-label="Datenqualität">
      <button type="button" :class="['segmented__button', { 'segmented__button--active': draft.qualityLevel === 'good' }]" @click="setQuality('good')">good</button>
      <button type="button" :class="['segmented__button', { 'segmented__button--active': draft.qualityLevel === 'limited' }]" @click="setQuality('limited')">limited</button>
      <button type="button" :class="['segmented__button', { 'segmented__button--active': draft.qualityLevel === 'poor' }]" @click="setQuality('poor')">poor</button>
    </div>

    <p class="helper">Speicher-Szenarien sind Schätzungen auf Basis des aktuellen Analysezeitraums.</p>
    <button type="button" class="primary-action battery-card__cta" @click="calculate">Speicher-Szenarien berechnen</button>

    <div v-if="warning" class="battery-warning" role="alert">{{ warning }}</div>

    <div class="battery-scenarios">
      <article v-for="scenario in scenarios" :key="scenario.label" class="battery-scenario-card">
        <h3>{{ scenario.label }}</h3>
        <p>usabler Anteil: {{ (scenario.usableShare * 100).toFixed(0) }} %</p>
        <p class="battery-scenario-card__savings">{{ formatMoney(scenario.annualSavingsEur) }}</p>
        <p>{{ formatBreakEven(scenario.breakEvenYears) }}</p>
        <p>{{ scenario.confidenceNote }}</p>
      </article>
    </div>

    <p v-if="loading" class="loading-state">Szenarien werden geladen …</p>
  </section>
</template>

<style scoped>
.battery-card {
  display: grid;
  gap: 12px;
}

.field-grid,
.segmented,
.battery-scenarios {
  display: grid;
  gap: 8px;
}

.field-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.field {
  display: grid;
  gap: 8px;
}

.field span {
  font-weight: 600;
}

.field input,
.segmented__button,
.battery-card__cta {
  min-height: 44px;
}

.field input {
  border: 1px solid rgba(31, 41, 55, 0.16);
  border-radius: 16px;
  font: inherit;
  padding: 12px 14px;
}

.segmented {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.segmented__button,
.battery-card__cta {
  border-radius: 16px;
  border: 1px solid rgba(31, 41, 55, 0.16);
  background: #fff;
  font: inherit;
  font-weight: 600;
  padding: 12px 14px;
}

.segmented__button--active,
.battery-card__cta {
  background: #1f6b5c;
  border-color: #1f6b5c;
  color: #fff;
}

.battery-warning {
  border-left: 4px solid #b54708;
  color: #b54708;
  padding-left: 12px;
}

.battery-scenarios {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.battery-scenario-card {
  background: #f7f8f4;
  border-radius: 16px;
  display: grid;
  gap: 6px;
  padding: 12px;
}

.battery-scenario-card h3,
.battery-scenario-card p,
.helper,
.loading-state {
  margin: 0;
}

.battery-scenario-card__savings {
  font-size: 1.2rem;
  font-weight: 600;
}

@media (min-width: 720px) {
  .battery-scenarios {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
</style>
