import { createRouter, createWebHistory, type Component, type RouterHistory } from 'vue-router';

export interface AppRouterViews {
  dashboard: Component;
  capture: Component;
  analysis: Component;
  settings: Component;
}

export interface CreateAppRouterOptions {
  views?: Partial<AppRouterViews>;
  history?: RouterHistory;
}

export function createAppRouter(options: CreateAppRouterOptions = {}) {
  const baseUrl = (import.meta as ImportMeta & { env?: { BASE_URL?: string } }).env?.BASE_URL ?? '/';
  const { views = {}, history = createWebHistory(baseUrl) } = options;

  return createRouter({
    history,
    routes: [
      { path: '/', redirect: '/dashboard' },
      { path: '/dashboard', component: views.dashboard ?? (() => import('../features/dashboard/DashboardView.vue')) },
      { path: '/capture', component: views.capture ?? (() => import('../features/capture/CaptureView.vue')) },
      { path: '/analysis', component: views.analysis ?? (() => import('../features/analysis/AnalysisView.vue')) },
      { path: '/settings', component: views.settings ?? (() => import('../features/settings/SettingsView.vue')) },
    ],
  });
}

export const appRouter = createAppRouter();
