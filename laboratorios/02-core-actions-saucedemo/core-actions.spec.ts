// Lab 02 - Core actions on saucedemo
// Run: npx playwright test laboratorios/02-core-actions-saucedemo/core-actions.spec.ts

import { test, expect } from '@playwright/test';

// Web-first assertions retry until they pass or time out,
// so there is never a reason to use waitForTimeout.

test('login, hover menu and add backpack to cart', async ({ page }) => {
  // 1. Login
  await page.goto('https://www.saucedemo.com/');
  await page.getByPlaceholder('Username').fill('standard_user');
  await page.getByPlaceholder('Password').fill('secret_sauce');
  await page.getByRole('button', { name: 'Login' }).click();

  // 2. Inventory page loaded
  await expect(page).toHaveURL(/inventory\.html/);
  await expect(page.locator('[data-test="title"]')).toHaveText('Products');

  // 3. Hover over the burger menu
  await page.getByRole('button', { name: 'Open Menu' }).hover();

  // 4. Add the backpack to the cart
  const backpack = page.locator('[data-test="inventory-item"]').filter({ hasText: 'Sauce Labs Backpack' });
  await backpack.getByRole('button', { name: 'Add to cart' }).click();

  // 5. Cart badge shows 1
  await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveText('1');
});
