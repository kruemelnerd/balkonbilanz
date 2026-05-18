import assert from 'node:assert/strict';
import 'fake-indexeddb/auto';
import { resolve } from 'node:path';
import { test } from 'node:test';
import { BalkonBilanzDb, createBrowserCaptureDependencies } from '../../src/db/database.ts';
import { mountVueComponent, flush, setInputValue } from '../support/vueHarness.ts';

async function waitFor(predicate: () => boolean, message: string) {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    if (predicate()) {
      return;
    }

    await flush();
  }

  assert.fail(message);
}

async function mountApp() {
  let router: any;
  const mounted = await mountVueComponent(resolve('src/App.vue'), {}, {
    plugins: [async () => {
      const { createAppRouter } = await import('../../src/router/index.ts');
      const { loadVueComponent } = await import('../support/vueHarness.ts');
      router = createAppRouter({
        views: {
          dashboard: await loadVueComponent(resolve('src/features/dashboard/DashboardView.vue')),
          capture: await loadVueComponent(resolve('src/features/capture/CaptureView.vue')),
          analysis: await loadVueComponent(resolve('src/features/analysis/AnalysisView.vue')),
        },
      });
      return router;
    }],
  });
  return { ...mounted, router };
}

test('mobile analysis smoke flow preserves capture hash and readable analysis copy', async () => {
  const { container, router, unmount } = await mountApp();
  let db: BalkonBilanzDb | undefined;

  try {
    await router.push('/');
    await flush();

    assert.match(container.textContent ?? '', /Dashboard/);

    (container.querySelector('a[href="/capture#meter-timestamp"]') as HTMLAnchorElement).click();
    await flush();
    assert.equal(router.currentRoute.value.fullPath, '/capture#meter-timestamp');
    assert.equal((container.ownerDocument?.activeElement as HTMLElement | null)?.id, 'meter-timestamp');

    db = new BalkonBilanzDb();
    const deps = createBrowserCaptureDependencies(db);

    await deps.meterService.create({ timestamp: '2026-05-10T07:00:00.000Z', obis180Kwh: 1200, obis280Kwh: 50 });
    await deps.meterService.create({ timestamp: '2026-05-12T07:00:00.000Z', obis180Kwh: 1209, obis280Kwh: 54 });
    await deps.pvService.create({ day: '2026-05-11', generationKwh: 3.1, source: 'manual' });

    await router.push('/analysis');
    await waitFor(() => container.textContent?.includes('Plausibilitaetswarnung') ?? false, 'Analysis warning did not render.');

    assert.match(container.textContent ?? '', /Plausibilitaetswarnung/);
    assert.doesNotMatch(container.textContent ?? '', /pv_below_export/);
    assert.doesNotMatch(container.textContent ?? '', /pv_coverage_partial/);
  } finally {
    unmount();
    db?.close();
  }
});

test('mobile analysis smoke flow refreshes the chart when the period changes', async () => {
  const { container, router, unmount } = await mountApp();
  let db: BalkonBilanzDb | undefined;

  try {
    db = new BalkonBilanzDb();
    const deps = createBrowserCaptureDependencies(db);

    await deps.meterService.create({ timestamp: '2026-05-10T07:00:00.000Z', obis180Kwh: 1200, obis280Kwh: 50 });
    await deps.meterService.create({ timestamp: '2026-05-11T07:00:00.000Z', obis180Kwh: 1204, obis280Kwh: 52 });
    await deps.meterService.create({ timestamp: '2026-05-12T07:00:00.000Z', obis180Kwh: 1208, obis280Kwh: 54 });
    await deps.pvService.create({ day: '2026-05-11', generationKwh: 3.1, source: 'manual' });
    await deps.pvService.create({ day: '2026-05-12', generationKwh: 2.8, source: 'manual' });

    await router.push('/analysis');
    await waitFor(() => container.textContent?.includes('Analysezeitraum') ?? false, 'Analysis chart did not render.');

    const fromInput = container.querySelector('#analysis-from') as HTMLInputElement;
    const toInput = container.querySelector('#analysis-to') as HTMLInputElement;

    assert.ok(fromInput);
    assert.ok(toInput);

    setInputValue(fromInput, '2026-05-10');
    setInputValue(toInput, '2026-05-12');
    await waitFor(() => container.textContent?.includes('Qualitaet: limited') ?? false, 'Limited quality hint did not render.');

    assert.match(container.textContent ?? '', /Qualitaet: limited/);

    setInputValue(fromInput, '2026-05-11');
    setInputValue(toInput, '2026-05-12');
    await waitFor(() => container.textContent?.includes('Qualitaet: good') ?? false, 'Chart did not refresh to good quality.');

    assert.match(container.textContent ?? '', /11\.05\.2026/);
    assert.doesNotMatch(container.textContent ?? '', /Nur 2 von 3 PV-Tagen vorhanden/);
  } finally {
    unmount();
    db?.close();
  }
});
