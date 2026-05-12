import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mountVueComponent } from '../support/vueHarness.ts';

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
