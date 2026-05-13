import { expect, test, type Page, type Route, type Response } from '@playwright/test';

type CachedResponse = {
  status: number;
  headers: Record<string, string>;
  body: Buffer;
};

function createOfflineCache() {
  const cachedResponses = new Map<string, CachedResponse>();
  let offline = false;

  return {
    setOffline(value: boolean) {
      offline = value;
    },
    async handle(route: Route) {
      const request = route.request();
      const url = request.url();

      if (!['GET', 'HEAD'].includes(request.method())) {
        return route.continue();
      }

      if (offline) {
        const cached = cachedResponses.get(url);
        if (!cached) {
          return route.abort();
        }

        return route.fulfill({
          status: cached.status,
          headers: cached.headers,
          body: cached.body,
        });
      }

      const response = await route.fetch();
      const body = await response.body();
      cachedResponses.set(url, {
        status: response.status(),
        headers: response.headers(),
        body,
      });

      return route.fulfill({
        response,
        body,
      });
    },
  };
}

async function fillMeterForm(page: Page, values: { timestamp: string; obis180: string; obis280: string; note: string }) {
  const meterForm = page.getByRole('form', { name: 'Zählerstand erfassen' });
  await meterForm.getByLabel('Zeitpunkt').fill(values.timestamp);
  await meterForm.getByLabel('OBIS 1.8.0 (kWh)').fill(values.obis180);
  await meterForm.getByLabel('OBIS 2.8.0 (kWh)').fill(values.obis280);
  await meterForm.getByLabel('Notiz').fill(values.note);

  return meterForm;
}

async function fillPvForm(page: Page, values: { day: string; generation: string; note: string }) {
  const pvForm = page.getByRole('form', { name: 'PV-Ertrag erfassen' });
  await pvForm.getByLabel('Tag').fill(values.day);
  await pvForm.getByLabel('Ertrag (kWh)').fill(values.generation);
  await pvForm.getByLabel('Quelle').fill('manual');
  await pvForm.getByLabel('Notiz').fill(values.note);

  return pvForm;
}

async function setPromptNeedRefresh(page: Page, value: boolean) {
  await page.evaluate((nextValue) => {
    const app = (document.querySelector('#app') as HTMLElement & { __vue_app__?: { _context: { provides: Record<symbol, unknown> } } })?.__vue_app__;

    if (!app) {
      throw new Error('Vue app instance not found');
    }

    const provideKey = Object.getOwnPropertySymbols(app._context.provides).find((symbol) => String(symbol).includes('pwa-prompt-state'));

    if (!provideKey) {
      throw new Error('PWA prompt state not provided');
    }

    const promptState = app._context.provides[provideKey] as {
      needRefresh: { value: boolean };
      offlineReady: { value: boolean };
    };

    promptState.needRefresh.value = nextValue;
    if (!nextValue) {
      promptState.offlineReady.value = false;
    }
  }, value);
}

test('mobile pwa offline reload keeps capture data visible', async ({ page, context }) => {
  const offlineCache = createOfflineCache();
  await context.route('**/*', (route) => offlineCache.handle(route));

  await page.goto('/capture');

  await expect(page.getByRole('heading', { name: 'BalkonBilanz' })).toBeVisible();

  const meterForm = await fillMeterForm(page, {
    timestamp: '2026-05-11T07:00',
    obis180: '1205',
    obis280: '52',
    note: 'Offline meter',
  });
  await meterForm.evaluate((form) => (form as HTMLFormElement).requestSubmit());

  const pvForm = await fillPvForm(page, {
    day: '2026-05-10',
    generation: '3.2',
    note: 'Offline pv',
  });
  await pvForm.evaluate((form) => (form as HTMLFormElement).requestSubmit());

  await expect(page.getByRole('region', { name: 'Zählerverlauf' })).toContainText('Offline meter');
  await expect(page.getByRole('region', { name: 'PV-Tageswerte' })).toContainText('Offline pv');

  offlineCache.setOffline(true);
  await context.setOffline(true);
  await page.reload();

  await expect(page.getByRole('heading', { name: 'BalkonBilanz' })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Zählerverlauf' })).toContainText('Offline meter');
  await expect(page.getByRole('region', { name: 'PV-Tageswerte' })).toContainText('Offline pv');
});

test('mobile pwa update hint can be confirmed in the real browser flow', async ({ page }) => {
  await page.goto('/capture');

  await expect(page.getByRole('heading', { name: 'BalkonBilanz' })).toBeVisible();

  await setPromptNeedRefresh(page, true);

  const prompt = page.getByRole('alert');
  await expect(prompt).toContainText('Neue Version verfügbar');
  await expect(prompt.getByRole('button', { name: 'Jetzt aktualisieren' })).toBeVisible();

  await prompt.getByRole('button', { name: 'Jetzt aktualisieren' }).click();
  await expect(prompt).toBeHidden();
});
