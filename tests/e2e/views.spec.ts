import { expect, test } from '@playwright/test';
import { calendarIn, day, focusedDay, nextButton, prevButton, title } from './helpers';

test.beforeEach(async ({ page }) => {
  await page.goto('/e2e/views/');
});

const titleButton = (calendar: import('@playwright/test').Locator) => calendar.locator('header > div > button');
const month = (calendar: import('@playwright/test').Locator, value: string) =>
  calendar.locator(`button[data-month="${value}"]`);
const year = (calendar: import('@playwright/test').Locator, value: number) =>
  calendar.locator(`button[data-year="${value}"]`);

test('the title shows the months of the year, and a month shows its days', async ({ page }) => {
  const section = page.locator('#basic');
  const calendar = calendarIn(page, 'basic');
  await expect(title(calendar)).toHaveAttribute('aria-live', 'polite');
  await titleButton(calendar).click();
  await expect(section.getByRole('grid', { name: '2024' })).toBeVisible();
  await expect(title(calendar)).toHaveText('2024');
  await expect(calendar.locator('button[data-month]')).toHaveText([
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ]);
  await expect(month(calendar, '2024-08')).toHaveAttribute('aria-label', 'August 2024');
  await expect(section.getByRole('gridcell', { selected: true })).toHaveText('Aug');
  await expect(prevButton(calendar)).toHaveAttribute('aria-label', 'go to previous year');
  await nextButton(calendar).click();
  await expect(title(calendar)).toHaveText('2025');
  await prevButton(calendar).click();
  await month(calendar, '2024-10').click();
  await expect(section.getByRole('grid', { name: 'October 2024' })).toBeVisible();
  await expect(prevButton(calendar)).toHaveAttribute('aria-label', 'go to previous month');
  // showing a month doesn't choose anything
  await expect(page.locator('#changes')).toHaveText('');
});

test('the title again shows twelve years, and a year shows the days of the same month in it', async ({ page }) => {
  const section = page.locator('#basic');
  const calendar = calendarIn(page, 'basic');
  await titleButton(calendar).click();
  await expect(title(calendar)).toHaveText('2024');
  await titleButton(calendar).click();
  await expect(section.getByRole('grid', { name: '2016 – 2027' })).toBeVisible();
  await expect(calendar.locator('button[data-year]')).toHaveCount(12);
  await expect(prevButton(calendar)).toHaveAttribute('aria-label', 'go to previous years');
  await nextButton(calendar).click();
  await expect(title(calendar)).toHaveText('2028 – 2039');
  await prevButton(calendar).click();
  await prevButton(calendar).click();
  await expect(title(calendar)).toHaveText('2004 – 2015');
  await nextButton(calendar).click();
  await year(calendar, 2026).click();
  await expect(section.getByRole('grid', { name: 'August 2026' })).toBeVisible();
  // and the title goes round: days, months, years, days
  await titleButton(calendar).click();
  await titleButton(calendar).click();
  await titleButton(calendar).click();
  await expect(title(calendar)).toHaveText('August 2026');
});

