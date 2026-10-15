// Lab 04 - Native <select> dropdown on saucedemo
// Run: npx playwright test laboratorios/04-dropdowns-saucedemo/sort-price.spec.ts

import { test, expect } from '@playwright/test';

// The sort dropdown is a native <select>, so selectOption() works.
// Choosing by label (the visible text) tests what the user sees;
// the value ("lohi") is an internal detail, so we only assert it.

test('sort products by price (low to high)', async ({ page }) => {
  // 1. Login
  await page.goto('https://www.saucedemo.com/');
  await page.getByPlaceholder('Username').fill('standard_user');
  await page.getByPlaceholder('Password').fill('secret_sauce');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL(/inventory\.html/);

  // 2. Pick the option by its visible label, not by value
  const sortSelect = page.locator('[data-test="product-sort-container"]');
  await sortSelect.selectOption({ label: 'Price (low to high)' });

  // 3. The internal value of the select is "lohi"
  await expect(sortSelect).toHaveValue('lohi');

  // 4. Read all prices ("$29.99" -> 29.99)
  const priceTexts = await page.locator('.inventory_item_price').allTextContents();
  const prices = priceTexts.map((text) => Number(text.replace('$', '')));

  // 5. Prices are sorted from lowest to highest
  expect(prices.length).toBeGreaterThan(0);
  const sorted = [...prices].sort((a, b) => a - b);
  expect(prices).toEqual(sorted);
});
