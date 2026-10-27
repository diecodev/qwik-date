import { expect, test } from '@playwright/test';
import { day, popoverGap } from './helpers';

test.describe('DatePicker', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/e2e/picker/');
  });

  test('opens next to its trigger and reports the chosen date', async ({ page }) => {
    const trigger = page.locator('#picker button[popovertarget]');
    const popover = page.locator('#picker [popover]');
    await trigger.click();
    await expect(popover).toBeVisible();
    await expect.poll(() => popoverGap(trigger, popover)).toBeLessThan(3);
    await day(popover, '2024-08-20').click();
    await expect(page.locator('#picked')).toHaveText('2024-08-20');
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

  test('unStyled gets none of the library styles and is still positioned', async ({ page }) => {
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
