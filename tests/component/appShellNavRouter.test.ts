import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { test } from 'node:test';
import { mountVueComponent, flush } from '../support/vueHarness.ts';

test('app shell navigation exposes dashboard, capture, and analysis routes', async () => {
  let router: any;

  const { container, unmount } = await mountVueComponent(resolve('src/features/shell/AppShellNav.vue'), {}, {
    plugins: [async () => {
      const { createAppRouter } = await import('../../src/router/index.ts');
      router = createAppRouter({
        views: {
          dashboard: { template: '<div>Dashboard Stub</div>' } as any,
          capture: { template: '<div>Capture Stub</div>' } as any,
          analysis: { template: '<div>Analysis Stub</div>' } as any,
        },
      });

      await router.push('/');
      await router.isReady();
      return router;
    }],
  });

  try {
    await flush();

    assert.equal(router.currentRoute.value.fullPath, '/dashboard');

    assert.match(container.textContent ?? '', /Dashboard/);
    assert.match(container.textContent ?? '', /Erfassung/);
    assert.match(container.textContent ?? '', /Analyse/);
    assert.equal((container.querySelector('a[href="/dashboard"]') as HTMLAnchorElement | null)?.getAttribute('href'), '/dashboard');
    assert.equal((container.querySelector('a[href="/capture"]') as HTMLAnchorElement | null)?.getAttribute('href'), '/capture');
    assert.equal((container.querySelector('a[href="/analysis"]') as HTMLAnchorElement | null)?.getAttribute('href'), '/analysis');
  } finally {
    unmount();
  }
});
