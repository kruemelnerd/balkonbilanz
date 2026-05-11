<script setup lang="ts">
import type { CaptureStore } from '../../stores/captureStore.ts';

const props = defineProps<{
  store: CaptureStore;
}>();
</script>

<template>
  <form class="pv-daily-form" @submit.prevent="props.store.submitPv()">
    <header>
      <h2>{{ props.store.pv.editingId === null ? 'PV-Ertrag erfassen' : 'PV-Ertrag bearbeiten' }}</h2>
      <p>Nur abgeschlossene Tage mit klarer Tagesmenge und Quelle.</p>
    </header>

    <p v-if="props.store.pv.banner" class="form-banner">{{ props.store.pv.banner }}</p>

    <label>
      Tag
      <input v-model="props.store.pv.draft.day" type="date" />
    </label>

    <label>
      Ertrag (kWh)
      <input v-model="props.store.pv.draft.generationKwh" inputmode="decimal" type="text" />
    </label>

    <label>
      Quelle
      <input v-model="props.store.pv.draft.source" type="text" />
    </label>

    <label>
      Notiz
      <textarea v-model="props.store.pv.draft.note" rows="3"></textarea>
    </label>

    <ul v-if="props.store.pv.issues.length" class="form-issues">
      <li v-for="issue in props.store.pv.issues" :key="`${issue.field}-${issue.code}`">{{ issue.message }}</li>
    </ul>

    <div class="actions">
      <button type="submit" :disabled="props.store.pv.busy">Speichern</button>
      <button v-if="props.store.pv.editingId !== null" type="button" @click="props.store.cancelPvEdit()">Abbrechen</button>
    </div>
  </form>
</template>
