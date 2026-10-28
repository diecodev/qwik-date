import { expect, test } from '@playwright/test';
import { calendarIn, day, focusedDay, nextButton, title } from './helpers';

test.beforeEach(async ({ page }) => {
  await page.goto('/e2e/calendar/');
});

const press = async (page: import('@playwright/test').Page, section: string, from: string, key: string) => {
  await day(calendarIn(page, section), from).focus();
  await page.keyboard.press(key);
};

test.describe('arrows', () => {
  for (const [from, key, expected, month] of [
    ['2024-08-15', 'ArrowRight', '2024-08-16', 'August 2024'],
    ['2024-08-15', 'ArrowLeft', '2024-08-14', 'August 2024'],
    ['2024-08-15', 'ArrowDown', '2024-08-22', 'August 2024'],
    ['2024-08-15', 'ArrowUp', '2024-08-08', 'August 2024'],
    ['2024-08-31', 'ArrowRight', '2024-09-01', 'September 2024'],
    ['2024-08-01', 'ArrowLeft', '2024-07-31', 'July 2024'],
    ['2024-08-29', 'ArrowDown', '2024-09-05', 'September 2024'],
    ['2024-08-02', 'ArrowUp', '2024-07-26', 'July 2024'],
  ]) {
    test(`${key} from ${from} goes to ${expected}`, async ({ page }) => {
      await press(page, 'basic', from, key);
      const calendar = calendarIn(page, 'basic');
      await expect(day(calendar, expected)).toBeFocused();
      await expect(title(calendar)).toHaveText(month);
    });
  }

  test('are mirrored in right-to-left layouts', async ({ page }) => {
    const calendar = calendarIn(page, 'rtl');
    await press(page, 'rtl', '2024-08-15', 'ArrowRight');
    await expect(day(calendar, '2024-08-14')).toBeFocused();
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowLeft');
    await expect(day(calendar, '2024-08-16')).toBeFocused();
    await press(page, 'rtl', '2024-08-01', 'ArrowRight');
    await expect(day(calendar, '2024-07-31')).toBeFocused();
    await expect(title(calendar)).toHaveText('July 2024');
  });
});

test.describe('Home / End', () => {
  for (const [section, from, key, expected] of [
    ['basic', '2024-08-06', 'Home', '2024-08-04'],
    ['basic', '2024-08-06', 'End', '2024-08-10'],
    ['basic', '2024-08-02', 'Home', '2024-08-01'],
    ['full-weeks', '2024-08-15', 'Home', '2024-08-11'],
    ['full-weeks', '2024-08-15', 'End', '2024-08-17'],
    ['monday', '2024-08-15', 'Home', '2024-08-12'],
    ['monday', '2024-08-15', 'End', '2024-08-18'],
  ]) {
    test(`${key} from ${from} (${section}) goes to ${expected}`, async ({ page }) => {
      await press(page, section, from, key);
      await expect(day(calendarIn(page, section), expected)).toBeFocused();
    });
  }
});

test.describe('PageUp / PageDown', () => {
  for (const [prevClicks, from, key, expected] of [
    [0, '2024-08-15', 'PageDown', '2024-09-15'],
    [0, '2024-08-15', 'PageUp', '2024-07-15'],
    [0, '2024-08-31', 'PageDown', '2024-09-30'],
    [7, '2024-01-31', 'PageDown', '2024-02-29'],
    [5, '2024-03-31', 'PageUp', '2024-02-29'],
  ] as const) {
    test(`${key} from ${from} goes to ${expected}`, async ({ page }) => {
      const calendar = calendarIn(page, 'basic');
      for (let i = 0; i < prevClicks; i++) await calendar.locator('header button').first().click();
      await press(page, 'basic', from, key);
      await expect(day(calendar, expected)).toBeFocused();
    });
  }
});

test('Tab and Shift+Tab move the focus out of the grid', async ({ page }) => {
  const outsideGrid = () => page.evaluate(() => !document.activeElement?.closest('#basic tbody'));
  await press(page, 'basic', '2024-08-15', 'Tab');
  expect(await outsideGrid()).toBe(true);
  await press(page, 'basic', '2024-08-15', 'Shift+Tab');
  expect(await outsideGrid()).toBe(true);
});

test('the grid keys do not scroll the page', async ({ page }) => {
  await day(calendarIn(page, 'basic'), '2024-08-15').focus();
  const before = await page.evaluate(() => window.scrollY);
  for (const key of ['ArrowDown', 'Space', 'PageDown', 'End']) await page.keyboard.press(key);
  await expect(page.locator('#changes')).toHaveText(/.+/); // Space chose a day, so the keys were handled
  expect(await page.evaluate(() => window.scrollY)).toBe(before);
});

test('a header click after keyboard navigation keeps the focus off the grid', async ({ page }) => {
  const calendar = calendarIn(page, 'basic');
  await press(page, 'basic', '2024-08-31', 'ArrowRight');
  await expect(day(calendar, '2024-09-01')).toBeFocused();
  await nextButton(calendar).click();
  await expect(title(calendar)).toHaveText('October 2024');
  expect(await focusedDay(page)).not.toMatch(/^\d{4}-/);
  await expect(calendar.locator('button[data-value][tabindex="0"]')).toHaveAttribute('data-value', '2024-10-01');
});
