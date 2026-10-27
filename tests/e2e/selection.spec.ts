import { expect, test } from '@playwright/test';
import { calendarIn, day, title } from './helpers';

test.describe('choosing a day', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/e2e/calendar/');
  });

  test('calls onDateChange$ once and marks the day as selected', async ({ page }) => {
    const calendar = calendarIn(page, 'basic');
    await day(calendar, '2024-08-20').click();
    await expect(page.locator('#changes')).toHaveText('2024-08-20');
    await expect(calendar.locator('td:has(> button[data-value="2024-08-20"])')).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await expect(day(calendar, '2024-08-20')).toHaveAttribute('data-selected');
    await expect(calendar.locator('button[data-preselected]')).toHaveAttribute('data-value', '2024-08-20');
  });

  test('Enter and Space choose the focused day once each', async ({ page }) => {
    const calendar = calendarIn(page, 'basic');
    await day(calendar, '2024-08-20').focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('#changes')).toHaveText('2024-08-20');
    await day(calendar, '2024-08-21').focus();
    await page.keyboard.press('Space');
    await expect(page.locator('#changes')).toHaveText('2024-08-20,2024-08-21');
  });
});

test.describe('bind:date', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/e2e/bind/');
  });

  test('writes the chosen day to the bound signal', async ({ page }) => {
    await day(calendarIn(page, 'bound'), '2024-08-20').click();
    await expect(page.locator('#value')).toHaveText('2024-08-20');
  });

  test('follows the bound signal when it changes from outside', async ({ page }) => {
    const calendar = calendarIn(page, 'bound');
    await day(calendar, '2024-08-20').click();
    // Qwik loads each handler lazily and doesn't order handlers of different elements: wait for the
    // first click to land, or a fast second click can run before it and be overwritten
    await expect(page.locator('#value')).toHaveText('2024-08-20');
    await page.locator('#set-external').click();
    await expect(title(calendar)).toHaveText('December 2024');
    await expect(calendar.locator('button[data-preselected]')).toHaveAttribute('data-value', '2024-12-25');
    await expect(calendar.locator('[aria-selected="true"]')).toHaveCount(0);
  });
});

test.describe('default date', () => {
  test("uses the visitor's day when no date is given, and keeps an explicit one", async ({ page }) => {
    // the server renders with its own clock; only the browser runs in 2030
    await page.clock.setFixedTime(new Date(2030, 0, 15, 10));
    await page.goto('/e2e/today/');
    const today = calendarIn(page, 'today');
    await expect(title(today)).toHaveText('January 2030');
    await expect(today.locator('button[data-preselected]')).toHaveAttribute('data-value', '2030-01-15');
    await expect(title(calendarIn(page, 'dated'))).toHaveText('August 2024');
  });
});
