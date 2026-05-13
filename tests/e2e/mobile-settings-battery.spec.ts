import assert from 'node:assert/strict';
import 'fake-indexeddb/auto';
import { test } from 'node:test';
import { flush, installDom, loadVueComponent } from '../support/vueHarness.ts';

const appPath = new URL('../../src/App.vue', import.meta.url).pathname;

test('mobile settings battery smoke flow covers route navigation and warning copy', async () => {
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
    await flush();

    assert.equal(router.currentRoute.value.fullPath, '/settings');
    assert.match(container.textContent ?? '', /Speicherberater/);

    const qualityPoor = Array.from(container.querySelectorAll('button')).find((button) => button.textContent?.trim() === 'poor') as HTMLElement | undefined;
    assert.ok(qualityPoor);
    qualityPoor?.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }));

    const capacity = container.querySelector('#battery-capacity') as HTMLInputElement;
    capacity.value = '10';
    capacity.dispatchEvent(new window.Event('input', { bubbles: true, cancelable: true }));
    capacity.dispatchEvent(new window.Event('change', { bubbles: true, cancelable: true }));

    const calculateButton = Array.from(container.querySelectorAll('button')).find((button) => button.textContent?.includes('Speicher-Szenarien berechnen')) as HTMLElement | undefined;
    calculateButton?.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }));
    await flush();

    assert.match(container.textContent ?? '', /Aussagekraft eingeschränkt/);
    assert.match(container.textContent ?? '', /erst längere Datenerfassung abwarten/);

    app.unmount();
  } finally {
    container.remove();
  }
});
