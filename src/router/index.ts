import { createMemoryHistory, createRouter, createWebHistory, type Component, type RouteRecordRaw } from 'vue-router';

export interface AppShellViews {
  dashboard: Component;
  capture: Component;
  analysis: Component;
  settings: Component;
}

export function createAppRoutes(views: AppShellViews): RouteRecordRaw[] {
  return [
  {
    path: '/',
    redirect: '/dashboard',
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: views.dashboard,
  },
  {
    path: '/capture',
    name: 'capture',
    component: views.capture,
  },
  {
    path: '/analysis',
    name: 'analysis',
    component: views.analysis,
  },
  {
    path: '/settings',
    name: 'settings',
    component: views.settings,
  },
  ];
}

function createAppHistory() {
  return typeof window === 'undefined' ? createMemoryHistory() : createWebHistory();
}

export function createAppRouter(views: AppShellViews) {
  return createRouter({
    history: createAppHistory(),
    routes: createAppRoutes(views),
  });
}
