import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { test } from 'node:test';
import { createMemoryCaptureStore } from '../support/captureTestUtils.ts';
import { flush, mountVueComponent, setInputValue } from '../support/vueHarness.ts';

test('pv form surfaces today-blocking validation errors as inline issues', async () => {
  const store = createMemoryCaptureStore();

  const { container, unmount } = await mountVueComponent(resolve('src/features/pv/PvDailyForm.vue'), { store });
  try {
    const today = new Date().toISOString().slice(0, 10);
    setInputValue(container.querySelector('#pv-day') as HTMLInputElement, today);
    setInputValue(container.querySelector('#pv-generation') as HTMLInputElement, '3.2');
    setInputValue(container.querySelector('#pv-source') as HTMLInputElement, 'manual');
    store.updatePvDraft({ day: today, generationKwh: '3.2', source: 'manual' });
    await store.submitPv();
    await flush();

    assert.ok(store.pv.issues.some((issue) => issue.code === 'future_or_today_day'));
    assert.equal(container.querySelector('h2')?.textContent, 'PV-Ertrag erfassen');
  } finally {
    unmount();
  }
});
