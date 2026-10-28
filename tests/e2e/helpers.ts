import type { Locator, Page } from '@playwright/test';

/** The inline calendar (not a popover) inside the fixture section `#id`. */
export const calendarIn = (page: Page, id: string) => page.locator(`#${id} [data-qwik-date]:not([popover])`).first();

export const day = (calendar: Locator, date: string) => calendar.locator(`button[data-value="${date}"]`);

export const title = (calendar: Locator) => calendar.locator('header > div');

export const prevButton = (calendar: Locator) => calendar.locator('header > button').first();

export const nextButton = (calendar: Locator) => calendar.locator('header > button').nth(1);

/** The `data-value` of the focused day, or the tag name when the focus isn't on a day. */
export const focusedDay = (page: Page) =>
  page.evaluate(() => document.activeElement?.getAttribute('data-value') ?? document.activeElement?.tagName);

/** Vertical gap between a trigger and its popover (8px offset, above or below). */
export const popoverGap = async (trigger: Locator, popover: Locator) => {
  const t = await trigger.boundingBox();
  const p = await popover.boundingBox();
  if (!t || !p) return Number.POSITIVE_INFINITY;
  return Math.min(Math.abs(p.y - (t.y + t.height + 8)), Math.abs(p.y + p.height + 8 - t.y));
};

/** WCAG contrast ratio of an element's text against the first opaque background up its tree. */
export const contrastRatio = (locator: Locator) =>
  locator.evaluate((el) => {
    const rgb = (color: string) => (color.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number);
    const luminance = ([r, g, b]: number[]) => {
      const channel = (v: number) => {
        const c = v / 255;
        return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
      };
      return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
    };
    let node: Element | null = el;
    let background = 'rgba(0, 0, 0, 0)';
    while (node && background === 'rgba(0, 0, 0, 0)') {
      background = getComputedStyle(node).backgroundColor;
      node = node.parentElement;
    }
    if (background === 'rgba(0, 0, 0, 0)') background = 'rgb(255, 255, 255)';
    const [a, b] = [luminance(rgb(getComputedStyle(el).color)), luminance(rgb(background))];
    return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  });
