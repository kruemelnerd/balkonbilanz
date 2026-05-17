import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { test } from 'node:test';
import { createAnalysisStore } from '../../src/stores/analysisStore.ts';
import { createBatteryAdvisorService } from '../../src/services/batteryAdvisorService.ts';
import { clickElement, flush, mountVueComponent } from '../support/vueHarness.ts';

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
      return JSON.stringify({ schemaVersion: 1, exportedAt: '2026-05-13T12:34:00.000Z', appSettings: [], tariffPeriods: [], meterReadings: [], pvDailyEntries: [] });
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

test('settings view formats tariff and backup dates in German display format', async () => {
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

    assert.match(container.textContent ?? '', /01\.05\.2026 — offen/);
    assert.doesNotMatch(container.textContent ?? '', /2026-05-01/);

    const backupFile = new File([
      JSON.stringify({
        schemaVersion: 1,
        exportedAt: '2026-05-13T12:34:00.000Z',
        appSettings: [],
        tariffPeriods: [],
        meterReadings: [],
        pvDailyEntries: [],
      }),
    ], 'backup.json', { type: 'application/json' });

    const fileInput = container.querySelector('#backup-file') as HTMLInputElement;
    Object.defineProperty(fileInput, 'files', {
      value: {
        0: backupFile,
        length: 1,
        item: (index: number) => (index === 0 ? backupFile : null),
      },
      configurable: true,
    });

    fileInput.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
    clickElement([...container.querySelectorAll('button')].find((button) => button.textContent?.includes('Backup prüfen')) as HTMLButtonElement);
    await flush();

    assert.match(container.textContent ?? '', /13\.05\.2026, \d{2}:\d{2}/);
    assert.doesNotMatch(container.textContent ?? '', /2026-05-13T12:34:00\.000Z/);
  } finally {
    unmount();
  }
});
