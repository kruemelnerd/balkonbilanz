import assert from 'node:assert/strict';
import 'fake-indexeddb/auto';
import { resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import { test } from 'node:test';
import { BalkonBilanzDb, createBrowserCaptureStore } from '../../src/db/database.ts';
import { createMemoryCaptureStore } from '../support/captureTestUtils.ts';
import { clickElement, flush, mountVueComponent, setInputValue } from '../support/vueHarness.ts';

async function waitFor(predicate: () => boolean, message: string) {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    if (predicate()) {
      return;
    }

    await flush();
  }

  assert.fail(message);
}

function submitForm(container: Element, selector: string) {
  const form = container.querySelector(selector);
  assert.ok(form, `Form ${selector} wurde nicht gefunden.`);
  form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
}

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

test('browser-backed capture flow persists save edit and reload', async () => {
  const dbName = `balkonbilanz-e2e-${randomUUID()}`;
  let db = new BalkonBilanzDb(dbName);
  let store = createBrowserCaptureStore(db);
  let mounted = await mountVueComponent(resolve('src/features/capture/CaptureView.vue'), { store });

  try {
    await store.loadMeterReadings();
    await store.loadPvEntries();
    await flush();

    setInputValue(mounted.container.querySelector('#meter-timestamp') as HTMLInputElement, '2026-05-11T07:00');
    setInputValue(mounted.container.querySelector('#meter-obis180') as HTMLInputElement, '1205');
    setInputValue(mounted.container.querySelector('#meter-obis280') as HTMLInputElement, '52');
    setInputValue(mounted.container.querySelector('#meter-note') as HTMLTextAreaElement, 'Erste Ablesung');
    submitForm(mounted.container, '.meter-entry-form');

    await waitFor(() => store.meter.readings.length === 1 && store.meter.busy === false, 'Meter-Eintrag wurde nicht gespeichert.');

    assert.equal(store.meter.readings.length, 1);
    assert.equal(store.meter.readings[0]?.note, 'Erste Ablesung');
    assert.match(mounted.container.querySelector('.meter-readings-list')?.textContent ?? '', /Erste Ablesung/);

    setInputValue(mounted.container.querySelector('#pv-day') as HTMLInputElement, '2026-05-10');
    setInputValue(mounted.container.querySelector('#pv-generation') as HTMLInputElement, '3.2');
    setInputValue(mounted.container.querySelector('#pv-source') as HTMLInputElement, 'manual');
    setInputValue(mounted.container.querySelector('#pv-note') as HTMLTextAreaElement, 'Mittagssonne');
    submitForm(mounted.container, '.pv-daily-form');

    await waitFor(() => store.pv.entries.length === 1 && store.pv.busy === false, 'PV-Eintrag wurde nicht gespeichert.');

    assert.equal(store.pv.entries.length, 1);
    assert.equal(store.pv.entries[0]?.note, 'Mittagssonne');
    assert.match(mounted.container.querySelector('.pv-daily-list')?.textContent ?? '', /Mittagssonne/);

    mounted.unmount();
    db.close();

    db = new BalkonBilanzDb(dbName);
    store = createBrowserCaptureStore(db);
    mounted = await mountVueComponent(resolve('src/features/capture/CaptureView.vue'), { store });
    await store.loadMeterReadings();
    await store.loadPvEntries();
    await flush();

    assert.equal(store.meter.readings.length, 1);
    assert.equal(store.meter.readings[0]?.obis180Kwh, 1205);
    assert.equal(store.meter.readings[0]?.note, 'Erste Ablesung');
    assert.equal(store.pv.entries.length, 1);
    assert.equal(store.pv.entries[0]?.generationKwh, 3.2);
    assert.equal(store.pv.entries[0]?.note, 'Mittagssonne');
    assert.match(mounted.container.querySelector('.meter-readings-list')?.textContent ?? '', /Erste Ablesung/);
    assert.match(mounted.container.querySelector('.pv-daily-list')?.textContent ?? '', /Mittagssonne/);

    clickElement(mounted.container.querySelector('.meter-readings-list button[aria-label*="bearbeiten"]') as HTMLElement);
    await waitFor(() => store.meter.editingId !== null, 'Meter-Bearbeitungsmodus wurde nicht aktiviert.');

    setInputValue(mounted.container.querySelector('#meter-obis180') as HTMLInputElement, '1206');
    setInputValue(mounted.container.querySelector('#meter-note') as HTMLTextAreaElement, 'Korrigierte Ablesung');
    submitForm(mounted.container, '.meter-entry-form');

    await waitFor(
      () => store.meter.readings[0]?.obis180Kwh === 1206 && store.meter.editingId === null && store.meter.busy === false,
      'Meter-Bearbeitung wurde nicht gespeichert.',
    );

    assert.equal(store.meter.readings[0]?.obis180Kwh, 1206);
    assert.equal(store.meter.readings[0]?.note, 'Korrigierte Ablesung');
    assert.match(mounted.container.querySelector('.meter-readings-list')?.textContent ?? '', /Korrigierte Ablesung/);

    clickElement(mounted.container.querySelector('.pv-daily-list button[aria-label*="bearbeiten"]') as HTMLElement);
    await waitFor(() => store.pv.editingId !== null, 'PV-Bearbeitungsmodus wurde nicht aktiviert.');

    setInputValue(mounted.container.querySelector('#pv-generation') as HTMLInputElement, '3.8');
    setInputValue(mounted.container.querySelector('#pv-note') as HTMLTextAreaElement, 'Nachbearbeitet');
    submitForm(mounted.container, '.pv-daily-form');

    await waitFor(
      () => store.pv.entries[0]?.generationKwh === 3.8 && store.pv.editingId === null && store.pv.busy === false,
      'PV-Bearbeitung wurde nicht gespeichert.',
    );

    assert.equal(store.pv.entries[0]?.generationKwh, 3.8);
    assert.equal(store.pv.entries[0]?.note, 'Nachbearbeitet');
    assert.match(mounted.container.querySelector('.pv-daily-list')?.textContent ?? '', /Nachbearbeitet/);

    mounted.unmount();
    db.close();

    db = new BalkonBilanzDb(dbName);
    store = createBrowserCaptureStore(db);
    mounted = await mountVueComponent(resolve('src/features/capture/CaptureView.vue'), { store });
    await store.loadMeterReadings();
    await store.loadPvEntries();
    await flush();

    assert.equal(store.meter.readings.length, 1);
    assert.equal(store.meter.readings[0]?.obis180Kwh, 1206);
    assert.equal(store.meter.readings[0]?.note, 'Korrigierte Ablesung');
    assert.equal(store.pv.entries.length, 1);
    assert.equal(store.pv.entries[0]?.generationKwh, 3.8);
    assert.equal(store.pv.entries[0]?.note, 'Nachbearbeitet');
    assert.match(mounted.container.querySelector('.meter-readings-list')?.textContent ?? '', /Korrigierte Ablesung/);
    assert.match(mounted.container.querySelector('.pv-daily-list')?.textContent ?? '', /Nachbearbeitet/);
  } finally {
    mounted.unmount();
    db.close();
    await db.delete();
  }
});
