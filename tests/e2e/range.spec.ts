import { expect, test } from '@playwright/test';
import { calendarIn, day, nextButton, prevButton, title } from './helpers';

test.beforeEach(async ({ page }) => {
  await page.goto('/e2e/range/');
});

test('shows the value: the start and the end selected, the days between in range', async ({ page }) => {
  const calendar = calendarIn(page, 'range');
  await expect(calendar.locator('button[data-selected]')).toHaveText(['05', '12']);
  await expect(day(calendar, '2024-08-05')).toHaveAttribute('data-range-start');
  await expect(day(calendar, '2024-08-12')).toHaveAttribute('data-range-end');
  await expect(calendar.locator('button[data-in-range]')).toHaveText(['06', '07', '08', '09', '10', '11']);
  await expect(calendar.locator('td[aria-selected="true"]')).toHaveCount(8);
  await expect(
    page
      .locator('#range')
      .getByRole('group', { name: 'Calendar, selected range: Monday, August 5, 2024 – Monday, August 12, 2024' }),
  ).toBeVisible();
});

test('the first choice starts a range, the second ends it, the next starts a new one', async ({ page }) => {
  const calendar = calendarIn(page, 'range');
  const changes = page.locator('#changes');
  await day(calendar, '2024-08-20').click();
  await expect(changes).toHaveText('2024-08-20/null');
  await expect(calendar.locator('td[aria-selected="true"]')).toHaveText(['20']);
  await expect(page.locator('#range').getByRole('group')).toHaveAccessibleName(
    'Calendar, selected range: Tuesday, August 20, 2024 – …',
  );
  // wait for each choice to land: Qwik doesn't order the handlers of different elements
  await day(calendar, '2024-08-25').click();
  await expect(changes).toHaveText('2024-08-20/null,2024-08-20/2024-08-25');
  await expect(calendar.locator('button[data-in-range]')).toHaveText(['21', '22', '23', '24']);
  await day(calendar, '2024-08-10').click();
  await expect(changes).toHaveText('2024-08-20/null,2024-08-20/2024-08-25,2024-08-10/null');
  await expect(calendar.locator('button[data-in-range]')).toHaveCount(0);
});

test('an end before the start swaps them, the same day twice is a one-day range', async ({ page }) => {
  const calendar = calendarIn(page, 'range');
  const changes = page.locator('#changes');
  await day(calendar, '2024-08-20').click();
  await expect(changes).toHaveText('2024-08-20/null');
  await day(calendar, '2024-08-10').click();
  await expect(changes).toHaveText('2024-08-20/null,2024-08-10/2024-08-20');
  await day(calendar, '2024-08-15').click();
  await expect(changes).toContainText(',2024-08-15/null');
  await day(calendar, '2024-08-15').click();
  await expect(changes).toContainText(',2024-08-15/2024-08-15');
  await expect(calendar.locator('td[aria-selected="true"]')).toHaveText(['15']);
});

test('the end can be in a later month, and the calendar stays on it', async ({ page }) => {
  const calendar = calendarIn(page, 'range');
  await day(calendar, '2024-08-28').click();
  await expect(page.locator('#changes')).toHaveText('2024-08-28/null');
  await nextButton(calendar).click();
  await expect(title(calendar)).toHaveText('September 2024');
  await day(calendar, '2024-09-03').click();
  await expect(page.locator('#changes')).toHaveText('2024-08-28/null,2024-08-28/2024-09-03');
  await expect(title(calendar)).toHaveText('September 2024');
  await expect(calendar.locator('button[data-in-range]')).toHaveText(['01', '02']);
  await prevButton(calendar).click();
  await expect(calendar.locator('button[data-in-range]')).toHaveText(['29', '30', '31']);
});

test('Enter and Space choose the start and the end', async ({ page }) => {
  const calendar = calendarIn(page, 'range');
  await day(calendar, '2024-08-20').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#changes')).toHaveText('2024-08-20/null');
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight');
  await expect(day(calendar, '2024-08-22')).toBeFocused();
  await page.keyboard.press('Space');
  await expect(page.locator('#changes')).toHaveText('2024-08-20/null,2024-08-20/2024-08-22');
});

