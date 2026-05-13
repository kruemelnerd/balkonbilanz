import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { test } from 'node:test';
import { mountVueComponent, flush, clickElement } from '../support/vueHarness.ts';

function createPromptState(overrides: Partial<{
  needRefresh: { value: boolean };
  offlineReady: { value: boolean };
  updateServiceWorker: () => Promise<void>;
  dismiss: () => void;
}> = {}) {
  return {
    needRefresh: overrides.needRefresh ?? { value: false },
    offlineReady: overrides.offlineReady ?? { value: false },
    updateServiceWorker: overrides.updateServiceWorker ?? (async () => {}),
    dismiss: overrides.dismiss ?? (() => {}),
  };
}

test('reload prompt shows update action when a new version is available', async () => {
  let updated = false;
  const state = createPromptState({
    needRefresh: { value: true },
    updateServiceWorker: async () => {
      updated = true;
    },
  });

  const { container, unmount } = await mountVueComponent(resolve('src/features/pwa/ReloadPrompt.vue'), {
    state,
  });

  try {
    await flush();

    assert.match(container.textContent ?? '', /Neue Version verfügbar/);
    assert.match(container.textContent ?? '', /Jetzt aktualisieren/);

    clickElement(container.querySelector('button[name="pwa-update"]') as HTMLButtonElement);
    await flush();

    assert.equal(updated, true);
  } finally {
    unmount();
  }
});

test('reload prompt shows offline ready hint when the app can work offline', async () => {
  const state = createPromptState({
    offlineReady: { value: true },
  });

  const { container, unmount } = await mountVueComponent(resolve('src/features/pwa/ReloadPrompt.vue'), {
    state,
  });

  try {
    await flush();

    assert.match(container.textContent ?? '', /App ist jetzt offline bereit/);
    assert.match(container.textContent ?? '', /Hinweis schließen/);
  } finally {
    unmount();
  }
});
