<script setup lang="ts">
import type { CaptureStore } from '../../stores/captureStore.ts';
import { formatGermanDateTime } from '../../utils/dateFormatting.ts';

const props = defineProps<{
  store: CaptureStore;
}>();
</script>

<template>
  <section class="meter-readings-list" aria-label="Zählerverlauf">
    <header>
      <h2>Zaehlerverlauf</h2>
      <p>Neueste Ablesungen zuerst mit Schnellaktionen fuer Bearbeiten und Loeschen.</p>
    </header>

    <p v-if="!props.store.meter.readings.length" class="empty-state">Noch keine Zaehlerablesungen vorhanden.</p>

    <article v-for="reading in props.store.meter.readings" :key="reading.id" class="reading-card">
      <strong>{{ formatGermanDateTime(reading.timestamp) }}</strong>
      <div>1.8.0: {{ reading.obis180Kwh }} kWh</div>
      <div>2.8.0: {{ reading.obis280Kwh }} kWh</div>
      <p v-if="reading.note">{{ reading.note }}</p>

      <div class="actions">
        <button type="button" :aria-label="`Zählerstand vom ${formatGermanDateTime(reading.timestamp)} bearbeiten`" @click="void props.store.startMeterEdit(reading.id ?? 0)">Bearbeiten</button>
        <button type="button" :aria-label="`Zählerstand vom ${formatGermanDateTime(reading.timestamp)} löschen`" @click="void props.store.deleteMeter(reading.id ?? 0)">Loeschen</button>
      </div>
    </article>
  </section>
</template>
