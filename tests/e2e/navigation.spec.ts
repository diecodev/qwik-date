import { expect, test } from '@playwright/test';
import { calendarIn, day, nextButton, prevButton, title } from './helpers';

test.beforeEach(async ({ page }) => {
  await page.goto('/e2e/calendar/');
});

test('the header buttons change the month, across years', async ({ page }) => {
  const calendar = calendarIn(page, 'basic');
  for (let i = 0; i < 8; i++) await prevButton(calendar).click();
  await expect(title(calendar)).toHaveText('December 2023');
  await nextButton(calendar).click();
  await expect(title(calendar)).toHaveText('January 2024');
});

test('the header buttons keep the focus, so they can be pressed repeatedly', async ({ page }) => {
  const calendar = calendarIn(page, 'basic');
  await prevButton(calendar).focus();
  for (const month of ['July 2024', 'June 2024', 'May 2024']) {
    await page.keyboard.press('Enter');
    await expect(title(calendar)).toHaveText(month);
    await expect(prevButton(calendar)).toBeFocused();
  }
  await expect(calendar.locator('[aria-selected="true"]')).toHaveCount(0);
});

test('after changing month, Tab enters the grid on the 1st', async ({ page, browserName }) => {
  const calendar = calendarIn(page, 'basic');
  await prevButton(calendar).focus();
  await page.keyboard.press('Enter');
  await expect(title(calendar)).toHaveText('July 2024');
  await expect(calendar.locator('button[data-value][tabindex="0"]')).toHaveAttribute('data-value', '2024-07-01');
  // WebKit, like Safari, only tabs to elements with an explicit tabindex, so it skips the ">" button
  for (let i = 0; i < (browserName === 'webkit' ? 1 : 2); i++) await page.keyboard.press('Tab');
  await expect(day(calendar, '2024-07-01')).toBeFocused();
});

test('the month buttons take navButtonProps, prevButtonProps, nextButtonProps and custom icons', async ({ page }) => {
  const calendar = calendarIn(page, 'custom-nav');
  await expect(prevButton(calendar)).toHaveClass('nav');
  await expect(prevButton(calendar)).toHaveAttribute('title', 'Previous');
  await expect(prevButton(calendar)).toHaveAttribute('aria-label', 'go to previous month');
  // the specific props win over navButtonProps
  await expect(nextButton(calendar)).toHaveClass('next');
  await expect(nextButton(calendar)).toHaveAttribute('title', 'Next');
  await expect(nextButton(calendar).locator('svg[data-icon="arrow"]')).toHaveCount(1);
  await prevButton(calendar).click();
  await expect(title(calendar)).toHaveText('July 2024');
  await expect(page.locator('#nav-clicks')).toHaveText('prev');
});

test('the month title is a polite live region', async ({ page }) => {
  await expect(title(calendarIn(page, 'basic'))).toHaveAttribute('aria-live', 'polite');
});
