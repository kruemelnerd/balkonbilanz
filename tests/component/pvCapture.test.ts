import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { test } from 'node:test';
import { asPvDay, type PvDailyRecord } from '../../src/domain/types.ts';
import { createMemoryCaptureStore } from '../support/captureTestUtils.ts';
import { flush, mountVueComponent, setInputValue } from '../support/vueHarness.ts';

test('pv capture flow creates, edits, and deletes through rendered components', async () => {
  const store = createMemoryCaptureStore({
    pv: [
      {
        id: 1,
        day: asPvDay('2026-05-10'),
        generationKwh: 3.2,
        source: 'manual',
        createdAt: '2026-05-10T00:00:00.000Z',
        updatedAt: '2026-05-10T00:00:00.000Z',
      },
    ] satisfies PvDailyRecord[],
  });

  const { container, unmount } = await mountVueComponent(resolve('src/features/capture/CaptureView.vue'), { store });
  try {
    await flush();

    assert.equal(store.pv.entries.length, 1);

    setInputValue(container.querySelector('#pv-day') as HTMLInputElement, '2026-05-10');
    setInputValue(container.querySelector('#pv-generation') as HTMLInputElement, '4.1');
    setInputValue(container.querySelector('#pv-source') as HTMLInputElement, 'manual');
    setInputValue(container.querySelector('#pv-note') as HTMLTextAreaElement, 'updated');
    store.updatePvDraft({ day: '2026-05-10', generationKwh: '4.1', source: 'manual', note: 'updated' });
    await store.submitPv();
    await flush();

    assert.equal(store.pv.entries[0]?.generationKwh, 4.1);
    assert.equal(store.pv.entries[0]?.note, 'updated');

    await store.startPvEdit(store.pv.entries[0]?.id ?? 0);
    await flush();
    assert.equal(store.pv.editingId, store.pv.entries[0]?.id ?? 0);

    setInputValue(container.querySelector('#pv-generation') as HTMLInputElement, '4.4');
    store.updatePvDraft({ generationKwh: '4.4' });
    await store.submitPv();
    await flush();

    assert.equal(store.pv.entries[0]?.generationKwh, 4.4);

    await store.deletePv(store.pv.entries[0]?.id ?? 0);
    await flush();
    assert.equal(store.pv.entries.length, 0);
  } finally {
    unmount();
  }
});
