import assert from 'node:assert/strict';
import 'fake-indexeddb/auto';
import { test } from 'node:test';
import { flush, installDom, loadVueComponent } from '../support/vueHarness.ts';
import { BalkonBilanzDb } from '../../src/db/database.ts';
import { asMeterTimestamp, asPvDay } from '../../src/domain/types.ts';

const appPath = new URL('../../src/App.vue', import.meta.url).pathname;

test('mobile settings battery smoke flow covers route navigation without manual quality toggles', async () => {
  const window = installDom();
  const container = window.document.createElement('div');
  window.document.body.appendChild(container);
  const App = await loadVueComponent(appPath);
  const { createApp, h } = await import('vue');
  const { createAppRouter } = await import('../../src/router/index.ts');
  const settingsView = await loadVueComponent(new URL('../../src/features/settings/SettingsView.vue', import.meta.url).pathname);
  const viewStub = { render: () => h('main', [h('p', 'Stub')]) };
  const router = createAppRouter({ dashboard: viewStub, capture: viewStub, analysis: viewStub, settings: settingsView });

  try {
    await router.push('/dashboard');
    await router.isReady();

    const app = createApp(App);
    app.use(router);
    app.mount(container);

    await flush();

    const settingsLink = Array.from(container.querySelectorAll('a')).find((link) => link.textContent?.includes('Mehr')) as HTMLElement | undefined;
    assert.ok(settingsLink);
    settingsLink?.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }));
    for (let i = 0; i < 25 && !(container.textContent ?? '').includes('Speicherberater'); i += 1) {
      await flush();
    }

    assert.equal(router.currentRoute.value.fullPath, '/settings');
    assert.match(container.textContent ?? '', /Speicherberater/);

    const capacity = container.querySelector('#battery-capacity') as HTMLInputElement;
    capacity.value = '10';
    capacity.dispatchEvent(new window.Event('input', { bubbles: true, cancelable: true }));
    capacity.dispatchEvent(new window.Event('change', { bubbles: true, cancelable: true }));

    const calculateButton = Array.from(container.querySelectorAll('button')).find((button) => button.textContent?.includes('Speicher-Szenarien berechnen')) as HTMLElement | undefined;
    calculateButton?.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }));
    await flush();

    assert.equal(Array.from(container.querySelectorAll('button')).some((button) => button.textContent?.trim() === 'poor'), false);
    assert.match(container.textContent ?? '', /Speicher-Szenarien berechnen/);

    app.unmount();
  } finally {
    container.remove();
  }
});

test('mobile settings battery flow refreshes the advisor after saving a new electricity price', async () => {
  const db = new BalkonBilanzDb();
  await db.meterReadings.clear();
  await db.pvDailyEntries.clear();

  const today = new Date();
  const day = (offset: number) => new Date(today.getTime() - offset * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  await db.meterReadings.bulkAdd([
    { timestamp: asMeterTimestamp(`${day(2)}T12:00:00.000Z`), obis180Kwh: 1000, obis280Kwh: 500, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { timestamp: asMeterTimestamp(`${day(1)}T12:00:00.000Z`), obis180Kwh: 1008, obis280Kwh: 505, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  ]);
  await db.pvDailyEntries.bulkAdd([
    { day: asPvDay(day(2) as `${number}-${number}-${number}`), generationKwh: 2.4, source: 'test', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { day: asPvDay(day(1) as `${number}-${number}-${number}`), generationKwh: 3.2, source: 'test', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  ]);

  const window = installDom();
  const container = window.document.createElement('div');
  window.document.body.appendChild(container);
  const App = await loadVueComponent(appPath);
  const { createApp, h } = await import('vue');
  const { createAppRouter } = await import('../../src/router/index.ts');
  const settingsView = await loadVueComponent(new URL('../../src/features/settings/SettingsView.vue', import.meta.url).pathname);
  const viewStub = { render: () => h('main', [h('p', 'Stub')]) };
  const router = createAppRouter({ dashboard: viewStub, capture: viewStub, analysis: viewStub, settings: settingsView });

  try {
    await router.push('/dashboard');
    await router.isReady();

    const app = createApp(App);
    app.use(router);
    app.mount(container);

    await flush();

    const settingsLink = Array.from(container.querySelectorAll('a')).find((link) => link.textContent?.includes('Mehr')) as HTMLElement | undefined;
    assert.ok(settingsLink);
    settingsLink?.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }));
    for (let i = 0; i < 25 && !(container.textContent ?? '').includes('Speicherberater'); i += 1) {
      await flush();
    }

    const beforeSavings = Array.from(container.querySelectorAll('.battery-scenario-card .battery-scenario-card__savings'))[1]?.textContent ?? '';
    const strompreis = container.querySelector('#settings-strompreis') as HTMLInputElement;
    strompreis.value = '0.420';
    strompreis.dispatchEvent(new window.Event('input', { bubbles: true, cancelable: true }));
    strompreis.dispatchEvent(new window.Event('change', { bubbles: true, cancelable: true }));

    const saveButton = Array.from(container.querySelectorAll('button')).find((button) => button.textContent?.includes('Einstellungen speichern')) as HTMLElement | undefined;
    saveButton?.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }));
    await flush();

    const afterSavings = Array.from(container.querySelectorAll('.battery-scenario-card .battery-scenario-card__savings'))[1]?.textContent ?? '';

    assert.notEqual(beforeSavings, afterSavings);

    app.unmount();
  } finally {
    container.remove();
    await db.delete();
  }
});
