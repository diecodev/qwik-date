import { expect, test } from '@playwright/test';
import { calendarIn, day, focusedDay } from './helpers';

// each test navigates once: a second navigation aborts the first page's module imports, which WebKit logs as errors
const open = (page: import('@playwright/test').Page) => page.goto('/e2e/auto-focus/');

test('opening the popover focuses the selected day', async ({ page }) => {
  await open(page);
  const popover = page.locator('#selected-popover');
  await page.locator('#selected button[popovertarget]').click();
  await expect(popover).toBeVisible();
  await expect(day(popover, '2024-08-15')).toBeFocused();
});

test('closing and reopening it focuses the selected day again, the one chosen last', async ({ page }) => {
  await open(page);
  const trigger = page.locator('#selected button[popovertarget]');
  const popover = page.locator('#selected-popover');
  await trigger.click();
  await expect(day(popover, '2024-08-15')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(popover).toBeHidden();
  await trigger.click();
  await expect(day(popover, '2024-08-15')).toBeFocused();
  // choose another day, close and reopen: the focus goes to it
  await day(popover, '2024-08-20').click();
  await expect(popover.locator('button[data-selected]')).toHaveText('20');
  await page.keyboard.press('Escape');
  await expect(popover).toBeHidden();
  await trigger.click();
  await expect(day(popover, '2024-08-20')).toBeFocused();
});

test('without a value it focuses the first day that can be chosen', async ({ page }) => {
  await open(page);
  // min is 2099-03-10, which is disabled too
  const popover = page.locator('#empty-popover');
  await page.locator('#empty button[popovertarget]').click();
  await expect(day(popover, '2099-03-11')).toBeFocused();
});

test('without autoFocus, opening the popover leaves the focus where it was', async ({ page }) => {
  await open(page);
  const popover = page.locator('#without-popover');
  await page.locator('#without button[popovertarget]').click();
  await expect(popover).toBeVisible();
  // give a (wrong) focus the chance to land
  await page.waitForTimeout(500);
  expect(await focusedDay(page)).not.toMatch(/^\d{4}-/);
});

test('focuses the day on load when the calendar is already visible', async ({ page }) => {
  await page.goto('/e2e/auto-focus/?load');
  await expect(day(calendarIn(page, 'load'), '2024-08-15')).toBeFocused();
});

test('focuses the day of a calendar mounted on the client', async ({ page }) => {
  await open(page);
  await page.locator('#toggle-mount').click();
  await expect(day(calendarIn(page, 'mount'), '2024-08-15')).toBeFocused();
});
