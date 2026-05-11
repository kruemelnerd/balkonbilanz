<script setup lang="ts">
import type { CaptureStore } from '../../stores/captureStore.ts';

const props = defineProps<{
  store: CaptureStore;
}>();
</script>

<template>
  <form class="meter-entry-form" @submit.prevent="props.store.submitMeter()">
    <header>
      <h2>{{ props.store.meter.editingId === null ? 'Zaehlerstand erfassen' : 'Zaehlerstand bearbeiten' }}</h2>
      <p>Grosse Eingabefelder, klare Pflichtwerte und sofortiges Feedback.</p>
    </header>

    <p v-if="props.store.meter.banner" class="form-banner">{{ props.store.meter.banner }}</p>

    <label>
      Zeitpunkt
      <input v-model="props.store.meter.draft.timestamp" type="datetime-local" />
    </label>

    <label>
      OBIS 1.8.0 (kWh)
      <input v-model="props.store.meter.draft.obis180Kwh" inputmode="decimal" type="text" />
    </label>

    <label>
      OBIS 2.8.0 (kWh)
      <input v-model="props.store.meter.draft.obis280Kwh" inputmode="decimal" type="text" />
    </label>

    <label>
      Notiz
      <textarea v-model="props.store.meter.draft.note" rows="3"></textarea>
    </label>

    <ul v-if="props.store.meter.issues.length" class="form-issues">
      <li v-for="issue in props.store.meter.issues" :key="`${issue.field}-${issue.code}`">{{ issue.message }}</li>
    </ul>

    <div class="actions">
      <button type="submit" :disabled="props.store.meter.busy">Speichern</button>
      <button v-if="props.store.meter.editingId !== null" type="button" @click="props.store.cancelMeterEdit()">Abbrechen</button>
    </div>
  </form>
</template>
