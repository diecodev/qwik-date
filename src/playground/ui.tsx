import { $, type QRL, Slot, component$, useSignal, useVisibleTask$ } from '@qwik.dev/core';

/** A group of cases, mirroring one spec file of tests/e2e. */
export const Section = component$<{ id: string; title: string; spec: string }>(({ id, title, spec }) => (
  <section id={id} class='pg-section'>
    <h2>
      {title} <code>tests/e2e/{spec}</code>
    </h2>
    <Slot />
  </section>
));

/** One case: what to try and what should happen, next to its own calendars. `tests` are the titles of its e2e tests. */
export const Case = component$<{ id: string; title: string; tests: string[] }>(({ id, title, tests }) => (
  <article id={id} class='pg-case'>
    <h3>
      <a href={`#${id}`}>{title}</a>
    </h3>
    <p class='pg-tests'>
      {tests.length > 1 ? 'Tests' : 'Test'}:{' '}
      {tests.map((test, i) => (
        <span key={test}>
          {i > 0 && ', '}
          <q>{test}</q>
        </span>
      ))}
    </p>
    <div class='pg-body'>
      <Slot />
    </div>
  </article>
));

/** The steps of a case: each `<li>` holds two `<p>`, what to try and what should happen. */
export const Steps = component$(() => (
  <div class='pg-steps'>
    <p class='pg-steps-head'>
      <span>Try</span>
      <span>Expect</span>
    </p>
    <ol>
      <Slot />
    </ol>
  </div>
));

/** The components of a case, with their controls and readouts. */
export const Demo = component$(() => (
  <div class='pg-demo'>
    <Slot />
  </div>
));

/** Selector of a day of the inline calendar in a case (a DatePicker popup is a calendar too). */
export const day = (date: string) => `[data-qwik-date]:not([popover]) button[data-value="${date}"]`;

export const prevButton = '[data-qwik-date]:not([popover]) header button:first-of-type';

/**
 * Focuses an element of the case, the way the tests do (`locator.focus()`): clicking a day would also choose it,
 * and WebKit neither focuses buttons on click nor tabs to them without an explicit tabindex.
 */
export const Focus = component$<{ on: string }>(({ on }) => (
  <button
    type='button'
    class='pg-button'
    tabIndex={0}
    onClick$={(_, button) => button.closest('.pg-case')?.querySelector<HTMLElement>(on)?.focus()}
  >
    <Slot />
  </button>
));

/** The first inline calendar of a case. */
export const calendarOf = (root: HTMLElement) => root.querySelector<HTMLElement>('[data-qwik-date]:not([popover])');

// readers shared by several probes are QRLs: the optimizer only wraps the functions written inline in a `$` prop

/** The day of the cell exposed as selected (`aria-selected`). */
export const selectedCell = $(
  (root: HTMLElement) => calendarOf(root)?.querySelector('td[aria-selected="true"]')?.textContent || 'none',
);

/** The day marked as today (`aria-current="date"`, the grey one). */
export const todayMarked = $(
  (root: HTMLElement) =>
    calendarOf(root)?.querySelector('[aria-current="date"]')?.getAttribute('data-value') ?? 'none in this month',
);

/** WCAG contrast ratio of an element's text against the first opaque background up its tree (as tests/e2e/helpers.ts). */
export const contrastRatio = (el: Element | null) => {
  if (!el) return 'not found';
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
  return `${((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)).toFixed(2)}:1`;
};

/** Where the DatePicker popup of a case sits relative to its trigger (the tests expect an 8px gap). */
export const popupGap = $((root: HTMLElement) => {
  const trigger = root.querySelector('button[popovertarget]');
  const popup = root.querySelector('[popover]');
  if (!trigger || !popup?.matches(':popover-open')) return 'closed';
  const t = trigger.getBoundingClientRect();
  const p = popup.getBoundingClientRect();
  return p.top >= t.bottom
    ? `${Math.round(p.top - t.bottom)}px below the trigger`
    : `${Math.round(t.top - p.bottom)}px above the trigger`;
});

/**
 * A value read from the case's DOM (attributes, computed styles), kept up to date while the case changes:
 * on DOM changes, popups opening or closing, and the OS color scheme changing.
 */
