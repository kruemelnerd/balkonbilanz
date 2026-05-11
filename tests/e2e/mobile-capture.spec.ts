import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { test } from 'node:test';
import { createMemoryCaptureStore } from '../support/captureTestUtils.ts';
import { flush, mountVueComponent, setInputValue } from '../support/vueHarness.ts';

test('mobile capture smoke flow covers the productive app shell', async () => {
  const store = createMemoryCaptureStore();
  const { container, unmount } = await mountVueComponent(resolve('src/features/capture/CaptureView.vue'), { store });

  try {
    await flush();

    assert.equal(container.querySelector('h1')?.textContent, 'BalkonBilanz');

    setInputValue(container.querySelector('#meter-timestamp') as HTMLInputElement, '2026-05-11T07:00');
    setInputValue(container.querySelector('#meter-obis180') as HTMLInputElement, '1205');
    setInputValue(container.querySelector('#meter-obis280') as HTMLInputElement, '52');
    store.updateMeterDraft({ timestamp: '2026-05-11T07:00', obis180Kwh: '1205', obis280Kwh: '52' });
    await store.submitMeter();
    await flush();

    setInputValue(container.querySelector('#pv-day') as HTMLInputElement, '2026-05-10');
    setInputValue(container.querySelector('#pv-generation') as HTMLInputElement, '3.2');
    setInputValue(container.querySelector('#pv-source') as HTMLInputElement, 'manual');
    store.updatePvDraft({ day: '2026-05-10', generationKwh: '3.2', source: 'manual' });
    await store.submitPv();
    await flush();

    assert.equal(store.meter.readings.length, 1);
    assert.equal(store.pv.entries.length, 1);

    await store.startMeterEdit(store.meter.readings[0]?.id ?? 0);
    await flush();
    assert.equal(store.meter.editingId, store.meter.readings[0]?.id ?? 0);
  } finally {
    unmount();
  }
});
