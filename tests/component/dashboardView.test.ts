import assert from 'node:assert/strict';
import { test } from 'node:test';
import { clickElement, flush, installDom, loadVueComponent, mountVueComponent } from '../support/vueHarness.ts';

const dashboardPath = new URL('../../src/features/dashboard/DashboardView.vue', import.meta.url).pathname;
const analysisPath = new URL('../../src/features/analysis/AnalysisView.vue', import.meta.url).pathname;

test('dashboard empty state shows onboarding actions', async () => {
  const { container, unmount } = await mountVueComponent(dashboardPath, {
    snapshot: { mode: 'empty' },
  });

  assert.match(container.textContent ?? '', /Noch keine Auswertung moeglich/);
  assert.match(container.textContent ?? '', /Zaehlerstand erfassen/);
  assert.match(container.textContent ?? '', /PV-Tageswert erfassen/);

  unmount();
});

test('dashboard filled state highlights approximation and recency', async () => {
  const { container, unmount } = await mountVueComponent(dashboardPath, {
    snapshot: {
      mode: 'filled',
      meterLabel: 'Letzte Zaehlerablesung',
      pvLabel: 'Letzter PV-Tageswert',
      heroLabel: 'Eigenverbrauch',
      heroValue: '12.4 kWh',
      heroBadge: 'Naeherung',
      qualityLevel: 'good',
      qualityReasons: ['5 von 5 PV-Tagen vorhanden'],
    },
  });

  assert.match(container.textContent ?? '', /Naeherung/);
  assert.match(container.textContent ?? '', /Letzte Zaehlerablesung/);
  assert.match(container.textContent ?? '', /Letzter PV-Tageswert/);
  assert.match(container.textContent ?? '', /Datenqualitaet/);

  unmount();
});

test('dashboard translates raw quality codes into German guidance', async () => {
  const { container, unmount } = await mountVueComponent(dashboardPath, {
    snapshot: {
      mode: 'filled',
      meterLabel: 'Letzte Zaehlerablesung',
      pvLabel: 'Letzter PV-Tageswert',
      heroLabel: 'Eigenverbrauch',
      heroValue: '12.4 kWh',
      heroBadge: 'Naeherung',
      qualityLevel: 'limited',
      qualityReasons: ['pv_coverage_partial', 'interval_over_7_days'],
    },
  });

  assert.doesNotMatch(container.textContent ?? '', /pv_coverage_partial|interval_over_7_days/);
  assert.match(container.textContent ?? '', /Nur .* PV-Tagen vorhanden|PV-Tage fehlen/);
  assert.match(container.textContent ?? '', /Zaehlerintervall .* 7 Tage/);

  unmount();
});

test('dashboard quick actions navigate to capture anchors', async () => {
  const window = installDom();
  const container = window.document.createElement('div');
  window.document.body.appendChild(container);
  const Dashboard = await loadVueComponent(dashboardPath);
  const { createApp, reactive } = await import('vue');
  const { createAppRouter } = await import('../../src/router/index.ts');
  const viewStub = { render: () => null };
  const router = createAppRouter({ dashboard: Dashboard, capture: viewStub, analysis: viewStub });

  await router.push('/dashboard');
  await router.isReady();

  const app = createApp(Dashboard, reactive({ snapshot: { mode: 'empty' } }));
  app.use(router);
  app.mount(container);

  try {
    await flush();

    const meterButton = Array.from(container.querySelectorAll('button')).find((button) => button.textContent?.includes('Zaehlerstand erfassen'));
    const pvButton = Array.from(container.querySelectorAll('button')).find((button) => button.textContent?.includes('PV-Tageswert erfassen'));

    assert.ok(meterButton);
    assert.ok(pvButton);

    clickElement(meterButton as HTMLElement);
    await flush();
    assert.equal(router.currentRoute.value.fullPath, '/capture#meter-timestamp');

    await router.push('/dashboard');
    await flush();

    clickElement(pvButton as HTMLElement);
    await flush();
    assert.equal(router.currentRoute.value.fullPath, '/capture#pv-day');
  } finally {
    app.unmount();
    container.remove();
  }
});

test('analysis view shows approximate kpis and quality warnings', async () => {
  const { container, unmount } = await mountVueComponent(analysisPath, {
    snapshot: {
      periodLabel: 'Analysezeitraum: 2026-05-01 bis 2026-05-31',
      qualityLevel: 'poor',
      qualityReasons: ['Nur 3 von 7 PV-Tagen vorhanden'],
      warning: 'Plausibilitaetswarnung: Einspeisung liegt ueber dem erfassten PV-Tagesertrag.',
      kpis: [
        { label: 'Eigenverbrauch', value: '8.1 kWh', muted: true },
        { label: 'Autarkie', value: '42 %', muted: true },
      ],
      combinedLabel: 'Schaetzung',
    },
  });

  assert.match(container.textContent ?? '', /Schaetzung|Naeherung/);
  assert.match(container.textContent ?? '', /Plausibilitaetswarnung: Einspeisung liegt ueber dem erfassten PV-Tagesertrag\./);
  assert.match(container.textContent ?? '', /good/);
  assert.match(container.textContent ?? '', /limited/);
  assert.match(container.textContent ?? '', /poor/);
  assert.ok(container.querySelectorAll('.kpi-card--muted').length >= 1);

  unmount();
});
