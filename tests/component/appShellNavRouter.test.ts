import assert from 'node:assert/strict';
import { test } from 'node:test';
import { flush, installDom, loadVueComponent } from '../support/vueHarness.ts';

test('redirects root to dashboard and shows shell labels', async () => {
  const window = installDom();
  const container = window.document.createElement('div');
  window.document.body.appendChild(container);
  const App = await loadVueComponent(new URL('../../src/App.vue', import.meta.url).pathname);
  const { createAppRouter } = await import('../../src/router/index.ts');
  const { createApp, h, nextTick } = await import('vue');
  const viewStub = { render: () => h('main', [h('p', 'Stub')]) };
  const router = createAppRouter({
    dashboard: viewStub,
    capture: viewStub,
    analysis: viewStub,
    settings: viewStub,
  });

  await router.push('/');
  await router.isReady();

  const app = createApp(App);
  app.use(router);
  app.mount(container);

  await flush();
  await nextTick();

  assert.equal(router.currentRoute.value.fullPath, '/dashboard');
  assert.match(container.textContent ?? '', /Dashboard/);
  assert.match(container.textContent ?? '', /Erfassung/);
  assert.match(container.textContent ?? '', /Analyse/);
  assert.match(container.textContent ?? '', /Mehr/);

  app.unmount();
});

test('shell navigation links update the active route', async () => {
  const window = installDom();
  const container = window.document.createElement('div');
  window.document.body.appendChild(container);
  const App = await loadVueComponent(new URL('../../src/App.vue', import.meta.url).pathname);
  const { createAppRouter } = await import('../../src/router/index.ts');
  const { createApp, h } = await import('vue');
  const viewStub = { render: () => h('main', [h('p', 'Stub')]) };
  const router = createAppRouter({
    dashboard: viewStub,
    capture: viewStub,
    analysis: viewStub,
    settings: viewStub,
  });

  await router.push('/dashboard');
  await router.isReady();

  const app = createApp(App);
  app.use(router);
  app.mount(container);

  await flush();

  const captureLink = Array.from(container.querySelectorAll('a')).find((link) => link.textContent?.includes('Erfassung'));
  const analysisLink = Array.from(container.querySelectorAll('a')).find((link) => link.textContent?.includes('Analyse'));
  const settingsLink = Array.from(container.querySelectorAll('a')).find((link) => link.textContent?.includes('Mehr'));

  assert.ok(captureLink);
  assert.ok(analysisLink);
  assert.ok(settingsLink);

  captureLink?.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }));
  await flush();
  assert.equal(router.currentRoute.value.fullPath, '/capture');

  analysisLink?.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }));
  await flush();
  assert.equal(router.currentRoute.value.fullPath, '/analysis');

  settingsLink?.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }));
  await flush();
  assert.equal(router.currentRoute.value.fullPath, '/settings');

  app.unmount();
});
