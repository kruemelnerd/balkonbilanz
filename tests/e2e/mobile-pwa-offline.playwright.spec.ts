import { expect, test, type Page } from '@playwright/test';

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

test('mobile pwa offline reload keeps capture data visible', async ({ page, context }) => {
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

  await context.setOffline(true);
  await page.reload();

  await expect(page.getByRole('heading', { name: 'BalkonBilanz' })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Zählerverlauf' })).toContainText('Offline meter');
  await expect(page.getByRole('region', { name: 'PV-Tageswerte' })).toContainText('Offline pv');
});

test('mobile pwa update hint can be confirmed in the real browser flow', async ({ page }) => {
  await page.goto('/capture');

  await expect(page.getByRole('heading', { name: 'BalkonBilanz' })).toBeVisible();
  await expect(page.getByRole('alert')).toContainText('Neue Version verfügbar');
  await page.getByRole('button', { name: 'Jetzt aktualisieren' }).click();
  await expect(page.getByRole('alert')).toContainText('Neue Version verfügbar');
});
