import { createApp } from 'vue';
import App from './App.vue';
import { appRouter } from './router/index.ts';
import './styles/main.css';

createApp(App).use(appRouter).mount('#app');
