import { expect, test } from '@playwright/test';

async function fillMeterForm(page: any, values: {
  timestamp: string;
  obis180: string;
  obis280: string;
  note: string;
}) {
  const meterForm = page.getByRole('form', { name: 'Zählerstand erfassen' });
  await meterForm.getByLabel('Zeitpunkt').fill(values.timestamp);
  await meterForm.getByLabel('OBIS 1.8.0 (kWh)').fill(values.obis180);
  await meterForm.getByLabel('OBIS 2.8.0 (kWh)').fill(values.obis280);
  await meterForm.getByLabel('Notiz').fill(values.note);

  return meterForm;
}

async function fillPvForm(page: any, values: {
  day: string;
  generation: string;
  note: string;
}) {
  const pvForm = page.getByRole('form', { name: 'PV-Ertrag erfassen' });
  await pvForm.getByLabel('Tag').fill(values.day);
  await pvForm.getByLabel('Ertrag (kWh)').fill(values.generation);
  await pvForm.getByLabel('Quelle').fill('manual');
  await pvForm.getByLabel('Notiz').fill(values.note);

  return pvForm;
}

test('mobile capture smoke preserves save edit and reload in the running app', async ({ page }) => {
  await page.goto('/capture');

  await expect(page.getByRole('heading', { name: 'BalkonBilanz' })).toBeVisible();

  const meterForm = await fillMeterForm(page, {
    timestamp: '2026-05-11T07:00',
    obis180: '1205',
    obis280: '52',
    note: 'Erste Ablesung',
  });
  await meterForm.evaluate((form) => (form as HTMLFormElement).requestSubmit());

  const meterList = page.getByRole('region', { name: 'Zählerverlauf' });
  await expect(meterList).toContainText('Erste Ablesung');
  await expect(meterList).toContainText('1205');

  const pvForm = await fillPvForm(page, {
    day: '2026-05-10',
    generation: '3.2',
    note: 'Mittagssonne',
  });
  await pvForm.evaluate((form) => (form as HTMLFormElement).requestSubmit());

  const pvList = page.getByRole('region', { name: 'PV-Tageswerte' });
  await expect(pvList).toContainText('Mittagssonne');
  await expect(pvList).toContainText('3.2 kWh');

  await meterList.getByRole('button', { name: /bearbeiten/i }).click({ force: true });
  await expect(page.getByRole('heading', { name: 'Zaehlerstand bearbeiten' })).toBeVisible();
  await meterForm.getByLabel('OBIS 1.8.0 (kWh)').fill('1206');
  await meterForm.getByLabel('Notiz').fill('Korrigierte Ablesung');
  await meterForm.evaluate((form) => (form as HTMLFormElement).requestSubmit());

  await expect(meterList).toContainText('Korrigierte Ablesung');
  await expect(meterList).toContainText('1206');

  await pvList.getByRole('button', { name: /bearbeiten/i }).click({ force: true });
  await expect(page.getByRole('heading', { name: 'PV-Ertrag bearbeiten' })).toBeVisible();
  await pvForm.getByLabel('Ertrag (kWh)').fill('3.8');
  await pvForm.getByLabel('Notiz').fill('Nachbearbeitet');
  await pvForm.evaluate((form) => (form as HTMLFormElement).requestSubmit());

  await expect(pvList).toContainText('Nachbearbeitet');
  await expect(pvList).toContainText('3.8 kWh');

  await page.reload();

  await expect(page.getByRole('heading', { name: 'BalkonBilanz' })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Zählerverlauf' })).toContainText('Korrigierte Ablesung');
  await expect(page.getByRole('region', { name: 'Zählerverlauf' })).toContainText('1206');
  await expect(page.getByRole('region', { name: 'PV-Tageswerte' })).toContainText('Nachbearbeitet');
  await expect(page.getByRole('region', { name: 'PV-Tageswerte' })).toContainText('3.8 kWh');
});
