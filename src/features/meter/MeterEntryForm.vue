<script setup lang="ts">
import type { CaptureStore } from '../../stores/captureStore.ts';

const props = defineProps<{
  store: CaptureStore;
}>();
</script>

<template>
  <form class="meter-entry-form" aria-label="Zählerstand erfassen" @submit.prevent="props.store.submitMeter()">
    <header>
      <h2>{{ props.store.meter.editingId === null ? 'Zaehlerstand erfassen' : 'Zaehlerstand bearbeiten' }}</h2>
      <p>Grosse Eingabefelder, klare Pflichtwerte und sofortiges Feedback.</p>
    </header>

    <p v-if="props.store.meter.banner" class="form-banner" role="alert">{{ props.store.meter.banner }}</p>

    <label for="meter-timestamp">
      Zeitpunkt
      <input id="meter-timestamp" v-model="props.store.meter.draft.timestamp" type="datetime-local" />
    </label>

    <label for="meter-obis180">
      OBIS 1.8.0 (kWh)
      <input id="meter-obis180" v-model="props.store.meter.draft.obis180Kwh" inputmode="decimal" type="text" />
    </label>

    <label for="meter-obis280">
      OBIS 2.8.0 (kWh)
      <input id="meter-obis280" v-model="props.store.meter.draft.obis280Kwh" inputmode="decimal" type="text" />
    </label>

    <label for="meter-note">
      Notiz
      <textarea id="meter-note" v-model="props.store.meter.draft.note" rows="3"></textarea>
    </label>

    <ul v-if="props.store.meter.issues.length" class="form-issues" role="list">
      <li v-for="issue in props.store.meter.issues" :key="`${issue.field}-${issue.code}`">{{ issue.message }}</li>
    </ul>

    <div class="actions">
      <button type="submit" :disabled="props.store.meter.busy">Speichern</button>
      <button v-if="props.store.meter.editingId !== null" type="button" @click="props.store.cancelMeterEdit()">Abbrechen</button>
    </div>
  </form>
</template>
