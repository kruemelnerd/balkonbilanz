import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mountVueComponent } from '../support/vueHarness.ts';

const settingsPath = new URL('../../src/features/settings/SettingsView.vue', import.meta.url).pathname;

test('settings view shows the default pricing and quality mode copy', async () => {
  const { container, unmount } = await mountVueComponent(settingsPath, {
    snapshot: {
      settings: {
        strompreisEurPerKwh: 0.305,
        einspeiseverguetungEurPerKwh: 0,
        qualityMode: 'balanced',
      },
      tariffPeriods: [],
      backupPreviewReady: false,
      appVersion: 'lokal',
      schemaVersion: 1,
    },
  });

  assert.equal((container.querySelector('#settings-strompreis') as HTMLInputElement)?.value, '0.305');
  assert.equal((container.querySelector('#settings-einspeiseverguetung') as HTMLInputElement)?.value, '0');
  assert.equal(container.querySelector('.segmented__button--active')?.textContent?.trim(), 'balanced');
  assert.match(container.textContent ?? '', /Einstellungen speichern/);
  assert.match(container.textContent ?? '', /Backup exportieren/);

  unmount();
});

test('settings view renders tariff overlap errors inline', async () => {
  const { container, unmount } = await mountVueComponent(settingsPath, {
    snapshot: {
      settings: {
        strompreisEurPerKwh: 0.305,
        einspeiseverguetungEurPerKwh: 0,
        qualityMode: 'balanced',
      },
      tariffPeriods: [
        {
          id: 7,
          startDay: '2026-05-01',
          endDay: '2026-05-10',
          strompreisEurPerKwh: 0.29,
          einspeiseverguetungEurPerKwh: 0.08,
        },
      ],
      tariffError: 'Diese Tarifperiode überschneidet sich mit Periode 7.',
      backupPreviewReady: false,
      appVersion: 'lokal',
      schemaVersion: 1,
    },
  });

  assert.match(container.textContent ?? '', /überschneidet sich mit Periode 7/);
  assert.match(container.textContent ?? '', /Tarifperiode speichern/);

  unmount();
});

test('settings view keeps restore disabled until a valid preview exists', async () => {
  const disabled = await mountVueComponent(settingsPath, {
    snapshot: {
      settings: {
        strompreisEurPerKwh: 0.305,
        einspeiseverguetungEurPerKwh: 0,
        qualityMode: 'balanced',
      },
      tariffPeriods: [],
      backupPreviewReady: false,
      appVersion: 'lokal',
      schemaVersion: 1,
    },
  });

  const restoreButton = disabled.container.querySelector('button[disabled]');
  assert.ok(restoreButton);
  disabled.unmount();

  const enabled = await mountVueComponent(settingsPath, {
    snapshot: {
      settings: {
        strompreisEurPerKwh: 0.305,
        einspeiseverguetungEurPerKwh: 0,
        qualityMode: 'balanced',
      },
      tariffPeriods: [],
      backupPreview: {
        schemaVersion: 1,
        exportedAt: '2026-05-12T00:00:00.000Z',
        meterReadings: 2,
        pvDailyEntries: 3,
        tariffPeriods: 1,
        settingsIncluded: true,
      },
      backupPreviewReady: true,
      appVersion: 'lokal',
      schemaVersion: 1,
    },
  });

  const enabledButton = Array.from(enabled.container.querySelectorAll('button')).find((button) => button.textContent?.includes('Vollständigen Restore starten'));
  assert.ok(enabledButton);
  assert.equal((enabledButton as HTMLButtonElement).disabled, false);

  enabled.unmount();
});
