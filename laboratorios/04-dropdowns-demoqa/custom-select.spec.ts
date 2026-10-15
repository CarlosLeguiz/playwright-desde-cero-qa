// Lab 04 - Custom dropdown (React Select) on demoqa
// Run: npx playwright test laboratorios/04-dropdowns-demoqa/custom-select.spec.ts

import { test, expect } from '@playwright/test';

// React Select is not a native <select>, so selectOption() does not work.
// You have to do what a user does: open the menu, then click the option.
// The options only exist in the DOM while the menu is open.

test('select "Group 2, option 2" in the React Select dropdown', async ({ page }) => {
  // 1. Go to the page (demoqa loads lots of ads; don't wait for them)
  await page.goto('https://demoqa.com/select-menu', { waitUntil: 'domcontentloaded' });

  // 2. Open the "Select Value" dropdown
  const selectValue = page.locator('#withOptGroup');
  await expect(selectValue).toContainText('Select Option'); // placeholder
  await selectValue.click();

  // 3. Pick the option (exact: avoid partial matches like "Group 2, option 2x")
  await page.getByRole('option', { name: 'Group 2, option 2', exact: true }).click();

  // 4. The chosen value replaces the placeholder.
  // Class names are hashed (css-1dimb5e-singleValue), so match only the stable part.
  await expect(selectValue.locator('[class*="singleValue"]')).toHaveText('Group 2, option 2');
  await expect(selectValue).not.toContainText('Select Option');
});
