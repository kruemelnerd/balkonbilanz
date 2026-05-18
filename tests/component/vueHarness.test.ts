import assert from 'node:assert/strict';
import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { test } from 'node:test';
import { getVueHarnessTmpDir, loadVueComponent } from '../support/vueHarness.ts';

test('vue harness compiles into a run-specific temporary directory', async () => {
  const tmpRoot = getVueHarnessTmpDir();

  assert.match(tmpRoot, /\.planning\/tmp-vue-/);
  assert.match(tmpRoot, new RegExp(`^${resolve('.').replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`));

  await loadVueComponent(resolve('src/features/shell/AppShellNav.vue'));

  const compiledFiles = readdirSync(tmpRoot).filter((file) => file.endsWith('.ts'));
  assert.ok(compiledFiles.length > 0);
});
