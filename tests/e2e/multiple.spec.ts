import { expect, test } from '@playwright/test';
import { calendarIn, day, title } from './helpers';

test.beforeEach(async ({ page }) => {
  await page.goto('/e2e/multiple/');
});

test('shows the value: every day selected, and named in the calendar', async ({ page }) => {
  const calendar = calendarIn(page, 'multiple');
  await expect(calendar.locator('button[data-selected]')).toHaveText(['05', '20']);
  await expect(calendar.locator('td[aria-selected="true"]')).toHaveText(['05', '20']);
  await expect(calendar.locator('[data-in-range]')).toHaveCount(0);
  await expect(page.locator('#multiple').getByRole('group')).toHaveAccessibleName(
    'Calendar, selected dates: Monday, August 5, 2024; Tuesday, August 20, 2024',
  );
});

test('a click marks a day and unmarks it, with no maximum, and onChange$ gets the days each time', async ({ page }) => {
  const calendar = calendarIn(page, 'multiple');
  const changes = page.locator('#changes');
  await day(calendar, '2024-08-10').click();
  await expect(changes).toHaveText('2024-08-05 2024-08-10 2024-08-20');
  // wait for each choice to land: Qwik doesn't order the handlers of different elements
  await day(calendar, '2024-08-05').click();
  await expect(changes).toHaveText('2024-08-05 2024-08-10 2024-08-20 | 2024-08-10 2024-08-20');
  for (const date of ['11', '12', '13']) {
    await day(calendar, `2024-08-${date}`).click();
    await expect(day(calendar, `2024-08-${date}`)).toHaveAttribute('data-selected');
  }
  await expect(changes).toContainText('| 2024-08-10 2024-08-11 2024-08-12 2024-08-13 2024-08-20');
  await expect(calendar.locator('td[aria-selected="true"]')).toHaveCount(5);
});

test('Enter and Space mark and unmark the focused day', async ({ page }) => {
  const calendar = calendarIn(page, 'multiple');
  await day(calendar, '2024-08-20').focus();
  await page.keyboard.press('Space');
  await expect(page.locator('#changes')).toHaveText('2024-08-05');
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Enter');
  await expect(page.locator('#changes')).toHaveText('2024-08-05 | 2024-08-05 2024-08-21');
  await expect(day(calendar, '2024-08-21')).toBeFocused();
  await expect(calendar.locator('td[aria-selected="true"]')).toHaveText(['05', '21']);
});

test('bind:value starts empty, gets the choices, and follows the signal from outside', async ({ page }) => {
  const calendar = calendarIn(page, 'bound');
  await expect(page.locator('#bound').getByRole('group')).toHaveAccessibleName('Calendar');
  await page.locator('#set-external').click();
  await expect(title(calendar)).toHaveText('December 2024');
  await expect(calendar.locator('button[data-selected]')).toHaveText(['24', '26']);
  await day(calendar, '2024-12-25').click();
  await expect(page.locator('#value')).toHaveText('2024-12-24 2024-12-25 2024-12-26');
  await day(calendar, '2024-12-24').click();
  await expect(page.locator('#value')).toHaveText('2024-12-25 2024-12-26');
  await page.locator('#clear').click();
  await expect(page.locator('#value')).toHaveText('none');
  await expect(calendar.locator('[aria-selected="true"]')).toHaveCount(0);
});

test("the days that can't be chosen stay unmarked", async ({ page }) => {
  const calendar = calendarIn(page, 'disabled');
  await expect(day(calendar, '2024-08-17')).toBeDisabled();
  // Playwright doesn't click disabled buttons: force it
  await day(calendar, '2024-08-17').click({ force: true });
  await day(calendar, '2024-08-16').focus();
  await page.keyboard.press('ArrowRight');
  await expect(day(calendar, '2024-08-19')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#disabled-changes')).toHaveText('2024-08-15 2024-08-19');
});

test('name submits a name[] input per day: a Qwik Router action gets an array', async ({ page }) => {
  const section = page.locator('#action');
  await expect(section.locator('input[type="hidden"][name="days[]"]')).toHaveCount(2);
  await expect(section.locator('input[name^="none"]')).toHaveCount(0);
  await section.locator('#submit').click();
  await expect(page.locator('#received')).toHaveText('{"days":["2024-08-05","2024-08-20"]}');
  await day(calendarIn(page, 'action'), '2024-08-10').click();
  await expect(section.locator('input[name="days[]"]')).toHaveCount(3);
  await section.locator('#submit').click();
  await expect(page.locator('#received')).toHaveText('{"days":["2024-08-05","2024-08-10","2024-08-20"]}');
});
