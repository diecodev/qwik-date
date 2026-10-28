import { expect, test } from '@playwright/test';
import { day, focusedDay } from './helpers';

test.beforeEach(async ({ page }) => {
  await page.goto('/e2e/headless/');
});

test('the parts make an accessible calendar, without the library styles', async ({ page }) => {
  const section = page.locator('#parts');
  const root = section.getByRole('group', { name: 'Calendar, selected date: Thursday, August 15, 2024' });
  await expect(root).toBeVisible();
  await expect(root).not.toHaveAttribute('data-qwik-date');
  await expect(section.getByRole('grid', { name: 'August 2024' })).toBeVisible();
  await expect(section.getByRole('button', { name: 'go to previous month' })).toHaveText('‹');
  await expect(section.getByRole('button', { name: 'go to next month' })).toHaveText('›');
  await expect(section.locator('th.weekday')).toHaveText(['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']);
  await expect(section.locator('button.day')).toHaveCount(31);
  await expect(section.getByRole('gridcell', { selected: true })).toHaveText('15');
  await expect(day(root, '2024-08-15')).toHaveAttribute('data-selected');
  // the stylesheet of the styled calendar on the same page leaves the parts alone
  await expect(page.locator('#styled [data-qwik-date]')).not.toHaveCSS('box-shadow', 'none');
  await expect(root).toHaveCSS('box-shadow', 'none');
  await expect(day(root, '2024-08-15')).toHaveCSS('border-radius', '0px');
});

test('the parts choose a day with a click and with the keyboard, and submit it', async ({ page }) => {
  const root = page.locator('#parts [role="group"]');
  await day(root, '2024-08-20').click();
  await expect(page.locator('#changes')).toHaveText('2024-08-20');
  await expect(page.locator('#parts input[name="due"]')).toHaveValue('2024-08-20');
  await day(root, '2024-08-20').focus();
  await page.keyboard.press('ArrowRight');
  await expect(day(root, '2024-08-21')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#changes')).toHaveText('2024-08-20,2024-08-21');
  await page.keyboard.press('PageDown');
  await expect(page.locator('#parts .title')).toHaveText('September 2024');
  await expect(day(root, '2024-09-21')).toBeFocused();
});

test('the month buttons change the month and stop at min and max', async ({ page }) => {
  const section = page.locator('#limits');
  const prev = section.getByRole('button', { name: 'go to previous month' });
  const next = section.getByRole('button', { name: 'go to next month' });
  await next.click();
  await expect(section.getByRole('grid')).toHaveAccessibleName('September 2024');
  await expect(next).toHaveAttribute('aria-disabled', 'true');
  // still focusable, but it doesn't change the month (Playwright doesn't click aria-disabled buttons: force it)
  await next.click({ force: true });
  await expect(section.getByRole('grid')).toHaveAccessibleName('September 2024');
  await prev.click();
  await prev.click();
  await expect(section.getByRole('grid')).toHaveAccessibleName('July 2024');
  await expect(prev).toHaveAttribute('aria-disabled', 'true');
  await expect(day(section, '2024-07-09')).toBeDisabled();
  await expect(day(section, '2024-07-10')).toBeEnabled();
});

test('rows of your own, with useCalendar(), Cell and Day, keep the state, the choice and the keyboard', async ({
  page,
}) => {
  const section = page.locator('#custom');
  await expect(section.locator('.event-day:has(.dot)')).toHaveText(['05•', '20•']);
  await expect(day(section, '2024-08-15')).toHaveAttribute('tabindex', '0');
  await expect(section.getByRole('gridcell', { selected: true })).toHaveText('15');
  await day(section, '2024-08-20').click();
  await expect(section.getByRole('gridcell', { selected: true })).toHaveText('20•');
  await expect(section.getByRole('group')).toHaveAccessibleName('Calendar, selected date: Tuesday, August 20, 2024');
  await day(section, '2024-08-20').focus();
  await page.keyboard.press('ArrowDown');
  await expect(day(section, '2024-08-27')).toBeFocused();
  await page.keyboard.press('End');
  await expect(day(section, '2024-08-31')).toBeFocused();
  await page.keyboard.press('ArrowRight');
  await expect(section.getByRole('grid')).toHaveAccessibleName('September 2024');
  await expect(day(section, '2024-09-01')).toBeFocused();
  await page.keyboard.press('Space');
  await expect(section.getByRole('gridcell', { selected: true })).toHaveText('01');
  expect(await focusedDay(page)).toBe('2024-09-01');
});

test('useCalendar() gives the state and the handlers', async ({ page }) => {
  const section = page.locator('#state');
  await expect(section.locator('#month')).toHaveText('2024-08');
  await expect(section.locator('#tab-day')).toHaveText('2024-08-15');
  await expect(section.locator('#value')).toHaveText('2024-08-15');
  await expect(section.locator('#limits')).toHaveText('true/true');
  await section.locator('#select-20').click();
  await expect(section.locator('#value')).toHaveText('2024-08-20');
  await expect(page.locator('#state-changes')).toHaveText('2024-08-20');
  await expect(section.locator('#tab-day')).toHaveText('2024-08-20');
  // a day that can't be chosen is ignored, as a click on it would be
  await section.locator('#select-disabled').click();
  await section.locator('#next').click();
  await expect(section.locator('#month')).toHaveText('2024-09');
  await expect(section.locator('#tab-day')).toHaveText('2024-09-01');
  await expect(section.locator('#value')).toHaveText('2024-08-20');
  await expect(page.locator('#state-changes')).toHaveText('2024-08-20');
  // writing the value from outside shows its month
  await section.locator('#set-value').click();
  await expect(section.locator('#month')).toHaveText('2024-12');
  await expect(section.getByRole('grid')).toHaveAccessibleName('December 2024');
  await expect(section.getByRole('gridcell', { selected: true })).toHaveText('24');
});
