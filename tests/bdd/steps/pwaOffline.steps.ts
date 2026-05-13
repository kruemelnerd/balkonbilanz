import assert from 'node:assert/strict';
import 'fake-indexeddb/auto';
import { randomUUID } from 'node:crypto';
import { resolve } from 'node:path';
import { BalkonBilanzDb, createBrowserCaptureStore } from '../../../src/db/database.ts';
import { mountVueComponent, flush, setInputValue } from '../../support/vueHarness.ts';

async function waitForText(container: HTMLElement, text: RegExp) {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    if (text.test(container.textContent ?? '')) {
      return;
    }

    await flush();
  }

  assert.match(container.textContent ?? '', text);
}

function createPromptState(needRefreshValue = false) {
  const needRefresh = { value: needRefreshValue };
  const offlineReady = { value: false };

  return {
    needRefresh,
    offlineReady,
    async updateServiceWorker() {
      needRefresh.value = false;
      offlineReady.value = false;
    },
    closePrompt() {
      needRefresh.value = false;
      offlineReady.value = false;
    },
  };
}

export async function runPwaOfflineFeatureScenario() {
  const db = new BalkonBilanzDb(`pwa-bdd-${randomUUID()}`);
  await db.open();

  try {
    const store = createBrowserCaptureStore(db);
    const { container, unmount } = await mountVueComponent(resolve('src/features/capture/CaptureView.vue'), { store });

    try {
      await flush();

      setInputValue(container.querySelector('#meter-timestamp') as HTMLInputElement, '2026-05-11T07:00');
      setInputValue(container.querySelector('#meter-obis180') as HTMLInputElement, '1205');
      setInputValue(container.querySelector('#meter-obis280') as HTMLInputElement, '52');
      store.updateMeterDraft({ timestamp: '2026-05-11T07:00', obis180Kwh: '1205', obis280Kwh: '52', note: 'Offline meter' });
      await store.submitMeter();

      setInputValue(container.querySelector('#pv-day') as HTMLInputElement, '2026-05-10');
      setInputValue(container.querySelector('#pv-generation') as HTMLInputElement, '3.2');
      setInputValue(container.querySelector('#pv-source') as HTMLInputElement, 'manual');
      store.updatePvDraft({ day: '2026-05-10', generationKwh: '3.2', source: 'manual', note: 'Offline pv' });
      await store.submitPv();

      await waitForText(container, /Offline meter/);
      await waitForText(container, /Offline pv/);
    } finally {
      unmount();
    }

    const reloadedStore = createBrowserCaptureStore(db);
    const { container: reloaded, unmount: unmountReloaded } = await mountVueComponent(resolve('src/features/capture/CaptureView.vue'), { store: reloadedStore });
    const promptState = createPromptState(true);
    const { container: promptContainer, unmount: unmountPrompt } = await mountVueComponent(resolve('src/features/pwa/ReloadPrompt.vue'), { state: promptState });

    try {
      await flush();

      await waitForText(reloaded, /Offline meter/);
      await waitForText(reloaded, /Offline pv/);

      assert.match(promptContainer.textContent ?? '', /Neue Version verfügbar/);
    } finally {
      unmountReloaded();
      unmountPrompt();
    }
  } finally {
    await db.delete();
  }
}
