<script setup lang="ts">
import type { CaptureStore } from '../../stores/captureStore.ts';

const props = defineProps<{
  store: CaptureStore;
}>();
</script>

<template>
  <form class="pv-daily-form" aria-label="PV-Ertrag erfassen" @submit.prevent="props.store.submitPv()">
    <header>
      <h2>{{ props.store.pv.editingId === null ? 'PV-Ertrag erfassen' : 'PV-Ertrag bearbeiten' }}</h2>
      <p>Nur abgeschlossene Tage mit klarer Tagesmenge und Quelle.</p>
    </header>

    <p v-if="props.store.pv.banner" class="form-banner" role="alert">{{ props.store.pv.banner }}</p>

    <label for="pv-day">
      Tag
      <input id="pv-day" v-model="props.store.pv.draft.day" type="date" />
    </label>

    <label for="pv-generation">
      Ertrag (kWh)
      <input id="pv-generation" v-model="props.store.pv.draft.generationKwh" inputmode="decimal" type="text" />
    </label>

    <label for="pv-source">
      Quelle
      <input id="pv-source" v-model="props.store.pv.draft.source" type="text" />
    </label>

    <label for="pv-note">
      Notiz
      <textarea id="pv-note" v-model="props.store.pv.draft.note" rows="3"></textarea>
    </label>

    <ul v-if="props.store.pv.issues.length" class="form-issues" role="list">
      <li v-for="issue in props.store.pv.issues" :key="`${issue.field}-${issue.code}`">{{ issue.message }}</li>
    </ul>

    <div class="actions">
      <button type="submit" :disabled="props.store.pv.busy">Speichern</button>
      <button v-if="props.store.pv.editingId !== null" type="button" @click="props.store.cancelPvEdit()">Abbrechen</button>
    </div>
  </form>
</template>
