import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { runPwaOfflineFeatureScenario } from './steps/pwaOffline.steps.ts';

const featureText = readFileSync(new URL('./pwa-offline.feature', import.meta.url), 'utf8');

test('Scenario: Nutzer speichert Daten offline und sieht den Update-Hinweis', async () => {
  assert.match(featureText, /Feature: PWA Offline/);
  assert.match(featureText, /Scenario: Nutzer speichert Daten offline und sieht den Update-Hinweis/);
  assert.match(featureText, /Given ein browsergestützter Capture-Store ist leer/);
  assert.match(featureText, /When ich einen Zählerstand und einen PV-Tageswert speichere/);
  assert.match(featureText, /And die App neu lade/);
  assert.match(featureText, /Then bleiben die gespeicherten Einträge sichtbar/);
  assert.match(featureText, /When eine neue Version verfuegbar ist/);
  assert.match(featureText, /Then sehe ich den Hinweis Neue Version verfuegbar/);

  await runPwaOfflineFeatureScenario();
});
