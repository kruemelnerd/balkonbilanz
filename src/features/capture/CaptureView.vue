<script setup lang="ts">
import { onMounted, reactive } from 'vue';
import { createBrowserCaptureDependencies } from '../../db/database.ts';
import { createCaptureStore, type CaptureStore } from '../../stores/captureStore.ts';
import MeterEntryForm from '../meter/MeterEntryForm.vue';
import MeterReadingsList from '../meter/MeterReadingsList.vue';
import PvDailyForm from '../pv/PvDailyForm.vue';
import PvDailyList from '../pv/PvDailyList.vue';

const props = defineProps<{
  store?: CaptureStore;
}>();

const store = reactive(props.store ?? createCaptureStore(createBrowserCaptureDependencies()));

onMounted(async () => {
  await store.loadMeterReadings();
  await store.loadPvEntries();
});
</script>

<template>
  <main class="capture-view">
    <header class="capture-header">
      <h1>BalkonBilanz</h1>
      <p>Lokale Erfassung von Zählerständen und PV-Tageswerten ohne Cloud.</p>
    </header>

    <section v-if="store.meter.banner" class="capture-banner" aria-live="polite">
      <p>{{ store.meter.banner }}</p>
      <button v-if="store.meter.banner.includes('Zählerwechsel')" type="button" @click="store.startMeterCreate()">
        Zählerwechsel dokumentieren
      </button>
    </section>

    <section class="capture-grid">
      <MeterEntryForm :store="store" />
      <MeterReadingsList :store="store" />
      <PvDailyForm :store="store" />
      <PvDailyList :store="store" />
    </section>
  </main>
</template>
