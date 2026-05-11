import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { test } from 'node:test';
import { asMeterTimestamp } from '../../src/domain/types.ts';
import { createMemoryCaptureStore } from '../support/captureTestUtils.ts';
import { flush, mountVueComponent, setInputValue } from '../support/vueHarness.ts';

test('meter form surfaces blocking validation errors and the change-flow banner', async () => {
  const store = createMemoryCaptureStore({
    meter: [
      {
        id: 1,
        timestamp: asMeterTimestamp('2026-05-10T07:00:00.000Z'),
        obis180Kwh: 1200,
        obis280Kwh: 50,
        createdAt: '2026-05-10T07:00:00.000Z',
        updatedAt: '2026-05-10T07:00:00.000Z',
      },
    ],
  });

  const { container, unmount } = await mountVueComponent(resolve('src/features/capture/CaptureView.vue'), { store });
  try {
    await store.submitMeter();
    await flush();

    assert.ok(store.meter.issues.some((issue) => issue.message === 'Pflichtfeld fehlt.'));
    assert.equal(container.querySelector('h2')?.textContent, 'Zaehlerstand erfassen');

    setInputValue(container.querySelector('#meter-timestamp') as HTMLInputElement, '2026-05-11T07:00');
    setInputValue(container.querySelector('#meter-obis180') as HTMLInputElement, '1190');
    setInputValue(container.querySelector('#meter-obis280') as HTMLInputElement, '49');
    store.updateMeterDraft({ timestamp: '2026-05-11T07:00', obis180Kwh: '1190', obis280Kwh: '49' });
    await store.submitMeter();
    await flush();

    assert.ok(store.meter.banner?.includes('Zählerwechsel'));
    assert.ok(store.meter.issues.some((issue) => issue.code === 'meter_value_decreased'));
  } finally {
    unmount();
  }
});
