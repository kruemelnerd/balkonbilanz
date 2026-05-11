import { test, expect } from '@playwright/test';

test.describe('mobile capture flows', () => {
  test('meter and pv capture smoke flow', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.setContent(`
      <main>
        <form aria-label="meter">
          <input aria-label="Zeitpunkt" />
          <input aria-label="OBIS 1.8.0" />
          <input aria-label="OBIS 2.8.0" />
          <button type="submit">Speichern</button>
        </form>
        <form aria-label="pv">
          <input aria-label="Tag" />
          <input aria-label="Ertrag" />
          <button type="submit">Speichern</button>
        </form>
      </main>
    `);

    await expect(page.getByRole('form', { name: 'meter' })).toBeVisible();
    await expect(page.getByRole('form', { name: 'pv' })).toBeVisible();
  });
});