test('the keyboard: arrows and Enter choose, Escape goes back to the days', async ({ page }) => {
  const calendar = calendarIn(page, 'basic');
  await titleButton(calendar).focus();
  await page.keyboard.press('Enter');
  await expect(month(calendar, '2024-08')).toBeFocused();
  await page.keyboard.press('ArrowRight');
  await expect(month(calendar, '2024-09')).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(month(calendar, '2024-12')).toBeFocused();
  await page.keyboard.press('ArrowRight');
  await expect(title(calendar)).toHaveText('2025');
  await expect(month(calendar, '2025-01')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(title(calendar)).toHaveText('January 2025');
  // the same day of the month chosen
  await expect(day(calendar, '2025-01-15')).toBeFocused();

  await titleButton(calendar).focus();
  await page.keyboard.press('Enter');
  await expect(month(calendar, '2025-01')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(title(calendar)).toHaveText('January 2025');
  await expect(titleButton(calendar)).toBeFocused();

  // twice: the years, with the focus on the year on show
  await page.keyboard.press('Enter');
  await expect(month(calendar, '2025-01')).toBeFocused();
  await titleButton(calendar).focus();
  await page.keyboard.press('Enter');
  await expect(year(calendar, 2025)).toBeFocused();
  await page.keyboard.press('ArrowLeft');
  await expect(year(calendar, 2024)).toBeFocused();
  await page.keyboard.press('Space');
  await expect(title(calendar)).toHaveText('January 2024');
  expect(await focusedDay(page)).toBe('2024-01-15');
});

test('min and max disable the months and years past them', async ({ page }) => {
  const calendar = calendarIn(page, 'limits');
  await titleButton(calendar).click();
  await expect(month(calendar, '2024-01')).toBeDisabled();
  await expect(month(calendar, '2024-02')).toBeDisabled();
  await expect(month(calendar, '2024-03')).toBeEnabled();
  await expect(prevButton(calendar)).toHaveAttribute('aria-disabled', 'true');
  await expect(nextButton(calendar)).not.toHaveAttribute('aria-disabled');
  // the keyboard stays on the first month min allows
  await month(calendar, '2024-03').focus();
  await page.keyboard.press('ArrowLeft');
  await page.keyboard.press('ArrowUp');
  await expect(month(calendar, '2024-03')).toBeFocused();
  await month(calendar, '2024-12').click();
  await expect(title(calendar)).toHaveText('December 2024');

  await titleButton(calendar).click();
  await titleButton(calendar).click();
  await expect(calendar.locator('button[data-year]:enabled')).toHaveText(['2024', '2025']);
  await expect(prevButton(calendar)).toHaveAttribute('aria-disabled', 'true');
  await expect(nextButton(calendar)).toHaveAttribute('aria-disabled', 'true');
  // December 2025 is past max: the year shows max's month
  await year(calendar, 2025).click();
  await expect(title(calendar)).toHaveText('October 2025');
});

test('the month names and the buttons follow the locale, the names with a capital letter', async ({ page }) => {
  const es = calendarIn(page, 'es');
  await titleButton(es).click();
  await expect(month(es, '2024-01')).toHaveText(/^Ene/);
  await expect(month(es, '2024-08')).toHaveAttribute('aria-label', 'Agosto 2024');
  await expect(prevButton(es)).toHaveAttribute('aria-label', 'Ir al año anterior');
  await titleButton(es).click();
  await expect(nextButton(es)).toHaveAttribute('aria-label', 'Ir a los siguientes años');

  const fr = calendarIn(page, 'fr');
  await titleButton(fr).click();
  await expect(month(fr, '2024-01')).toHaveText(/^Janv/);
  await expect(month(fr, '2024-01')).toHaveAttribute('aria-label', 'Janvier 2024');
  await expect(prevButton(fr)).toHaveAttribute('aria-label', 'Année précédente');
});

test('Escape in the months of a popover goes back to the days, and keeps it open', async ({ page }) => {
  const trigger = page.locator('#popover button[aria-haspopup]');
  const popover = page.locator('#popover [popover]');
  await trigger.click();
  await expect(day(popover, '2024-08-15')).toBeFocused();
  await titleButton(popover).click();
  await expect(month(popover, '2024-08')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(popover).toBeVisible();
  await expect(title(popover)).toHaveText('August 2024');
  await expect(titleButton(popover)).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(popover).toBeHidden();
  await expect(trigger).toBeFocused();
});

test('headless: MonthGrid, YearGrid, and the views in useCalendar()', async ({ page }) => {
  const section = page.locator('#headless');
  const view = page.locator('#view');
  await expect(view).toHaveText('days / August 2024');
  await section.locator('[aria-live] > button').click();
  await expect(view).toHaveText('months / 2024');
  await expect(section.locator('table.months button')).toHaveCount(12);
  await section.locator('#show-years').click();
  await expect(view).toHaveText('years / 2016 – 2027');
  await expect(section.locator('table.years button')).toHaveCount(12);
  await section.locator('#choose-month').click();
  await expect(view).toHaveText('days / February 2025');
  await expect(section.getByRole('grid')).toHaveAccessibleName('February 2025');
});
