import { expect, test } from '@playwright/test';
import { calendarIn, contrastRatio } from './helpers';

const WHITE = 'rgb(255, 255, 255)';
const BLACK = 'rgb(0, 0, 0)';

test('is light by default', async ({ page }) => {
  await page.goto('/e2e/theme/');
  const calendar = calendarIn(page, 'default');
  await expect(calendar).toHaveAttribute('data-theme', 'light');
  await expect(calendar).toHaveCSS('background-color', WHITE);
});

test('theme="dark" uses the dark palette, with readable weekday names and week numbers', async ({ page }) => {
  await page.goto('/e2e/theme/');
  const calendar = calendarIn(page, 'dark');
  await expect(calendar).toHaveCSS('background-color', BLACK);
  expect(await contrastRatio(calendar.locator('header > div'))).toBeGreaterThanOrEqual(4.5);
  expect(await contrastRatio(calendar.locator('th').first())).toBeGreaterThanOrEqual(4.5);
  expect(await contrastRatio(calendar.locator('tbody td:has(> span) span').first())).toBeGreaterThanOrEqual(4.5);
});

test('theme="auto" follows the operating system color scheme', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/e2e/theme/');
  const calendar = calendarIn(page, 'auto');
  await expect(calendar).toHaveAttribute('data-theme', 'auto');
  await expect(calendar).toHaveCSS('background-color', BLACK);
  await page.emulateMedia({ colorScheme: 'light' });
  await expect(calendar).toHaveCSS('background-color', WHITE);
});

test('accepts a Signal and follows its changes', async ({ page }) => {
  await page.goto('/e2e/theme/');
  const calendar = calendarIn(page, 'signal');
  await expect(calendar).toHaveCSS('background-color', WHITE);
  await page.locator('#toggle-theme').click();
  await expect(calendar).toHaveCSS('background-color', BLACK);
  await page.locator('#toggle-theme').click();
  await expect(calendar).toHaveCSS('background-color', WHITE);
});

test('the DatePicker trigger and popover follow the theme', async ({ page }) => {
  await page.goto('/e2e/theme/');
  const trigger = page.locator('#picker button[popovertarget]');
  expect(await contrastRatio(trigger)).toBeGreaterThanOrEqual(4.5);
  await trigger.click();
  await expect(page.locator('#picker [popover]')).toHaveCSS('background-color', BLACK);
});
