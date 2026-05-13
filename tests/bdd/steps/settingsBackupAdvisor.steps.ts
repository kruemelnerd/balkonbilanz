import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { test } from 'node:test';
import { createAnalysisStore } from '../../../src/stores/analysisStore.ts';
import { createBatteryAdvisorService } from '../../../src/services/batteryAdvisorService.ts';
import { mountVueComponent, flush, setInputValue, clickElement } from '../../support/vueHarness.ts';

function createSettingsServiceStub() {
  const settings = { electricityPriceEurPerKwh: 0.305, feedInTariffEurPerKwh: 0, qualityMode: 'balanced' as const };
  return {
    async loadSettings() { return { id: 1, createdAt: '2026-05-01T00:00:00.000Z', updatedAt: '2026-05-01T00:00:00.000Z', ...settings }; },
    async saveSettings(input: typeof settings) { Object.assign(settings, input); return { ok: true as const, value: { id: 1, createdAt: '2026-05-01T00:00:00.000Z', updatedAt: '2026-05-01T00:00:00.000Z', ...settings } }; },
    async listTariffPeriods() { return []; },
    async saveTariffPeriod(input: any) { return { ok: true as const, value: { id: 1, createdAt: '2026-05-01T00:00:00.000Z', updatedAt: '2026-05-01T00:00:00.000Z', startsOn: input.startsOn, endsOn: input.endsOn ?? null, electricityPriceEurPerKwh: input.electricityPriceEurPerKwh } }; },
    async deleteTariffPeriod() { return { ok: true as const, value: { deleted: true as const } }; },
  };
}

function createBackupServiceStub() {
  return {
    async exportBackup() { return JSON.stringify({ schemaVersion: 1, exportedAt: '2026-05-13T00:00:00.000Z', appSettings: [], tariffPeriods: [], meterReadings: [], pvDailyEntries: [] }); },
    async previewBackup(serialized: string) { const parsed = JSON.parse(serialized); return { ok: true as const, value: { schemaVersion: parsed.schemaVersion, exportedAt: parsed.exportedAt, counts: { appSettings: 0, tariffPeriods: 0, meterReadings: 0, pvDailyEntries: 0 } } }; },
    async restoreBackup() { return { ok: true as const, value: { restored: true as const } }; },
  };
}

test('scenario: settings route is reachable through the shell navigation', async () => {
  let router: any;
  const { container, unmount } = await mountVueComponent(resolve('src/features/shell/AppShellNav.vue'), {}, {
    plugins: [async () => {
      const { createAppRouter } = await import('../../../src/router/index.ts');
      router = createAppRouter({
        views: {
          dashboard: { template: '<div>Dashboard Stub</div>' } as any,
          capture: { template: '<div>Capture Stub</div>' } as any,
          analysis: { template: '<div>Analysis Stub</div>' } as any,
          settings: { template: '<div>Settings Stub</div>' } as any,
        },
      });
      await router.push('/');
      await router.isReady();
      return router;
    }],
  });

  try {
    await flush();
    assert.equal((container.querySelector('a[href="/settings"]') as HTMLAnchorElement | null)?.getAttribute('href'), '/settings');
  } finally {
    unmount();
  }
});

test('scenario: restore stays disabled until preview and confirmation are complete', async () => {
  const { container, unmount } = await mountVueComponent(resolve('src/features/settings/SettingsView.vue'), {
    settingsService: createSettingsServiceStub(),
    backupService: createBackupServiceStub(),
    analysisStore: createAnalysisStore({
      analysisService: { async loadAnalysis() { return { intervals: [], pvDays: [], combined: null, quality: { level: 'good', reasons: [] } }; } },
    }),
    advisorService: createBatteryAdvisorService(),
  });

  try {
    await flush();
    assert.equal(container.querySelector('button[name="restore-backup"]'), null);
  } finally {
    unmount();
  }
});

test('scenario: saving settings refreshes the advisor results', async () => {
  const analysisStore = createAnalysisStore({
    analysisService: {
      async loadAnalysis() {
        return {
          intervals: [],
          pvDays: [],
          combined: {
            estimateLabel: 'Naeherung',
            warnings: [],
            qualityLevel: 'good',
            qualityReasons: [],
            importKwh: 80,
            exportKwh: 40,
            selfConsumptionKwh: 10,
            autarkyPercent: 20,
          },
          quality: { level: 'good', reasons: [] },
        };
      },
    },
    today: () => new Date('2026-05-12T12:00:00.000Z'),
  });
  await analysisStore.loadAnalysis();

  const { container, unmount } = await mountVueComponent(resolve('src/features/settings/SettingsView.vue'), {
    settingsService: createSettingsServiceStub(),
    backupService: createBackupServiceStub(),
    analysisStore,
    advisorService: createBatteryAdvisorService(),
  });

  try {
    await flush();
    const initial = container.textContent ?? '';
    setInputValue(container.querySelector('#electricity-price') as HTMLInputElement, '0.41');
    await flush();
    (container.querySelector('form[aria-label="Einstellungen & Annahmen"]') as HTMLFormElement).dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await flush();

    assert.notEqual(container.textContent ?? '', initial);
    assert.match(container.textContent ?? '', /Aktueller Strompreis: 0.41/);
  } finally {
    unmount();
  }
});
