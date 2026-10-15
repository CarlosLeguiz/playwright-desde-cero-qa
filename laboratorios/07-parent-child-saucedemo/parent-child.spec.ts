// Lab 07 - Parent/child locators on saucedemo
// Run: npx playwright test laboratorios/07-parent-child-saucedemo/parent-child.spec.ts

import { test, expect, Page } from '@playwright/test';

// Every product card has the same "Add to cart" button, so a global
// getByRole would match six buttons. We first scope to the card (parent)
// and then look for the button or price inside it (child).

async function login(page: Page) {
  await page.goto('https://www.saucedemo.com/');
  await page.getByPlaceholder('Username').fill('standard_user');
  await page.getByPlaceholder('Password').fill('secret_sauce');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL(/inventory\.html/);
}

test.describe('Parent/child - saucedemo', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('add the Fleece Jacket from its own card', async ({ page }) => {
    // 1. Find the card (parent) by its text
    const card = page.locator('div.inventory_item').filter({ hasText: 'Sauce Labs Fleece Jacket' });
    await expect(card).toHaveCount(1);

    // 2. Price inside the card
    await expect(card.locator('.inventory_item_price')).toHaveText('$49.99');

    // 3. Click "Add to cart" inside the card
    await card.getByRole('button', { name: 'Add to cart' }).click();

    // 4. The same card now shows "Remove"
    await expect(card.getByRole('button', { name: 'Remove' })).toBeVisible();
    await expect(card.getByRole('button', { name: 'Add to cart' })).toHaveCount(0);

    // 5. Cart badge shows 1
    await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveText('1');
  });

  test('add every product cheaper than $16', async ({ page }) => {
    const cards = page.locator('div.inventory_item');
    await expect(cards.first()).toBeVisible();

    // 1. Go through every card, read its price and add it if cheap
    const added: string[] = [];
    for (const card of await cards.all()) {
      const priceText = await card.locator('.inventory_item_price').textContent();
      const price = Number(priceText?.replace('$', ''));
      expect(Number.isNaN(price), `Invalid price: ${priceText}`).toBe(false);

      if (price < 16) {
        const name = await card.locator('.inventory_item_name').textContent();
        await card.getByRole('button', { name: 'Add to cart' }).click();
        await expect(card.getByRole('button', { name: 'Remove' })).toBeVisible();
        added.push(name ?? '');
      }
    }

    // 2. At least one product should match, otherwise the test proves nothing
    console.log('Added to cart:', added);
    expect(added.length).toBeGreaterThan(0);

    // 3. Badge matches the number of products added
    await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveText(String(added.length));
  });
});
