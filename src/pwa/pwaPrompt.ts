import { ref, type Ref } from 'vue';

export type PwaPromptState = {
  needRefresh: Ref<boolean>;
  offlineReady: Ref<boolean>;
  updateServiceWorker: (reloadPage?: boolean) => Promise<void>;
  closePrompt: () => void;
};

export const PWA_PROMPT_STATE_KEY = Symbol('pwa-prompt-state');

export function createFallbackPwaPromptState(): PwaPromptState {
  const needRefresh = ref(false);
  const offlineReady = ref(false);

  return {
    needRefresh,
    offlineReady,
    async updateServiceWorker() {
      needRefresh.value = false;
      offlineReady.value = false;
    },
    closePrompt() {
      needRefresh.value = false;
      offlineReady.value = false;
    },
  };
}
