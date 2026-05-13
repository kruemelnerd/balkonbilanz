import { createApp } from 'vue';
import App from './App.vue';
import { appRouter } from './router/index.ts';
import { PWA_PROMPT_STATE_KEY } from './pwa/pwaPrompt.ts';
import { createFallbackPwaPromptState } from './pwa/pwaPrompt.ts';
import './styles/main.css';

const app = createApp(App);
const promptState = createFallbackPwaPromptState();
app.provide(PWA_PROMPT_STATE_KEY, promptState);

if (import.meta.env.PROD) {
  void import('./pwa/registerServiceWorker.ts').then(({ registerServiceWorker }) => registerServiceWorker(promptState));
}

app.use(appRouter).mount('#app');
