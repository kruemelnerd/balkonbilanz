<script setup lang="ts">
import { computed, inject } from 'vue';
import { PWA_PROMPT_STATE_KEY, createFallbackPwaPromptState, type PwaPromptState } from '../../pwa/pwaPrompt.ts';

const props = defineProps<{ state?: PwaPromptState }>();

const injectedState = inject<PwaPromptState | null>(PWA_PROMPT_STATE_KEY, null);
const promptState = computed(() => props.state ?? injectedState ?? createFallbackPwaPromptState());
const isVisible = computed(() => promptState.value.needRefresh.value || promptState.value.offlineReady.value);

function closePrompt() {
  promptState.value.closePrompt();
}
</script>

<template>
  <section v-if="isVisible" class="pwa-toast" role="alert" aria-live="polite">
    <div class="pwa-toast__content">
      <p class="pwa-toast__eyebrow">PWA</p>
      <h2>{{ promptState.needRefresh.value ? 'Neue Version verfügbar' : 'App ist jetzt offline bereit' }}</h2>
      <p>
        {{ promptState.needRefresh.value
          ? 'Aktualisiere jetzt, damit du die neueste Version mit allen Änderungen nutzt.'
          : 'Du kannst die App ab sofort auch ohne Verbindung wieder öffnen.' }}
      </p>
    </div>
    <div class="pwa-toast__actions">
      <button
        v-if="promptState.needRefresh.value"
        name="pwa-update"
        type="button"
        @click="promptState.updateServiceWorker()"
      >
        Jetzt aktualisieren
      </button>
      <button type="button" class="pwa-toast__secondary" @click="closePrompt">
        Hinweis schließen
      </button>
    </div>
  </section>
</template>
