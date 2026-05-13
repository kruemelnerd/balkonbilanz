import { useRegisterSW } from 'virtual:pwa-register/vue';
import { createFallbackPwaPromptState, type PwaPromptState } from './pwaPrompt.ts';

export function createPwaPromptState(): PwaPromptState {
  try {
    const { offlineReady, needRefresh, updateServiceWorker } = useRegisterSW({
      immediate: true,
      onRegisterError(error) {
        console.error('Service worker registration failed', error);
      },
    });

    return {
      needRefresh,
      offlineReady,
      updateServiceWorker,
      closePrompt() {
        offlineReady.value = false;
        needRefresh.value = false;
      },
    };
  } catch {
    return createFallbackPwaPromptState();
  }
}
