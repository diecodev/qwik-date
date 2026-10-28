import { expect, test } from '@playwright/test';
import { calendarIn, day } from './helpers';

test.beforeEach(async ({ page }) => {
  await page.goto('/e2e/form/');
});

const submit = async (page: import('@playwright/test').Page) => {
  await page.locator('#submit').click();
  return page.locator('#entries');
};

test('name submits the value with the form, empty without one', async ({ page }) => {
  await expect(await submit(page)).toHaveText('day=2024-08-15&stay[start]=2024-08-05&stay[end]=2024-08-12&picked=');
});

test('the submitted value follows the choices', async ({ page }) => {
  await day(calendarIn(page, 'single'), '2024-08-20').click();
  await expect(page.locator('#single input[type="hidden"]')).toHaveValue('2024-08-20');
  const range = calendarIn(page, 'range');
  await day(range, '2024-08-18').click();
  await expect(page.locator('#range input[name="stay[end]"]')).toHaveValue('');
  await day(range, '2024-08-22').click();
  await expect(page.locator('#range input[name="stay[end]"]')).toHaveValue('2024-08-22');
  await expect(await submit(page)).toHaveText('day=2024-08-20&stay[start]=2024-08-18&stay[end]=2024-08-22&picked=');
});

test('a DatePicker submits its value too', async ({ page }) => {
  await page.locator('#picker button[popovertarget]').click();
  const popover = page.locator('#picker [popover]');
  await popover.locator('button[data-value]:not(:disabled)').first().click();
  await expect(popover).toBeHidden();
  const input = page.locator('#picker input[type="hidden"]');
  await expect(input).toHaveValue(/^\d{4}-\d{2}-01$/);
  const value = await input.inputValue();
  await expect(await submit(page)).toContainText(`picked=${value}`);
});
