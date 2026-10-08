// @ts-check
const { test, expect } = require('@playwright/test');

test('la página tiene el logo de Playwright', async ({ page }) => {
  await page.goto('https://playwright.dev/');

  // Verificamos que exista una imagen con el alt "Playwright logo"
  await expect(page.getByRole('img', { name: 'Playwright logo' })).toBeVisible();
});

test('el link a la documentación existe', async ({ page }) => {
  await page.goto('https://playwright.dev/');

  // Verificamos que exista un link llamado "Docs"
  const linkDocs = page.getByRole('link', { name: 'Docs' }).first();
  await expect(linkDocs).toBeVisible();
});

test('al hacer click en "Docs" cambia la URL', async ({ page }) => {
  await page.goto('https://playwright.dev/');

  await page.getByRole('link', { name: 'Docs' }).first().click();

  // Verificamos que la URL contenga "/docs"
  await expect(page).toHaveURL(/\/docs/);
});