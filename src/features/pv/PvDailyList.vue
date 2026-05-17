<script setup lang="ts">
import type { CaptureStore } from '../../stores/captureStore.ts';
import { formatGermanDate } from '../../utils/dateFormatting.ts';

const props = defineProps<{
  store: CaptureStore;
}>();
</script>

<template>
  <section class="pv-daily-list" aria-label="PV-Tageswerte">
    <header>
      <h2>PV-Tageswerte</h2>
      <p>Neueste Tage zuerst mit Datum, Wert, Notiz und Quelle.</p>
    </header>

    <p v-if="!props.store.pv.entries.length" class="empty-state">Noch keine PV-Tageswerte vorhanden.</p>

    <article v-for="entry in props.store.pv.entries" :key="entry.id" class="pv-card">
      <strong>{{ formatGermanDate(entry.day) }}</strong>
      <div>{{ entry.generationKwh }} kWh</div>
      <div>Quelle: {{ entry.source }}</div>
      <p v-if="entry.note">{{ entry.note }}</p>

      <div class="actions">
        <button type="button" :aria-label="`PV-Eintrag vom ${formatGermanDate(entry.day)} bearbeiten`" @click="void props.store.startPvEdit(entry.id ?? 0)">Bearbeiten</button>
        <button type="button" :aria-label="`PV-Eintrag vom ${formatGermanDate(entry.day)} löschen`" @click="void props.store.deletePv(entry.id ?? 0)">Loeschen</button>
      </div>
    </article>
  </section>
</template>
