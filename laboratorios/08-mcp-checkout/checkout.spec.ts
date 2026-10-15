// Lab 08 - Full checkout on saucedemo, locators taken from the accessibility snapshot
// Run: npx playwright test laboratorios/08-mcp-checkout/checkout.spec.ts

import { test, expect } from '@playwright/test';

test('checkout of Sauce Labs Backpack as standard_user', async ({ page }) => {
  await page.goto('https://www.saucedemo.com/');

  await page.getByPlaceholder('Username').fill('standard_user');
  await page.getByPlaceholder('Password').fill('secret_sauce');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL(/inventory\.html/);

  // The snapshot shows 6 identical "Add to cart" buttons, so scope to the card first
  const backpackCard = page.locator('.inventory_item').filter({ hasText: 'Sauce Labs Backpack' });
  await backpackCard.getByRole('button', { name: 'Add to cart' }).click();
  await expect(page.getByRole('button', { name: 'Cart, 1 items' })).toBeVisible();

  await page.getByRole('button', { name: 'Cart, 1 items' }).click();
  await expect(page).toHaveURL(/cart\.html/);
  await page.getByRole('button', { name: 'Checkout' }).click();

  await page.getByPlaceholder('First Name').fill('Ali');
  await page.getByPlaceholder('Last Name').fill('Raza');
  await page.getByPlaceholder('Zip/Postal Code').fill('54000');
  await page.getByRole('button', { name: 'Continue' }).click();

  await expect(page).toHaveURL(/checkout-step-two\.html/);
  await page.getByRole('button', { name: 'Finish' }).click();

  await expect(page.getByRole('heading', { name: 'Thank you for your order!' })).toBeVisible();
});