test.describe('bind:value', () => {
  test('starts with the bound range and writes the choices to it', async ({ page }) => {
    const calendar = calendarIn(page, 'bound');
    await expect(calendar.locator('td[aria-selected="true"]')).toHaveText(['15']);
    await day(calendar, '2024-08-18').click();
    await expect(page.locator('#value')).toHaveText('2024-08-15/2024-08-18');
  });

  test('follows the bound signal when it changes from outside, and clears with null', async ({ page }) => {
    const calendar = calendarIn(page, 'bound');
    await page.locator('#set-external').click();
    await expect(title(calendar)).toHaveText('December 2024');
    await expect(calendar.locator('button[data-selected]')).toHaveText(['24', '26']);
    await expect(calendar.locator('button[data-in-range]')).toHaveText(['25']);
    await page.locator('#clear').click();
    await expect(page.locator('#value')).toHaveText('null');
    await expect(calendar.locator('[aria-selected="true"]')).toHaveCount(0);
  });
});

test.describe('preview', () => {
  const previewed = (calendar: import('@playwright/test').Locator) => calendar.locator('button[data-preview]');

  test('with a start and no end, the pointer previews the range up to the day under it', async ({ page }) => {
    const calendar = calendarIn(page, 'preview');
    await day(calendar, '2024-08-14').hover();
    await expect(previewed(calendar)).toHaveText(['11', '12', '13', '14']);
    await day(calendar, '2024-08-07').hover();
    await expect(previewed(calendar)).toHaveText(['07', '08', '09']);
    // out of the grid, no preview
    await page.mouse.move(0, 0);
    await expect(previewed(calendar)).toHaveCount(0);
  });

  test('the keyboard previews the range up to the focused day, across months', async ({ page }) => {
    const calendar = calendarIn(page, 'preview');
    await day(calendar, '2024-08-10').focus();
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await expect(day(calendar, '2024-08-12')).toBeFocused();
    await expect(previewed(calendar)).toHaveText(['11', '12']);
    await page.keyboard.press('PageDown');
    await expect(day(calendar, '2024-09-12')).toBeFocused();
    await expect(previewed(calendar)).toHaveCount(12);
    await page.keyboard.press('PageUp');
    await expect(previewed(calendar)).toHaveText(['11', '12']);
    // Tab out of the grid: no preview
    await page.keyboard.press('Tab');
    await expect(previewed(calendar)).toHaveCount(0);
  });

  test("the preview stops before a day that can't be chosen, as the choice does", async ({ page }) => {
    const calendar = calendarIn(page, 'preview-cut');
    await day(calendar, '2024-08-25').hover();
    await expect(previewed(calendar)).toHaveText(['11', '12', '13', '14', '15', '16', '17', '18', '19']);
    await day(calendar, '2024-08-25').click();
    await expect(calendar.locator('button[data-range-end]')).toHaveText('19');
    await expect(previewed(calendar)).toHaveCount(0);
  });

  test('no preview once the range has an end, nor in the other modes', async ({ page }) => {
    const calendar = calendarIn(page, 'preview');
    await day(calendar, '2024-08-14').click();
    await expect(calendar.locator('button[data-range-end]')).toHaveText('14');
    await day(calendar, '2024-08-20').hover();
    await expect(previewed(calendar)).toHaveCount(0);
    const single = calendarIn(page, 'preview-single');
    await day(single, '2024-08-14').hover();
    await expect(previewed(single)).toHaveCount(0);
  });

  test("headless: useCalendar()'s preview and setPreview$", async ({ page }) => {
    const section = page.locator('#preview-headless');
    await expect(page.locator('#preview-range')).toHaveText('null');
    await section.locator('button[data-value="2024-08-12"]').hover();
    await expect(page.locator('#preview-range')).toHaveText('2024-08-10/2024-08-12');
    await expect(section.locator('button[data-preview]')).toHaveText(['11', '12']);
    await section.locator('#preview-18').click();
    await expect(page.locator('#preview-range')).toHaveText('2024-08-10/2024-08-18');
  });
});
