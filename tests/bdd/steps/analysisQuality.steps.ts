import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

test('analysis quality feature declares the expected user language', () => {
  const feature = readFileSync(new URL('../analysis-quality.feature', import.meta.url), 'utf8');

  assert.match(feature, /Naeherung/);
  assert.match(feature, /good/);
  assert.match(feature, /limited/);
  assert.match(feature, /poor/);
  assert.match(feature, /Kosten noch nicht verfuegbar/);
});
