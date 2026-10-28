import { expect, test } from '@playwright/test';
import { day, popoverGap } from './helpers';

test.describe('DatePicker', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/e2e/picker/');
  });

  test('opens next to its trigger, reports the chosen date and closes', async ({ page }) => {
    const trigger = page.locator('#picker button[popovertarget]');
    const popover = page.locator('#picker [popover]');
    await trigger.click();
    await expect(popover).toBeVisible();
    await expect.poll(() => popoverGap(trigger, popover)).toBeLessThan(3);
    await day(popover, '2024-08-20').click();
    await expect(page.locator('#picked')).toHaveText('2024-08-20');
    await expect(popover).toBeHidden();
    await expect(trigger).toHaveText('Aug 20, 2024');
  });

  test('shows the value in the trigger, or a placeholder without one', async ({ page }) => {
    await expect(page.locator('#picker button[popovertarget]')).toHaveText('Aug 06, 2024');
    await expect(page.locator('#empty button[popovertarget]')).toHaveText('Select a date');
    await expect(page.locator('#placeholder button[popovertarget]')).toHaveText('Pick a date');
    await expect(page.locator('#es button[popovertarget]')).toHaveText('01 Ago 2024');
    await expect(page.locator('#fr button[popovertarget]')).toHaveText('Choisir une date');
  });

  test('choosing with the keyboard closes it and returns the focus to the trigger', async ({ page, browserName }) => {
    const trigger = page.locator('#picker button[popovertarget]');
    const popover = page.locator('#picker [popover]');
    await trigger.click();
    await expect(popover).toBeVisible();
    // into the grid: past the month buttons in Chromium, straight to the day in WebKit
    for (let i = 0; i < (browserName === 'webkit' ? 1 : 3); i++) await page.keyboard.press('Tab');
    await expect(day(popover, '2024-08-06')).toBeFocused();
    await page.keyboard.press('ArrowRight');
    await expect(day(popover, '2024-08-07')).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('#picked')).toHaveText('2024-08-07');
    await expect(popover).toBeHidden();
    await expect(trigger).toBeFocused();
    await expect(trigger).toHaveText('Aug 07, 2024');
  });

  test('closeOnSelect={false} keeps it open', async ({ page }) => {
    const trigger = page.locator('#keep-open button[popovertarget]');
    const popover = page.locator('#keep-open [popover]');
    await trigger.click();
    await day(popover, '2024-08-20').click();
    await expect(trigger).toHaveText('Aug 20, 2024');
    await expect(popover).toBeVisible();
  });

  test('Escape closes it while a day is focused', async ({ page }) => {
    const popover = page.locator('#picker [popover]');
    await page.locator('#picker button[popovertarget]').click();
    await day(popover, '2024-08-15').focus();
    await page.keyboard.press('Escape');
    await expect(popover).toBeHidden();
  });

  test('keyboard month changes keep the focus inside the popup', async ({ page }) => {
    // the inline calendar on the page shows August too: the focus must not jump into it
    const popover = page.locator('#picker [popover]');
    await page.locator('#picker button[popovertarget]').click();
    await popover.locator('header button').first().click();
    await day(popover, '2024-07-31').focus();
    await page.keyboard.press('ArrowRight');
    await expect(day(popover, '2024-08-01')).toBeFocused();
  });

  test('works with a custom containerProps.id', async ({ page }) => {
    const trigger = page.locator('#custom-id button[popovertarget]');
    const popover = page.locator('#custom-id [popover]');
    await expect(popover).toHaveAttribute('id', 'my-picker');
    await expect(trigger).toHaveAttribute('popovertarget', 'my-picker');
    await trigger.click();
    await expect(popover).toBeVisible();
    await expect.poll(() => popoverGap(trigger, popover)).toBeLessThan(3);
  });

  test('unstyled gets none of the library styles and is still positioned', async ({ page }) => {
    const trigger = page.locator('#unstyled button[popovertarget]');
    const popover = page.locator('#unstyled [popover]');
    // other, styled calendars on the page inject the stylesheet: it must not reach this one
    await expect(trigger).toHaveCSS('box-shadow', 'none');
    await trigger.click();
    await expect(popover).toBeVisible();
    await expect(popover).toHaveCSS('box-shadow', 'none');
    await expect.poll(() => popoverGap(trigger, popover)).toBeLessThan(3);
  });

  test('positions a DatePicker mounted on the client', async ({ page }) => {
    await page.locator('#toggle-late').click();
    const trigger = page.locator('#late button[popovertarget]');
    const popover = page.locator('#late [popover]');
    await trigger.click();
    await expect(popover).toBeVisible();
    await expect.poll(() => popoverGap(trigger, popover)).toBeLessThan(3);
  });
});

// navigates on its own: the listener counter must be installed before the page loads (a second
// navigation would abort the first page's module imports, which WebKit logs as errors)
test.describe('floating-ui', () => {
  test.beforeEach(async ({ page }) => {
    // count the live scroll/resize listeners: autoUpdate adds some while a DatePicker is mounted
    await page.addInitScript(() => {
      const live = new Set<unknown>();
      const add = EventTarget.prototype.addEventListener;
      const remove = EventTarget.prototype.removeEventListener;
      EventTarget.prototype.addEventListener = function (type: string, listener: unknown, options?: unknown) {
        if (type === 'scroll' || type === 'resize') live.add(listener);
        return add.call(this, type, listener as EventListener, options as AddEventListenerOptions);
      };
      EventTarget.prototype.removeEventListener = function (type: string, listener: unknown, options?: unknown) {
        if (type === 'scroll' || type === 'resize') live.delete(listener);
        return remove.call(this, type, listener as EventListener, options as EventListenerOptions);
      };
      (window as unknown as { liveListeners: () => number }).liveListeners = () => live.size;
    });
    await page.goto('/e2e/picker/');
  });

  test('stops watching when the DatePicker unmounts', async ({ page }) => {
    const live = () => page.evaluate(() => (window as unknown as { liveListeners: () => number }).liveListeners());
    await page.waitForLoadState('networkidle');
    const before = await live();
    await page.locator('#toggle-late').click();
    await expect.poll(live).toBeGreaterThan(before);
    await page.locator('#toggle-late').click();
    await expect.poll(live).toBe(before);
  });
});