export const Probe = component$<{ label: string; read$: QRL<(root: HTMLElement) => string> }>(({ label, read$ }) => {
  const ref = useSignal<HTMLElement>();
  const value = useSignal('');

  useVisibleTask$(({ cleanup }) => {
    const root = ref.value?.closest<HTMLElement>('.pg-case');
    if (!root) return;

    let timer: ReturnType<typeof setTimeout> | undefined;
    const update = async () => {
      value.value = await read$(root);
    };
    // read again a bit later: floating-ui positions the popup asynchronously
    const schedule = () => {
      update();
      clearTimeout(timer);
      timer = setTimeout(update, 250);
    };

    // the readouts change the DOM too: ignore them, or the probes would wake each other up
    const observer = new MutationObserver((records) => {
      const node = (record: MutationRecord) =>
        record.target instanceof Element ? record.target : record.target.parentElement;
      if (records.some((record) => !node(record)?.closest('.pg-probe'))) schedule();
    });
    observer.observe(root, { subtree: true, childList: true, attributes: true, characterData: true });
    root.addEventListener('toggle', schedule, true);
    const scheme = matchMedia('(prefers-color-scheme: dark)');
    scheme.addEventListener('change', schedule);
    schedule();

    cleanup(() => {
      observer.disconnect();
      root.removeEventListener('toggle', schedule, true);
      scheme.removeEventListener('change', schedule);
      clearTimeout(timer);
    });
  });

  return (
    <p class='pg-probe' ref={ref}>
      {label}: <output>{value.value}</output>
    </p>
  );
});

/** The values a calendar handed to `onChange$`, in order. */
export const Changes = component$<{ values: string[] }>(({ values }) => (
  <p class='pg-probe'>
    onChange$ calls ({values.length}): <output>{values.length ? values.join(', ') : 'none'}</output>
  </p>
));

const describeFocus = (el: Element | null) => {
  if (!el || el === document.body) return 'nothing (the page)';

  const name = el.getAttribute('aria-label') ?? el.textContent?.trim();
  const value = el.getAttribute('data-value');
  const what = value ? `day ${value}, "${name}"` : `${el.tagName.toLowerCase()} "${name}"`;
  const popup = el.closest('[popover]') ? ' in the DatePicker popup' : '';
  const where = el.closest('.pg-case')?.querySelector('h3')?.textContent;
  return `${what}${popup}${where ? ` (${where})` : ''}`;
};

/** Fixed bar with what the keyboard cases need to see: the focused element, the page scroll and uncaught errors. */
export const StatusBar = component$(() => {
  const focus = useSignal('nothing (the page)');
  const scroll = useSignal(0);
  const errors = useSignal<string[]>([]);

  useVisibleTask$(
    ({ cleanup }) => {
      // focusout runs before the focus lands on the next element: read it once the event is over
      const onFocus = () =>
        setTimeout(() => {
          focus.value = describeFocus(document.activeElement);
        });
      const onScroll = () => {
        scroll.value = Math.round(window.scrollY);
      };
      const onError = (event: ErrorEvent | PromiseRejectionEvent) => {
        errors.value = [...errors.value, 'message' in event ? event.message : String(event.reason)];
      };

      document.addEventListener('focusin', onFocus);
      document.addEventListener('focusout', onFocus);
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('error', onError);
      window.addEventListener('unhandledrejection', onError);
      onFocus();
      onScroll();

      cleanup(() => {
        document.removeEventListener('focusin', onFocus);
        document.removeEventListener('focusout', onFocus);
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('error', onError);
        window.removeEventListener('unhandledrejection', onError);
      });
    },
    { strategy: 'document-ready' },
  );

  return (
    <aside class='pg-status'>
      <p>
        Focus: <output id='pg-focus'>{focus.value}</output>
      </p>
      <p>
        Page scroll: <output id='pg-scroll'>{scroll.value}px</output>
      </p>
      <p title={errors.value.join('\n')}>
        Uncaught errors: <output id='pg-errors'>{errors.value.length}</output>
      </p>
    </aside>
  );
});
