import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { test } from 'node:test';
import { asMeterTimestamp, type MeterReadingRecord } from '../../src/domain/types.ts';
import { createMemoryCaptureStore } from '../support/captureTestUtils.ts';
import { flush, mountVueComponent, setInputValue } from '../support/vueHarness.ts';

test('meter capture flow creates, edits, and deletes through the rendered shell', async () => {
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
    ] satisfies MeterReadingRecord[],
  });

  const { container, unmount } = await mountVueComponent(resolve('src/features/capture/CaptureView.vue'), { store });
  try {
    await flush();

    assert.equal(store.meter.readings.length, 1);
    const expectedTimestamp = new Date('2026-05-11T12:34').toISOString();

    setInputValue(container.querySelector('#meter-timestamp') as HTMLInputElement, '2026-05-11T12:34');
    setInputValue(container.querySelector('#meter-obis180') as HTMLInputElement, '1204.5');
    setInputValue(container.querySelector('#meter-obis280') as HTMLInputElement, '52');
    setInputValue(container.querySelector('#meter-note') as HTMLTextAreaElement, 'Morning read');
    store.updateMeterDraft({
      timestamp: '2026-05-11T12:34',
      obis180Kwh: '1204.5',
      obis280Kwh: '52',
      note: 'Morning read',
    });
    await store.submitMeter();
    await flush();

    assert.equal(store.meter.readings[0]?.timestamp, asMeterTimestamp(expectedTimestamp));
    assert.equal(store.meter.readings[0]?.note, 'Morning read');
    assert.match(container.textContent ?? '', /11\.05\.2026[\s\S]*12:34/);
    assert.doesNotMatch(container.textContent ?? '', /2026-05-11T12:34:00\.000Z/);

    await store.startMeterEdit(store.meter.readings[0]?.id ?? 0);
    await flush();
    assert.equal(store.meter.editingId, store.meter.readings[0]?.id ?? 0);
    assert.equal((container.querySelector('#meter-timestamp') as HTMLInputElement).value, '2026-05-11T12:34');

    setInputValue(container.querySelector('#meter-obis180') as HTMLInputElement, '1205');
    store.updateMeterDraft({ obis180Kwh: '1205' });
    await store.submitMeter();
    await flush();

    assert.equal(store.meter.readings[0]?.obis180Kwh, 1205);

    await store.deleteMeter(store.meter.readings[0]?.id ?? 0);
    await flush();
    assert.equal(store.meter.readings.length, 1);
  } finally {
    unmount();
  }
});
