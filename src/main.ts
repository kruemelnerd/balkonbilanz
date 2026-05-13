import { createApp } from 'vue';
import App from './App.vue';
import { appRouter } from './router/index.ts';

createApp(App).use(appRouter).mount('#app');
