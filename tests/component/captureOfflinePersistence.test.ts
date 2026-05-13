import assert from 'node:assert/strict';
import 'fake-indexeddb/auto';
import { randomUUID } from 'node:crypto';
import { resolve } from 'node:path';
import { test } from 'node:test';
import { BalkonBilanzDb, createBrowserCaptureDependencies, createBrowserCaptureStore } from '../../src/db/database.ts';
import { mountVueComponent, flush, setInputValue } from '../support/vueHarness.ts';

async function waitForText(container: HTMLElement, text: RegExp) {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    if (text.test(container.textContent ?? '')) {
      return;
    }

    await flush();
  }

  assert.match(container.textContent ?? '', text);
}

test('capture view keeps saved readings and PV values after a reload', async () => {
  const db = new BalkonBilanzDb(`capture-offline-${randomUUID()}`);
  await db.open();

  try {
    const store = createBrowserCaptureStore(db);
    const { container, unmount } = await mountVueComponent(resolve('src/features/capture/CaptureView.vue'), { store });

    try {
      await flush();

      setInputValue(container.querySelector('#meter-timestamp') as HTMLInputElement, '2026-05-11T07:00');
      setInputValue(container.querySelector('#meter-obis180') as HTMLInputElement, '1205');
      setInputValue(container.querySelector('#meter-obis280') as HTMLInputElement, '52');
      setInputValue(container.querySelector('#meter-note') as HTMLTextAreaElement, 'Offline meter');
      store.updateMeterDraft({
        timestamp: '2026-05-11T07:00',
        obis180Kwh: '1205',
        obis280Kwh: '52',
        note: 'Offline meter',
      });
      await store.submitMeter();

      setInputValue(container.querySelector('#pv-day') as HTMLInputElement, '2026-05-10');
      setInputValue(container.querySelector('#pv-generation') as HTMLInputElement, '3.2');
      setInputValue(container.querySelector('#pv-source') as HTMLInputElement, 'manual');
      setInputValue(container.querySelector('#pv-note') as HTMLTextAreaElement, 'Offline pv');
      store.updatePvDraft({
        day: '2026-05-10',
        generationKwh: '3.2',
        source: 'manual',
        note: 'Offline pv',
      });
      await flush();
      await store.submitPv();
      await flush();

      await waitForText(container, /Offline meter/);
      await waitForText(container, /Offline pv/);
    } finally {
      unmount();
    }

    const rerenderedStore = createBrowserCaptureStore(db);
    const { container: rerendered, unmount: rerenderUnmount } = await mountVueComponent(resolve('src/features/capture/CaptureView.vue'), { store: rerenderedStore });

    try {
      await flush();

      await waitForText(rerendered, /Offline meter/);
      await waitForText(rerendered, /Offline pv/);
    } finally {
      rerenderUnmount();
    }
  } finally {
    await db.delete();
  }
});
