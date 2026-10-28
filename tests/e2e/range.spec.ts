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
