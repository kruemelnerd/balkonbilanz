import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

const featureUrl = new URL('../analysis-dashboard.feature', import.meta.url);

async function readFeature() {
  return readFile(featureUrl, 'utf8');
}

test('Scenario: analysis dashboard feature exposes the expected phase-2 contract', async () => {
  const feature = await readFeature();

  assert.equal((feature.match(/^\s*Szenario:/gm) ?? []).length, 6);
  assert.match(feature, /Naeherung/);
  assert.match(feature, /good/);
  assert.match(feature, /limited/);
  assert.match(feature, /poor/);
  assert.match(feature, /Plausibilitaetswarnung/);
});

test('Scenario: analysis defaults and presets are spelled out', async () => {
  const feature = await readFeature();

  assert.match(feature, /30 Tage/);
  assert.match(feature, /7 Tage/);
  assert.match(feature, /90 Tage/);
});
