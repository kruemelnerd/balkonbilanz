import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mountVueComponent } from '../support/vueHarness.ts';

const analysisPath = new URL('../../src/features/analysis/AnalysisView.vue', import.meta.url).pathname;
const intervalListPath = new URL('../../src/features/analysis/IntervalList.vue', import.meta.url).pathname;

test('analysis view starts with a loading skeleton', async () => {
  const { container, unmount } = await mountVueComponent(analysisPath);

  assert.match(container.textContent ?? '', /Analysezeitraum wird geladen|Bitte warten/);

  unmount();
});

test('analysis view renders the empty state copy', async () => {
  const { container, unmount } = await mountVueComponent(analysisPath, {
    snapshot: { mode: 'empty', periodLabel: '', qualityLevel: 'limited', qualityReasons: [], kpis: [] },
  });

  assert.match(container.textContent ?? '', /Wähle einen Zeitraum oder ergänze fehlende Daten/);

  unmount();
});

test('analysis view greys out poor-state kpis and keeps the warning visible', async () => {
  const { container, unmount } = await mountVueComponent(analysisPath, {
    snapshot: {
      mode: 'filled',
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

  assert.match(container.textContent ?? '', /Plausibilitaetswarnung/);
  assert.ok(container.querySelectorAll('.kpi-card--muted').length >= 1);

  unmount();
});

test('analysis view exposes a retry action for errors', async () => {
  const { container, unmount } = await mountVueComponent(analysisPath, {
    snapshot: {
      mode: 'error',
      periodLabel: 'Analysezeitraum: 2026-05-01 bis 2026-05-31',
      qualityLevel: 'limited',
      qualityReasons: ['Noch keine kombinierte Auswertung verfuegbar.'],
      error: 'Die Auswertung konnte nicht geladen werden.',
      retryLabel: 'Erneut laden',
      kpis: [],
    },
  });

  assert.match(container.textContent ?? '', /Erneut laden/);

  unmount();
});

test('interval list shows missing-cost messaging for unavailable tariffs', async () => {
  const { container, unmount } = await mountVueComponent(intervalListPath, {
    store: {
      intervals: [
        {
          start: '2026-05-01T07:00:00.000Z',
          end: '2026-05-08T07:00:00.000Z',
          durationDays: 7,
          importKwh: 12.3,
          exportKwh: 1.5,
          importKwhPerDay: 1.76,
          exportKwhPerDay: 0.21,
          costStatus: 'unavailable',
          costBasisEurPerKwh: 0.305,
          costEur: null,
          costLabel: 'Kosten noch nicht verfuegbar',
          flags: [],
        },
      ],
    },
  });

  assert.match(container.textContent ?? '', /Kosten noch nicht verfuegbar/);

  unmount();
});
