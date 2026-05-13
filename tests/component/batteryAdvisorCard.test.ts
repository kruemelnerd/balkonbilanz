import assert from 'node:assert/strict';
import { test } from 'node:test';
import { clickElement, flush, mountVueComponent, setInputValue } from '../support/vueHarness.ts';

const batteryPath = new URL('../../src/features/settings/BatteryAdvisorCard.vue', import.meta.url).pathname;

test('battery advisor card renders the fixed scenario order', async () => {
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

test('battery advisor card recalculates after input changes and calculate click', async () => {
  const { container, unmount } = await mountVueComponent(batteryPath);

  const firstSavings = Array.from(container.querySelectorAll('.battery-scenario-card .battery-scenario-card__savings'))[1]?.textContent ?? '';
  setInputValue(container.querySelector('#battery-capacity') as HTMLInputElement, '10');
  const calculateButton = Array.from(container.querySelectorAll('button')).find((button) => button.textContent?.includes('Speicher-Szenarien berechnen'));
  clickElement(calculateButton as HTMLElement);
  await flush();
  const updatedSavings = Array.from(container.querySelectorAll('.battery-scenario-card .battery-scenario-card__savings'))[1]?.textContent ?? '';

  assert.notEqual(firstSavings, updatedSavings);

  unmount();
});

test('battery advisor card shows a poor-quality warning above the scenarios', async () => {
  const { container, unmount } = await mountVueComponent(batteryPath, {
    snapshot: {
      input: {
        storagePriceEur: 5200,
        capacityKwh: 8,
        efficiency: 0.92,
        analysisPeriodDays: 30,
        qualityLevel: 'poor',
      },
    },
  });

  assert.match(container.textContent ?? '', /Aussagekraft eingeschränkt/);
  assert.match(container.textContent ?? '', /erst längere Datenerfassung abwarten/);

  unmount();
});
