<script setup lang="ts">
import { nextTick, onMounted, reactive, watch } from 'vue';
import { useRoute } from 'vue-router';
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
const route = useRoute();

function focusFromHash(hash = route.hash) {
  const target = hash.replace('#', '');
  if (target === 'meter-timestamp' || target === 'pv-day') {
    window.document.getElementById(target)?.focus();
  }
}

onMounted(async () => {
  await store.loadMeterReadings();
  await store.loadPvEntries();
  await nextTick();
  focusFromHash();
});

watch(
  () => route.hash,
  async () => {
    await nextTick();
    focusFromHash();
  },
  { immediate: true },
);
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
