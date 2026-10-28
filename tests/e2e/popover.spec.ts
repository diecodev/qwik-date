import { expect, test } from '@playwright/test';
import { day, popoverGap } from './helpers';

// the README's native recipe (src/recipes/popover.tsx): a native popover placed with CSS anchor positioning
test.beforeEach(async ({ page }) => {
  await page.goto('/e2e/popover/');
});

test('opens next to its trigger, as a dialog, with the focus on the selected day', async ({ page }) => {
  const trigger = page.locator('#picker button[popovertarget]');
  const popover = page.locator('#picker [popover]');
  await expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await trigger.click();
  await expect(popover).toBeVisible();
  await expect(popover).toHaveAttribute('role', 'dialog');
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  // 8px under the trigger, lined up with its left edge
  expect(await popoverGap(trigger, popover)).toBeLessThan(2);
  const [t, p] = [await trigger.boundingBox(), await popover.boundingBox()];
  expect(Math.abs((p?.x ?? 0) - (t?.x ?? 0))).toBeLessThan(2);
  expect(p?.y).toBeGreaterThan(t?.y ?? 0);
  await expect(day(popover, '2024-08-06')).toBeFocused();
});

test('opens above the trigger when there is no room below', async ({ page }) => {
  const trigger = page.locator('#bottom button[popovertarget]');
  const popover = page.locator('#bottom [popover]');
  // the trigger at the bottom of the window
  await trigger.evaluate((el) => el.scrollIntoView({ block: 'end' }));
  await trigger.click();
  await expect(popover).toBeVisible();
  const [t, p] = [await trigger.boundingBox(), await popover.boundingBox()];
  expect((p?.y ?? 0) + (p?.height ?? 0)).toBeLessThanOrEqual((t?.y ?? 0) + 1);
  expect(await popoverGap(trigger, popover)).toBeLessThan(2);
});

test('Escape closes it and returns the focus to the trigger', async ({ page }) => {
  const trigger = page.locator('#picker button[popovertarget]');
  const popover = page.locator('#picker [popover]');
  await trigger.click();
  await expect(day(popover, '2024-08-06')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(popover).toBeHidden();
  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
});

test('choosing a day closes it and returns the focus to the trigger', async ({ page }) => {
  const trigger = page.locator('#picker button[popovertarget]');
  const popover = page.locator('#picker [popover]');
  await expect(trigger).toHaveText('Aug 06, 2024');
  await trigger.click();
  await expect(day(popover, '2024-08-06')).toBeFocused();
  await page.keyboard.press('ArrowRight');
  await expect(day(popover, '2024-08-07')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#day')).toHaveText('2024-08-07');
  await expect(popover).toBeHidden();
  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveText('Aug 07, 2024');
  // a click too
  await trigger.click();
  await day(popover, '2024-08-20').click();
  await expect(popover).toBeHidden();
  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveText('Aug 20, 2024');
});

test('keyboard month changes keep the focus inside the popup', async ({ page }) => {
  // the inline calendar on the page shows August too: the focus must not jump into it
  const popover = page.locator('#picker [popover]');
  await page.locator('#picker button[popovertarget]').click();
  await expect(day(popover, '2024-08-06')).toBeFocused();
  await page.keyboard.press('PageUp');
  await expect(popover.locator('header > div')).toHaveText('July 2024');
  await expect(day(popover, '2024-07-06')).toBeFocused();
  await page.keyboard.press('PageDown');
  await expect(popover.locator('header > div')).toHaveText('August 2024');
  await expect(day(popover, '2024-08-06')).toBeFocused();
  await expect(popover).toBeVisible();
});

test('a range closes it once it has an end', async ({ page }) => {
  const trigger = page.locator('#range button[popovertarget]');
  const popover = page.locator('#range [popover]');
  await expect(trigger).toHaveText('Aug 05, 2024 – Aug 12, 2024');
  await trigger.click();
  await expect(day(popover, '2024-08-05')).toBeFocused();
  await day(popover, '2024-08-20').click();
  await expect(trigger).toHaveText('Aug 20, 2024 – …');
  await expect(popover).toBeVisible();
  await day(popover, '2024-08-22').click();
  await expect(trigger).toHaveText('Aug 20, 2024 – Aug 22, 2024');
  await expect(popover).toBeHidden();
  await expect(trigger).toBeFocused();
});

test('name submits the chosen day with the form around it', async ({ page }) => {
  const submit = page.locator('#submit');
  const entries = page.locator('#entries');
  await submit.click();
  await expect(entries).toHaveText('picked=2024-08-15');
  const popover = page.locator('#form [popover]');
  await page.locator('#form button[popovertarget]').click();
  await day(popover, '2024-08-20').click();
  await expect(popover).toBeHidden();
  // wait for the hidden input to follow the choice before submitting
  await expect(page.locator('#form input[type="hidden"]')).toHaveValue('2024-08-20');
  await submit.click();
  await expect(entries).toHaveText('picked=2024-08-20');
});
