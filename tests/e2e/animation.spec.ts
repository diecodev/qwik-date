import { type Page, expect, test } from '@playwright/test';
import { calendarIn, day, nextButton, prevButton } from './helpers';

test.beforeEach(async ({ page }) => {
  // every CSS animation that starts, as "TAG:name": they're over by the time an assertion could look at them
  await page.addInitScript(() => {
    const started: string[] = [];
    Object.assign(window, { started });
    document.addEventListener(
      'animationstart',
      (e) => started.push(`${(e.target as Element).tagName}:${e.animationName}`),
      true,
    );
  });
  await page.goto('/e2e/animation/');
});

/** The animations started since the last call. */
const started = (page: Page) => page.evaluate(() => (window as unknown as { started: string[] }).started.splice(0));

test('no direction on load, then next or prev after each move', async ({ page }) => {
  const calendar = calendarIn(page, 'basic');
  await expect(calendar).not.toHaveAttribute('data-direction');
  await nextButton(calendar).click();
  await expect(calendar).toHaveAttribute('data-direction', 'next');
  await prevButton(calendar).click();
  await expect(calendar).toHaveAttribute('data-direction', 'prev');
  await day(calendar, '2024-08-31').focus();
  await page.keyboard.press('ArrowRight');
  await expect(calendar).toHaveAttribute('data-direction', 'next');
  // a month chosen in the months view, earlier than the one on show
  await calendar.locator('[aria-live] > button').click();
  await expect(calendar).toHaveAttribute('data-view', 'months');
  // opening a view isn't a move
  await expect(calendar).toHaveAttribute('data-direction', 'next');
  await calendar.locator('button[data-month="2024-03"]').click();
  await expect(calendar).toHaveAttribute('data-direction', 'prev');
});

test('the rows of each month are new, so a CSS animation on them plays, in its direction', async ({ page }) => {
  const calendar = calendarIn(page, 'basic');
  const before = await calendar.locator('tbody tr').first().elementHandle();
  expect(await started(page)).toEqual([]);
  await nextButton(calendar).click();
  await expect(calendar.locator('[aria-live]')).toHaveText('September 2024');
  // the title and the days render apart: wait for the days
  await expect.poll(() => before?.evaluate((el) => el.isConnected)).toBe(false);
  // September 2024 has five rows
  await expect.poll(() => started(page)).toEqual(Array(5).fill('TR:month-next'));
  await prevButton(calendar).click();
  await expect(calendar.locator('[aria-live]')).toHaveText('August 2024');
  await expect.poll(() => started(page)).toEqual(Array(5).fill('TR:month-prev'));
});

test('with several months, every grid animates', async ({ page }) => {
  const calendar = calendarIn(page, 'months');
  await calendar.getByRole('button', { name: 'go to next month' }).click();
  await expect(calendar.locator('[role="grid"]').nth(1)).toHaveAccessibleName('October 2024');
  // the five rows of September and the five of October
  await expect.poll(() => started(page)).toEqual(Array(10).fill('TR:month-next'));
});

test('the months and years grids animate when they open, and with each year', async ({ page }) => {
  const calendar = calendarIn(page, 'basic');
  await calendar.locator('[aria-live] > button').click();
  await expect.poll(() => started(page)).toEqual(['TABLE:view-in']);
  const before = await calendar.locator('table[data-period] tr').first().elementHandle();
  await nextButton(calendar).click();
  await expect(calendar.locator('[aria-live]')).toHaveText('2025');
  await expect(calendar).toHaveAttribute('data-direction', 'next');
  await expect.poll(() => before?.evaluate((el) => el.isConnected)).toBe(false);
});

test('with reduced motion, the same CSS moves nothing', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const calendar = calendarIn(page, 'basic');
  await nextButton(calendar).click();
  await expect(calendar).toHaveAttribute('data-direction', 'next');
  await expect(day(calendar, '2024-09-10')).toHaveCSS('transition-duration', '0s');
  expect(await started(page)).toEqual([]);
});

test('the theme only fades colors in 150 ms: no movement of its own', async ({ page }) => {
  const calendar = calendarIn(page, 'plain');
  await nextButton(calendar).click();
  await expect(calendar).toHaveAttribute('data-direction', 'next');
  await expect(day(calendar, '2024-09-10')).toHaveCSS('transition-property', 'background-color, color');
  await expect(day(calendar, '2024-09-10')).toHaveCSS('transition-duration', '0.15s, 0.15s');
  expect(await started(page)).toEqual([]);
});

test('headless: useCalendar().direction', async ({ page }) => {
  const section = page.locator('#headless');
  await expect(page.locator('#direction')).toHaveText('null');
  await section.getByRole('button', { name: 'go to next month' }).click();
  await expect(page.locator('#direction')).toHaveText('next');
  await expect(section.getByRole('group')).toHaveAttribute('data-direction', 'next');
  await section.getByRole('button', { name: 'go to previous month' }).click();
  await expect(page.locator('#direction')).toHaveText('prev');
});
