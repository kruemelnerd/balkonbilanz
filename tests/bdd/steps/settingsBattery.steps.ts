import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mountVueComponent } from '../../support/vueHarness.ts';

const batteryPath = new URL('../../../src/features/settings/BatteryAdvisorCard.vue', import.meta.url).pathname;

test('Scenario: Vier Szenarien bleiben in fixer Reihenfolge', async () => {
  const { container, unmount } = await mountVueComponent(batteryPath, {
    snapshot: {
      input: {
        storagePriceEur: 5200,
        capacityKwh: 8,
        efficiency: 0.92,
        analysisPeriodDays: 30,
        qualityLevel: 'good',
      },
    },
  });

  assert.deepEqual(
    Array.from(container.querySelectorAll('.battery-scenario-card h3')).map((heading) => heading.textContent?.trim()),
    ['konservativ', 'realistisch', 'optimistisch', 'theoretisch'],
  );

  unmount();
});
