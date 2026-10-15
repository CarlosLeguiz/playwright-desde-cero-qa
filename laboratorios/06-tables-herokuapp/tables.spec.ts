// Lab 06 - Tables on the-internet.herokuapp.com
// Run: npx playwright test laboratorios/06-tables-herokuapp/tables.spec.ts

import { test, expect, Locator } from '@playwright/test';

// The table can be sorted by clicking headers, so row and column positions
// are not stable. We find rows by their content and columns by header text.

// Returns the 0-based index of the column whose header text matches.
async function getColumnIndex(table: Locator, headerText: string): Promise<number> {
  const headers = await table.locator('thead th').allTextContents();
  const index = headers.findIndex((text) => text.trim() === headerText);
  expect(index, `Column "${headerText}" not found in: ${headers.join(', ')}`).toBeGreaterThanOrEqual(0);
  return index;
}

test.describe('Tables - herokuapp', () => {
  // Public site that is sometimes slow
  test.describe.configure({ retries: 2, timeout: 60000 });

  test.beforeEach(async ({ page }) => {
    await page.goto('https://the-internet.herokuapp.com/tables');
  });

  test('find a row by email, check Due and click its edit link', async ({ page }) => {
    const table = page.locator('#table1');

    // 1. Find the row by content, not by position
    const row = table.locator('tbody tr').filter({ hasText: 'fbach@yahoo.com' });
    await expect(row).toHaveCount(1);

    // 2. Find the Due column by its header text
    const dueIndex = await getColumnIndex(table, 'Due');
    await expect(row.locator('td').nth(dueIndex)).toHaveText('$51.00');

    // 3. Click "edit" scoped to this row (there is one edit link per row)
    await row.getByRole('link', { name: 'edit' }).click();

    // 4. The link only changes the hash
    await expect(page).toHaveURL(/#edit$/);
  });

  test('find the user who owes the most', async ({ page }) => {
    const table = page.locator('#table1');
    const emailIndex = await getColumnIndex(table, 'Email');
    const dueIndex = await getColumnIndex(table, 'Due');

    // 1. Read every row as an array of cell texts
    const rows = table.locator('tbody tr');
    await expect(rows.first()).toBeVisible();
    const data = await rows.evaluateAll((trs) =>
      trs.map((tr) => Array.from(tr.querySelectorAll('td'), (td) => td.textContent?.trim() ?? '')),
    );
    expect(data.length).toBeGreaterThan(0);

    // 2. Convert Due to a number ("$100.00" -> 100)
    const users = data.map((cells) => ({
      email: cells[emailIndex],
      due: Number(cells[dueIndex].replace(/[$,]/g, '')),
    }));
    users.forEach((user) => expect(Number.isNaN(user.due), `Invalid Due for ${user.email}`).toBe(false));

    // 3. Find the max
    const topDebtor = users.reduce((max, user) => (user.due > max.due ? user : max));

    // 4. Check against the site's current data
    expect(topDebtor).toEqual({ email: 'jdoe@hotmail.com', due: 100 });
  });
});
