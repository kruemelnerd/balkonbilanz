import { createApp } from 'vue';
import App from './App.vue';
import { appRouter } from './router/index.ts';
import { PWA_PROMPT_STATE_KEY } from './pwa/pwaPrompt.ts';
import { createPwaPromptState } from './pwa/registerServiceWorker.ts';
import './styles/main.css';

const app = createApp(App);
app.provide(PWA_PROMPT_STATE_KEY, createPwaPromptState());
app.use(appRouter).mount('#app');
