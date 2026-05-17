import assert from 'node:assert/strict';
import 'fake-indexeddb/auto';
import { resolve } from 'node:path';
import { test } from 'node:test';
import { createAnalysisStore } from '../../src/stores/analysisStore.ts';
import { createBatteryAdvisorService } from '../../src/services/batteryAdvisorService.ts';
import { mountVueComponent, flush, setInputValue, clickElement, loadVueComponent } from '../support/vueHarness.ts';

function createSettingsServiceStub() {
  const settings = { electricityPriceEurPerKwh: 0.305, feedInTariffEurPerKwh: 0, qualityMode: 'balanced' as const };
  const tariffPeriods = [
    {
      id: 1,
      createdAt: '2026-05-01T00:00:00.000Z',
      updatedAt: '2026-05-01T00:00:00.000Z',
      startsOn: '2026-05-01',
      endsOn: null,
      electricityPriceEurPerKwh: 0.31,
    },
  ];

  return {
    async loadSettings() {
      return { id: 1, createdAt: '2026-05-01T00:00:00.000Z', updatedAt: '2026-05-01T00:00:00.000Z', ...settings };
    },
    async saveSettings(input: typeof settings) {
      Object.assign(settings, input);
      return { ok: true as const, value: { id: 1, createdAt: '2026-05-01T00:00:00.000Z', updatedAt: '2026-05-01T00:00:00.000Z', ...settings } };
    },
    async listTariffPeriods() {
      return [...tariffPeriods];
    },
    async saveTariffPeriod(input: any) {
      tariffPeriods[0] = { id: input.id ?? 1, createdAt: '2026-05-01T00:00:00.000Z', updatedAt: '2026-05-01T00:00:00.000Z', startsOn: input.startsOn, endsOn: input.endsOn ?? null, electricityPriceEurPerKwh: input.electricityPriceEurPerKwh };
      return { ok: true as const, value: tariffPeriods[0] };
    },
    async deleteTariffPeriod() {
      tariffPeriods.length = 0;
      return { ok: true as const, value: { deleted: true as const } };
    },
  };
}

function createBackupServiceStub() {
  return {
    async exportBackup() {
      return JSON.stringify({ schemaVersion: 1, exportedAt: '2026-05-13T00:00:00.000Z', appSettings: [], tariffPeriods: [], meterReadings: [], pvDailyEntries: [] });
    },
    async previewBackup() {
      return { ok: true as const, value: { schemaVersion: 1, exportedAt: '2026-05-13T00:00:00.000Z', counts: { appSettings: 0, tariffPeriods: 0, meterReadings: 0, pvDailyEntries: 0 } } };
    },
    async restoreBackup() {
      return { ok: true as const, value: { restored: true as const } };
    },
  };
}

test('mobile settings flow covers save, backup preview, restore gate, and advisor refresh', async () => {
  const originalCreateObjectURL = URL.createObjectURL;
  const originalRevokeObjectURL = URL.revokeObjectURL;
  const createObjectURLCalls: Blob[] = [];
  const revokeObjectURLCalls: string[] = [];
  const clickedDownloads: string[] = [];
  URL.createObjectURL = ((blob: Blob) => {
    createObjectURLCalls.push(blob);
    return 'blob:settings-backup-export';
  }) as typeof URL.createObjectURL;
  URL.revokeObjectURL = ((url: string) => {
    revokeObjectURLCalls.push(url);
  }) as typeof URL.revokeObjectURL;

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

  const { container, unmount } = await mountVueComponent(resolve('src/App.vue'), {}, {
    plugins: [async () => {
      const SettingsView = await loadVueComponent(resolve('src/features/settings/SettingsView.vue'));
      const settingsPage = {
        components: { SettingsView },
        setup() {
          return {
            settingsService: createSettingsServiceStub(),
            backupService: createBackupServiceStub(),
            analysisStore,
            advisorService: createBatteryAdvisorService(),
          };
        },
        template: `
          <SettingsView
            :settings-service="settingsService"
            :backup-service="backupService"
            :analysis-store="analysisStore"
            :advisor-service="advisorService"
          />
        `,
      };

      const { createAppRouter } = await import('../../src/router/index.ts');
      return createAppRouter({
        views: {
          dashboard: { template: '<div>Dashboard Stub</div>' } as any,
          capture: { template: '<div>Capture Stub</div>' } as any,
          analysis: { template: '<div>Analysis Stub</div>' } as any,
          settings: settingsPage as any,
        },
      });
    }],
  });

  try {
    await flush();

    const anchorPrototype = Object.getPrototypeOf(document.createElement('a')) as HTMLAnchorElement;
    const originalAnchorClick = anchorPrototype.click;
    anchorPrototype.click = function clickStub() {
      clickedDownloads.push(this.download);
    };

    try {
      clickElement(container.querySelector('a[href="/settings"]') as HTMLAnchorElement);
      await flush();
      assert.match(container.textContent ?? '', /Einstellungen & Annahmen/);

      clickElement([...container.querySelectorAll('button')].find((button) => button.textContent?.includes('Backup exportieren')) as HTMLButtonElement);
      await flush();
      assert.equal(createObjectURLCalls.length, 1);
      assert.deepEqual(clickedDownloads, ['balkonbilanz-backup.json']);
      assert.deepEqual(revokeObjectURLCalls, ['blob:settings-backup-export']);
      assert.match(container.textContent ?? '', /Backup exportiert\./);

      setInputValue(container.querySelector('#electricity-price') as HTMLInputElement, '0.41');
      await flush();
      (container.querySelector('form[aria-label="Einstellungen & Annahmen"]') as HTMLFormElement).dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      await flush();
      assert.match(container.textContent ?? '', /Einstellungen lokal gespeichert\./);
      assert.match(container.textContent ?? '', /Aktueller Strompreis: 0.41/);

      const calculateButton = [...container.querySelectorAll('button')].find((button) => button.textContent?.includes('Speicherpotenzial berechnen')) as HTMLButtonElement;
      clickElement(calculateButton);
      await flush();
      assert.match(container.textContent ?? '', /Konservativ/);

      const backupFile = {
        text: async () => JSON.stringify({ schemaVersion: 1, exportedAt: '2026-05-13T00:00:00.000Z', appSettings: [], tariffPeriods: [], meterReadings: [], pvDailyEntries: [] }),
      };
      const fileInput = container.querySelector('#backup-file') as HTMLInputElement;
      Object.defineProperty(fileInput, 'files', { value: { 0: backupFile, length: 1, item: (index: number) => (index === 0 ? backupFile : null) }, configurable: true });
      fileInput.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
      clickElement([...container.querySelectorAll('button')].find((button) => button.textContent?.includes('Backup prüfen')) as HTMLButtonElement);
      await flush();

      assert.match(container.textContent ?? '', /Schema-Version: 1/);
      assert.equal((container.querySelector('button[name="restore-backup"]') as HTMLButtonElement | null)?.disabled, true);

      const restoreCheckbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement;
      restoreCheckbox.click();
      await flush();
      assert.equal((container.querySelector('button[name="restore-backup"]') as HTMLButtonElement | null)?.disabled, false);
      clickElement(container.querySelector('button[name="restore-backup"]') as HTMLButtonElement);
      await flush();

      assert.match(container.textContent ?? '', /Vollständiger Restore abgeschlossen\./);
    } finally {
      anchorPrototype.click = originalAnchorClick;
    }
  } finally {
    URL.createObjectURL = originalCreateObjectURL;
    URL.revokeObjectURL = originalRevokeObjectURL;
    unmount();
  }
});
