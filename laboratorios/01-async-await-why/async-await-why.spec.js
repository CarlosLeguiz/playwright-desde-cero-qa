// Lecture 11 - Why async and await in Playwright
// Run: npx playwright test laboratorios/01-async-await-why/async-await-why.spec.js

const { test, expect } = require('@playwright/test');

// Node.js is asynchronous: line 2 does not wait for line 1.
// In a login that means clicking the button before typing the
// password. async/await puts the human order back.

test('correct - each step waits for the previous one', async ({ page }) => {
  await page.goto('https://playwright.dev/');
  await expect(page).toHaveTitle(/Playwright/);
});

// Break it on purpose, one keyword at a time:
// 1) no await on goto   -> Navigation failed because page was closed
// 2) no await on expect -> Received string: null (title not loaded)
// 3) no async on the fn -> SyntaxError: await is only valid in
//                          async functions

test('login - order is the whole point', async ({ page }) => {
  await page.goto('https://practice.expandtesting.com/login');
  await page.getByLabel('Username').fill('practice');
  await page.getByLabel('Password').fill('SuperSecretPassword!');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page.getByText('You logged into a secure area!')).toBeVisible();
});

// async = permission to use await.
// await = pause until the promise settles (fulfilled or rejected)
// and hand back the real value instead of the pending promise.
