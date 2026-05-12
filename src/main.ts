import { createApp } from 'vue';
import App from './App.vue';
import DashboardView from './features/dashboard/DashboardView.vue';
import CaptureView from './features/capture/CaptureView.vue';
import AnalysisView from './features/analysis/AnalysisView.vue';
import { createAppRouter } from './router/index.ts';

const router = createAppRouter({
  dashboard: DashboardView,
  capture: CaptureView,
  analysis: AnalysisView,
});

createApp(App).use(router).mount('#app');
