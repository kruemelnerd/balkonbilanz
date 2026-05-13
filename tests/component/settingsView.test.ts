import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { test } from 'node:test';
import { createAnalysisStore } from '../../src/stores/analysisStore.ts';
import { createBatteryAdvisorService } from '../../src/services/batteryAdvisorService.ts';
import { mountVueComponent, flush, setInputValue, clickElement } from '../support/vueHarness.ts';

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
    async previewBackup(serialized: string) {
      const parsed = JSON.parse(serialized);
      return { ok: true as const, value: { schemaVersion: parsed.schemaVersion, exportedAt: parsed.exportedAt, counts: { appSettings: parsed.appSettings.length, tariffPeriods: parsed.tariffPeriods.length, meterReadings: parsed.meterReadings.length, pvDailyEntries: parsed.pvDailyEntries.length } } };
    },
    async restoreBackup() {
      return { ok: true as const, value: { restored: true as const } };
    },
  };
}

test('settings view shows sections in order and refreshes advisor after save', async () => {
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

    assert.match(container.textContent ?? '', /Einstellungen & Annahmen/);
    assert.match(container.textContent ?? '', /Tarifhistorie/);
    assert.match(container.textContent ?? '', /Speicherberater/);
    assert.match(container.textContent ?? '', /Backup & Restore/);
    assert.match(container.textContent ?? '', /App-Info/);

    setInputValue(container.querySelector('#electricity-price') as HTMLInputElement, '0.41');
    await flush();
    (container.querySelector('form[aria-label="Einstellungen & Annahmen"]') as HTMLFormElement).dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await flush();

    assert.match(container.textContent ?? '', /Einstellungen lokal gespeichert\./);
    assert.match(container.textContent ?? '', /Aktueller Strompreis: 0.41/);
  } finally {
    unmount();
  }
});

test('settings view keeps restore disabled until preview and confirmation are complete', async () => {
  const { container, unmount } = await mountVueComponent(resolve('src/features/settings/SettingsView.vue'), {
    settingsService: createSettingsServiceStub(),
    backupService: createBackupServiceStub(),
    analysisStore: createAnalysisStore({
      analysisService: {
        async loadAnalysis() {
          return { intervals: [], pvDays: [], combined: null, quality: { level: 'good', reasons: [] } };
        },
      },
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
