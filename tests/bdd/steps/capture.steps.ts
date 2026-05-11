import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { test } from 'node:test';
import { asMeterTimestamp, asPvDay } from '../../../src/domain/types.ts';
import { createMemoryCaptureStore } from '../../support/captureTestUtils.ts';
import { flush, mountVueComponent, setInputValue } from '../../support/vueHarness.ts';

test('Scenario: meter capture creates and edits a reading', async () => {
  const store = createMemoryCaptureStore();
  const { container, unmount } = await mountVueComponent(resolve('src/features/capture/CaptureView.vue'), { store });

  try {
    const expectedTimestamp = new Date('2026-05-10T07:00').toISOString();
    setInputValue(container.querySelector('#meter-timestamp') as HTMLInputElement, '2026-05-10T07:00');
    setInputValue(container.querySelector('#meter-obis180') as HTMLInputElement, '1200');
    setInputValue(container.querySelector('#meter-obis280') as HTMLInputElement, '50');
    store.updateMeterDraft({ timestamp: '2026-05-10T07:00', obis180Kwh: '1200', obis280Kwh: '50' });
    await store.submitMeter();
    await flush();

    assert.equal(store.meter.readings[0]?.timestamp, asMeterTimestamp(expectedTimestamp));

    await store.startMeterEdit(store.meter.readings[0]?.id ?? 0);
    await flush();

    setInputValue(container.querySelector('#meter-obis180') as HTMLInputElement, '1201');
    await store.submitMeter();
    await flush();

    assert.equal(store.meter.readings[0]?.obis180Kwh, 1201);
  } finally {
    unmount();
  }
});

test('Scenario: pv capture blocks today and upserts the same day', async () => {
  const store = createMemoryCaptureStore();
  const { container, unmount } = await mountVueComponent(resolve('src/features/capture/CaptureView.vue'), { store });

  try {
    const today = new Date().toISOString().slice(0, 10);
    setInputValue(container.querySelector('#pv-day') as HTMLInputElement, today);
    setInputValue(container.querySelector('#pv-generation') as HTMLInputElement, '3.2');
    setInputValue(container.querySelector('#pv-source') as HTMLInputElement, 'manual');
    await store.submitPv();
    await flush();

    assert.ok(store.pv.issues.some((issue) => issue.code === 'future_or_today_day'));

    setInputValue(container.querySelector('#pv-day') as HTMLInputElement, '2026-05-10');
    store.updatePvDraft({ day: '2026-05-10', generationKwh: '3.2', source: 'manual' });
    await store.submitPv();
    await flush();

    setInputValue(container.querySelector('#pv-day') as HTMLInputElement, '2026-05-10');
    setInputValue(container.querySelector('#pv-generation') as HTMLInputElement, '3.8');
    store.updatePvDraft({ day: '2026-05-10', generationKwh: '3.8', source: 'manual' });
    await store.submitPv();
    await flush();

    assert.equal(store.pv.entries[0]?.day, asPvDay('2026-05-10'));
    assert.equal(store.pv.entries[0]?.generationKwh, 3.8);
  } finally {
    unmount();
  }
});
