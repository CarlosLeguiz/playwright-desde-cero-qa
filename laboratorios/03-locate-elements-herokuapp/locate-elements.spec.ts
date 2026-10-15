// Lab 03 - Locate elements on the-internet.herokuapp.com
// Run: npx playwright test laboratorios/03-locate-elements-herokuapp/locate-elements.spec.ts

import { test, expect } from '@playwright/test';

// Prefer user-facing locators (label, role) over CSS/ids:
// they survive refactors and also validate accessibility.

// the-internet.herokuapp.com is a shared public site with intermittent issues;
// the locators themselves are stable. We need both settings:
// - retries: to recover from occasional 503 responses.
// - timeout: some responses take ~30s, which would kill each attempt at the
//   default 30s timeout before the page ever loads.
test.describe.configure({ retries: 2, timeout: 90_000 });

test('login with valid credentials shows the green success message', async ({ page }) => {
  // 1. Go to the login page
  await page.goto('https://the-internet.herokuapp.com/login');

  // 2. Login
  await page.getByLabel('Username').fill('tomsmith');
  await page.getByLabel('Password').fill('SuperSecretPassword!');
  await page.getByRole('button', { name: 'Login' }).click();

  // 3. Green flash message is visible
  const flash = page.locator('#flash');
  await expect(page).toHaveURL(/\/secure$/);
  await expect(flash).toBeVisible({ timeout: 30_000 });
  await expect(flash).toContainText('You logged into a secure area!');
  await expect(flash).toHaveClass(/success/); // .success = green background
});
