import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { test } from 'node:test';
import { createBatteryAdvisorService } from '../../src/services/batteryAdvisorService.ts';
import { mountVueComponent, flush, clickElement, setInputValue } from '../support/vueHarness.ts';

test('battery advisor card shows fixed scenarios and a poor-quality warning', async () => {
  const { container, unmount } = await mountVueComponent(resolve('src/features/settings/BatteryAdvisorCard.vue'), {
    context: {
      analysisBasis: {
        combined: { exportKwh: 40, selfConsumptionKwh: 10, importKwh: 80, autarkyPercent: 20 },
        qualityLevel: 'poor',
        analysisPeriodDays: 30,
        electricityPriceEurPerKwh: 0.305,
      },
    },
    service: createBatteryAdvisorService(),
  });

  try {
    await flush();

    clickElement(container.querySelector('button[type="button"]') as HTMLButtonElement);
    await flush();

    assert.match(container.textContent ?? '', /Konservativ/);
    assert.match(container.textContent ?? '', /Realistisch/);
    assert.match(container.textContent ?? '', /Optimistisch/);
    assert.match(container.textContent ?? '', /Theoretisches Maximum/);
    assert.match(container.textContent ?? '', /Erfasse länger und vollständiger/);
  } finally {
    unmount();
  }
});

test('battery advisor card disables calculation without analysis data', async () => {
  const { container, unmount } = await mountVueComponent(resolve('src/features/settings/BatteryAdvisorCard.vue'), {
    context: {
      analysisBasis: {
        combined: null,
        qualityLevel: 'good',
        analysisPeriodDays: 30,
        electricityPriceEurPerKwh: 0.305,
      },
    },
    service: createBatteryAdvisorService(),
  });

  try {
    await flush();

    assert.equal((container.querySelector('button[type="button"]') as HTMLButtonElement | null)?.disabled, true);
    assert.match(container.textContent ?? '', /Für den Speicherberater brauchst du zuerst Auswertungsdaten/);
  } finally {
    unmount();
  }
});
