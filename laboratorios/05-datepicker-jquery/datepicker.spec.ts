// Lab 05 - jQuery UI datepicker inside an iframe
// Run: npx playwright test laboratorios/05-datepicker-jquery/datepicker.spec.ts

import { test, expect } from '@playwright/test';

// The demo lives inside <iframe class="demo-frame">. page.locator() does not
// look inside iframes, so everything has to go through frameLocator().

test('pick December 25, 2026 in the jQuery UI datepicker', async ({ page }) => {
  // 1. Go to the page
  await page.goto('https://jqueryui.com/datepicker/');

  // 2. Enter the iframe
  const frame = page.frameLocator('iframe.demo-frame');

  // 3. Open the calendar
  const input = frame.locator('#datepicker');
  await input.click();
  const calendar = frame.locator('#ui-datepicker-div');
  await expect(calendar).toBeVisible();

  // 4. Click "Next" until the header shows December 2026.
  // Month and year are separate spans, so compare them separately.
  const month = calendar.locator('.ui-datepicker-month');
  const year = calendar.locator('.ui-datepicker-year');
  const next = calendar.getByTitle('Next');

  for (let clicks = 0; ; clicks++) {
    if ((await month.textContent()) === 'December' && (await year.textContent()) === '2026') break;
    if (clicks >= 24) throw new Error('Did not reach December 2026 after 24 clicks');
    await next.click();
  }
  await expect(month).toHaveText('December');
  await expect(year).toHaveText('2026');

  // 5. Click day 25 (exact: avoid matching other cells that contain "25")
  await calendar.getByRole('link', { name: '25', exact: true }).click();

  // 6. The input gets the date in MM/DD/YYYY format
  await expect(input).toHaveValue('12/25/2026');
});
