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

test('a calendar that is a popover follows the theme', async ({ page }) => {
  await page.goto('/e2e/theme/');
  const popover = page.locator('#dark-popover');
  await page.locator('#popover button[popovertarget]').click();
  await expect(popover).toBeVisible();
  await expect(popover).toHaveCSS('background-color', BLACK);
  expect(await contrastRatio(popover.locator('header > div'))).toBeGreaterThanOrEqual(4.5);
});
