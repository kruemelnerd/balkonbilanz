import assert from 'node:assert/strict';
import 'fake-indexeddb/auto';
import { resolve } from 'node:path';
import { test } from 'node:test';
import { asMeterTimestamp, asPvDay } from '../../src/domain/types.ts';
import { BalkonBilanzDb, createBrowserCaptureStore } from '../../src/db/database.ts';
import { clickElement, flush, installDom, loadVueComponent } from '../support/vueHarness.ts';

async function waitFor(predicate: () => boolean, message: string) {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    if (predicate()) {
      return;
    }

    await flush();
  }

  assert.fail(message);
}

async function mountShellApp() {
  installDom();

  const { createApp, nextTick } = await import('vue');
  const { createAppRouter } = await import('../../src/router/index.ts');
  const App = await loadVueComponent(resolve('src/App.vue'));
  const Dashboard = await loadVueComponent(resolve('src/features/dashboard/DashboardView.vue'));
  const Capture = await loadVueComponent(resolve('src/features/capture/CaptureView.vue'));
  const Analysis = await loadVueComponent(resolve('src/features/analysis/AnalysisView.vue'));
  const router = createAppRouter({ dashboard: Dashboard, capture: Capture, analysis: Analysis });
  const container = document.createElement('div');
  document.body.appendChild(container);
  const app = createApp(App);

  app.use(router);
  app.mount(container);
  await router.isReady();
  await nextTick();
  await flush();

  return {
    container,
    router,
    app,
    unmount() {
      app.unmount();
      container.remove();
    },
  };
}

function findNavLink(container: Element, label: string): HTMLElement {
  const link = Array.from(container.querySelectorAll('a')).find((element) => element.textContent?.includes(label));
  assert.ok(link, `Nav-Link ${label} wurde nicht gefunden.`);
  return link as HTMLElement;
}

test('mobile analysis smoke covers dashboard, analysis, and presets', async () => {
  const db = new BalkonBilanzDb();
  await db.meterReadings.clear();
  await db.pvDailyEntries.clear();

  const store = createBrowserCaptureStore(db);
  store.updateMeterDraft({ timestamp: '2026-05-01T07:00', obis180Kwh: '1200', obis280Kwh: '50' });
  await store.submitMeter();
  store.updateMeterDraft({ timestamp: '2026-05-11T07:00', obis180Kwh: '1206', obis280Kwh: '52' });
  await store.submitMeter();
  store.updatePvDraft({ day: '2026-05-10', generationKwh: '3.2', source: 'manual' });
  await store.submitPv();
  store.updatePvDraft({ day: '2026-05-11', generationKwh: '3.8', source: 'manual' });
  await store.submitPv();

  const mounted = await mountShellApp();

  try {
    await waitFor(() => mounted.container.textContent?.includes('Dashboard') ?? false, 'Dashboard wurde nicht angezeigt.');
    assert.match(mounted.container.textContent ?? '', /Dashboard/);
    assert.match(mounted.container.textContent ?? '', /Erfassung/);
    assert.match(mounted.container.textContent ?? '', /Analyse/);

    clickElement(findNavLink(mounted.container, 'Analyse'));
    await waitFor(() => mounted.container.textContent?.includes('Intervalle') ?? false, 'Analyse wurde nicht geladen.');

    assert.match(mounted.container.textContent ?? '', /Analyse/);
    assert.match(mounted.container.textContent ?? '', /30 Tage/);
    assert.match(mounted.container.textContent ?? '', /Intervalle/);
    assert.match(mounted.container.textContent ?? '', /PV-Tageswerte/);
    assert.match(mounted.container.textContent ?? '', /Naeherung|Schaetzung/);
    assert.match(mounted.container.textContent ?? '', /good|limited|poor/);
    assert.ok(mounted.container.querySelector('button[aria-pressed="true"]')?.textContent?.includes('30 Tage'));

    clickElement(Array.from(mounted.container.querySelectorAll('button')).find((button) => button.textContent?.includes('7 Tage')) as HTMLElement);
    await waitFor(() => mounted.container.querySelector('button[aria-pressed="true"]')?.textContent?.includes('7 Tage') ?? false, '7-Tage-Preset wurde nicht aktiviert.');

    assert.ok(mounted.container.querySelector('button[aria-pressed="true"]')?.textContent?.includes('7 Tage'));
  } finally {
    mounted.unmount();
    await db.delete();
  }
});
