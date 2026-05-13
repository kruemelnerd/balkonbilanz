import { watchEffect } from 'vue';
import type { PwaPromptState } from './pwaPrompt.ts';

export async function registerServiceWorker(promptState: PwaPromptState) {
  try {
    const { useRegisterSW } = await import('virtual:pwa-register/vue');
    const { offlineReady, needRefresh, updateServiceWorker } = useRegisterSW({
      immediate: true,
      onRegisterError(error) {
        console.error('Service worker registration failed', error);
      },
    });

    watchEffect(() => {
      promptState.needRefresh.value = needRefresh.value;
      promptState.offlineReady.value = offlineReady.value;
    });

    promptState.updateServiceWorker = updateServiceWorker;
    promptState.closePrompt = () => {
      offlineReady.value = false;
      needRefresh.value = false;
    };
  } catch (error) {
    console.error('Service worker prompt initialization failed', error);
  }
}
