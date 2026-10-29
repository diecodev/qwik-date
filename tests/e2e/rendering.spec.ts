import { expect, test } from '@playwright/test';
import { calendarIn, day, title } from './helpers';

test.beforeEach(async ({ page }) => {
  await page.goto('/e2e/calendar/');
});

test('shows the month of the given value, with that day selected', async ({ page }) => {
  const calendar = calendarIn(page, 'basic');
  await expect(title(calendar)).toHaveText('August 2024');
  await expect(calendar.locator('th')).toHaveText(['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']);
  await expect(calendar.locator('button[data-value]')).toHaveCount(31);
  await expect(calendar.locator('td[aria-selected="true"]')).toHaveText('15');
  await expect(calendar.locator('button[data-selected]')).toHaveAttribute('data-value', '2024-08-15');
});

test('labels every day with its full date', async ({ page }) => {
  await expect(day(calendarIn(page, 'basic'), '2024-08-15')).toHaveAttribute('aria-label', 'Thursday, August 15, 2024');
});

test('fullWeeks fills six rows with the adjacent days, disabled', async ({ page }) => {
  const calendar = calendarIn(page, 'full-weeks');
  await expect(calendar.locator('tbody tr')).toHaveCount(6);
  await expect(calendar.locator('button[data-value]')).toHaveCount(42);
  await expect(calendar.locator('button[data-value]:disabled')).toHaveCount(11);
  await expect(day(calendar, '2024-07-28')).toBeDisabled();
  await expect(day(calendar, '2024-09-07')).toBeDisabled();
});

test('showWeekNumber numbers each row after its ISO week', async ({ page }) => {
  const weeks = calendarIn(page, 'full-weeks').locator('tbody td:has(> span) span');
  await expect(weeks).toHaveText(['31', '32', '33', '34', '35', '36']);
});

test('locale "es" translates the title, the weekdays and the day labels', async ({ page }) => {
  const calendar = calendarIn(page, 'es');
  await expect(title(calendar)).toHaveText('Agosto 2024');
  await expect(calendar.locator('th')).toHaveText(['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa']);
  await expect(day(calendar, '2024-08-15')).toHaveAttribute('aria-label', 'jueves, 15 de agosto de 2024');
});

test('another locale takes its names from Intl, capitalized, and its texts from labels', async ({ page }) => {
  const calendar = calendarIn(page, 'fr');
  await expect(title(calendar)).toHaveText('Août 2024');
  await expect(calendar.locator('th')).toHaveText(['Dim.', 'Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.']);
  await expect(calendar.locator('th').first()).toHaveAttribute('aria-label', 'Dimanche');
  await expect(day(calendar, '2024-08-15')).toHaveAttribute('aria-label', 'jeudi 15 août 2024');
  const section = page.locator('#fr');
  await expect(section.getByRole('button', { name: 'Mois précédent' })).toBeVisible();
  await expect(section.getByRole('button', { name: 'Mois suivant' })).toBeVisible();
  await expect(
    section.getByRole('group', { name: 'Calendrier, date sélectionnée : jeudi 15 août 2024' }),
  ).toBeVisible();
});

test('labels override the built-in texts', async ({ page }) => {
  await expect(
    page
      .locator('#es-labels')
      .getByRole('group', { name: 'Fecha de entrega, fecha seleccionada: jueves, 15 de agosto de 2024' }),
  ).toBeVisible();
  await expect(page.locator('#es-labels').getByRole('button', { name: 'Ir al mes anterior' })).toBeVisible();
});

test('weekStartsOn starts the rows, the weekday names and the week numbers on that day', async ({ page }) => {
  const calendar = calendarIn(page, 'monday');
  await expect(calendar.locator('th')).toHaveText(['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']);
  // August 1, 2024 is a Thursday: the fourth column
  await expect(calendar.locator('tbody tr').first().locator('td:not(:has(> span))').nth(3)).toHaveText('01');
  await expect(calendar.locator('tbody td:has(> span) span')).toHaveText(['31', '32', '33', '34', '35']);
});

test('showDaysOfWeek={false} hides the weekday row', async ({ page }) => {
  await expect(calendarIn(page, 'no-weekdays').locator('thead')).toHaveCount(0);
});

test('does not move the focus when the page loads', async ({ page }) => {
  // the calendar's visible tasks run once it's on screen: give them the chance to (wrongly) focus a day
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);
  expect(await page.evaluate(() => document.activeElement?.tagName)).toBe('BODY');
});
