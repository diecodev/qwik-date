import { expect, test } from '@playwright/test';
import { calendarIn, day, nextButton } from './helpers';

test.beforeEach(async ({ page }) => {
  await page.goto('/e2e/calendar/');
});

test('the grid is named after the month it shows', async ({ page }) => {
  const section = page.locator('#basic');
  await expect(section.getByRole('grid', { name: 'August 2024' })).toBeVisible();
  await nextButton(calendarIn(page, 'basic')).click();
  await expect(section.getByRole('grid', { name: 'September 2024' })).toBeVisible();
});

test('the header buttons are labelled', async ({ page }) => {
  const section = page.locator('#basic');
  await expect(section.getByRole('button', { name: 'go to previous month' })).toBeVisible();
  await expect(section.getByRole('button', { name: 'go to next month' })).toBeVisible();
});

test('the calendar group is labelled with the selected date', async ({ page }) => {
  const section = page.locator('#basic');
  await expect(section.getByRole('group', { name: 'Calendar', exact: true })).toBeVisible();
  await day(calendarIn(page, 'basic'), '2024-08-20').click();
  await expect(section.getByRole('group', { name: 'Calendar, selected date: Tuesday, August 20, 2024' })).toBeVisible();
});

test('the chosen day is exposed as a selected gridcell', async ({ page }) => {
  const section = page.locator('#basic');
  await day(calendarIn(page, 'basic'), '2024-08-20').click();
  await expect(section.getByRole('gridcell', { selected: true })).toHaveText('20');
});

test('the browser accessibility tree has gridcells and the selection', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'reads the real accessibility tree through the Chrome DevTools Protocol');
  await day(calendarIn(page, 'basic'), '2024-08-20').click();
  await expect(page.locator('#changes')).toHaveText('2024-08-20');
  const cdp = await page.context().newCDPSession(page);
  const { nodes } = await cdp.send('Accessibility.getFullAXTree');
  const selected = nodes.filter(
    (node) =>
      node.role?.value === 'gridcell' &&
      node.properties?.some((property) => property.name === 'selected' && property.value?.value === true),
  );
  expect(selected.map((node) => node.name?.value)).toEqual(['Tuesday, August 20, 2024']);
});
