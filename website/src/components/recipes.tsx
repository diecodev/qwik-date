import { component$, useSignal } from '@qwik.dev/core'
import type { DateRange, LocalDate } from 'qwik-date'
import { DatePicker, DateRangePicker } from '~/components/date-picker'

const NATIVE = `import { $, type Signal, component$, useId, useSignal } from '@qwik.dev/core';
import { Calendar, type LocalDate, formatDate } from 'qwik-date';

/** Under the trigger, 8px away, or above it when there's no room below. */
const placement = (id: string) =>
  \`position-anchor: --\${id}; position-area: bottom span-right; position-try-fallbacks: flip-block; margin: 8px 0\`;

export const DatePicker = component$<{ 'bind:value': Signal<LocalDate | null>; name?: string }>((props) => {
  const id = useId();
  const date = props['bind:value'];
  const open = useSignal(false);
  const trigger = useSignal<HTMLButtonElement>();

  return (
    <>
      <button
        ref={trigger}
        type="button"
        popovertarget={id}
        aria-haspopup="dialog"
        aria-expanded={open.value}
        style={\`anchor-name: --\${id}\`}
      >
        {date.value ? formatDate(date.value) : 'Pick a date'}
      </button>
      <Calendar
        autoFocus
        bind:value={date}
        name={props.name}
        onChange$={() => document.getElementById(id)?.hidePopover()}
        containerProps={{
          id,
          popover: 'auto',
          role: 'dialog',
          style: placement(id),
          onToggle$: $((event, popover) => {
            open.value = event.newState === 'open';
            // closed with Escape, a choice or the trigger: the focus goes back to the trigger, unless it went
            // elsewhere (Safari leaves it on the page, or for a moment on the hidden day)
            const focused = document.activeElement;
            if (!open.value && (focused === document.body || popover.contains(focused))) trigger.value?.focus();
          }),
        }}
      />
    </>
  );
});`

const USAGE = `const date = useSignal<LocalDate | null>(null);

<DatePicker bind:value={date} name="due" />;`

const RANGE = `<button /* ... */>{range.value ? formatDateRange(range.value) : 'Pick dates'}</button>
<Calendar
  autoFocus
  mode="range"
  bind:value={range}
  onChange$={(value) => value.end && document.getElementById(id)?.hidePopover()}
  containerProps={/* the same */}
/>`

const FLOATING = `import { autoUpdate, computePosition, flip, offset, shift } from '@floating-ui/dom';
import {
  $,
  type NoSerialize,
  type Signal,
  component$,
  noSerialize,
  useId,
  useSignal,
  useVisibleTask$,
} from '@qwik.dev/core';
import { Calendar, type LocalDate, formatDate } from 'qwik-date';

export const DatePicker = component$<{ 'bind:value': Signal<LocalDate | null>; name?: string }>((props) => {
  const id = useId();
  const date = props['bind:value'];
  const open = useSignal(false);
  const trigger = useSignal<HTMLButtonElement>();
  const stopFollowing = useSignal<NoSerialize<() => void>>();

  // stop following the trigger if the picker goes away while it's open
  useVisibleTask$(({ cleanup }) => cleanup(() => stopFollowing.value?.()));

  return (
    <>
      <button ref={trigger} type="button" popovertarget={id} aria-haspopup="dialog" aria-expanded={open.value}>
        {date.value ? formatDate(date.value) : 'Pick a date'}
      </button>
      <Calendar
        autoFocus
        bind:value={date}
        name={props.name}
        onChange$={() => document.getElementById(id)?.hidePopover()}
        containerProps={{
          id,
          popover: 'auto',
          role: 'dialog',
          // floating-ui sets \`left\` and \`top\`
          style: 'inset: auto; margin: 0',
          onToggle$: $((event, popover) => {
            open.value = event.newState === 'open';
            stopFollowing.value?.();
            stopFollowing.value = undefined;
            const anchor = trigger.value;
            if (!anchor) return;
            if (open.value) {
              // under the trigger (above it without room), 8px away, while the page scrolls or resizes
              const place = () =>
                computePosition(anchor, popover, {
                  strategy: 'fixed',
                  placement: 'bottom-start',
                  middleware: [offset(8), flip(), shift({ padding: 8 })],
                }).then(({ x, y }) => Object.assign(popover.style, { left: \`\${x}px\`, top: \`\${y}px\` }));
              stopFollowing.value = noSerialize(autoUpdate(anchor, popover, place));
              return;
            }
            // closed with Escape, a choice or the trigger: the focus goes back to the trigger, unless it went
            // elsewhere (Safari leaves it on the page, or for a moment on the hidden day)
            const focused = document.activeElement;
            if (focused === document.body || popover.contains(focused)) anchor.focus();
          }),
        }}
      />
    </>
  );
});`

const Code = component$<{ code: string }>(({ code }) => (
  <pre class="overflow-x-auto rounded-lg bg-neutral-50 p-3 font-mono text-neutral-700 text-xs dark:bg-neutral-800 dark:text-neutral-200">
    <code>{code}</code>
  </pre>
))

export const Recipes = component$(() => {
  const date = useSignal<LocalDate | null>(null)
  const range = useSignal<DateRange | null>(null)

  return (
    <section class="space-y-6 text-neutral-700 text-sm dark:text-neutral-300">
      <h3 class="text-center font-medium text-base text-neutral-900 dark:text-white">
        {'> '}Date picker (popover) recipes{' <'}
      </h3>
      <p class="text-balance">
        There's no DatePicker component: as with shadcn/ui (Popover + Calendar),
        you put the Calendar in a popover next to a trigger of your own. The
        trigger, its format, its placeholder and when the popup closes are
        yours, and qwik-date stays free of runtime dependencies. The recipes
        below do the same, with full accessibility:
      </p>
      <ul class="list-disc space-y-1 pl-5">
        <li>
          the trigger has aria-haspopup="dialog" and aria-expanded, and the
          popup is a dialog (role="dialog", named after the calendar);
        </li>
        <li>
          opening it focuses the selected day, or the first one that can be
          chosen (autoFocus);
        </li>
        <li>Escape closes it, and so does a click outside;</li>
        <li>
          choosing a day closes it (a range, once it has an end) and the focus
          goes back to the trigger, as it does after Escape;
        </li>
        <li>the trigger shows the value with formatDate / formatDateRange.</li>
      </ul>
      <p>
        onToggle$ goes inside containerProps, an object: the optimizer only
        turns $ props of JSX attributes into QRLs, so wrap it in $().
      </p>

      <div class="space-y-3">
        <h4 class="font-medium text-neutral-900 dark:text-white">
          1. Native popover + CSS anchor positioning
        </h4>
        <p>
          No dependencies and no positioning JavaScript. The calendar is itself
          the popover (containerProps.popover), the browser closes it on Escape
          and on clicks outside, and CSS anchor positioning keeps it under the
          trigger, or above it when there's no room below. Anchor positioning is
          Baseline since January 2026: Chrome and Edge 125, Safari 26, Firefox
          147. Try it:
        </p>
        {/* the recipe's trigger is a bare button: give it a border here, Tailwind resets buttons */}
        <div class="flex flex-wrap gap-6 [&_button[popovertarget]]:rounded-lg [&_button[popovertarget]]:border [&_button[popovertarget]]:px-3 [&_button[popovertarget]]:py-1.5">
          <DatePicker bind:value={date} />
          <DateRangePicker bind:value={range} />
        </div>
        <Code code={NATIVE} />
        <Code code={USAGE} />
        <p>
          For a range, mode="range", formatDateRange and close it once the range
          has an end:
        </p>
        <Code code={RANGE} />
      </div>

      <div class="space-y-3">
        <h4 class="font-medium text-neutral-900 dark:text-white">
          2. Qwik UI Popover
        </h4>
        <p>
          Not yet: Qwik UI doesn't run on Qwik v2. Its latest release,
          @qwik-ui/headless 0.7.7, is built for Qwik v1 (@builder.io/qwik).
          Tried with @qwik.dev/core 2.0.0-rc.4, its Popover renders nothing in a
          production build (neither the trigger nor the panel, only its
          children), its components don't typecheck as Qwik v2 components, and
          in dev the first opening shows an invisible panel (it stays hidden).
          Until Qwik UI supports Qwik v2, use recipe 1, or recipe 3: Qwik UI's
          Popover is a native popover placed by floating-ui too.
        </p>
      </div>

      <div class="space-y-3">
        <h4 class="font-medium text-neutral-900 dark:text-white">
          3. floating-ui
        </h4>
        <p>
          For the browsers without CSS anchor positioning (Safari before 26,
          Firefox before 147), or for floating-ui's middleware: the same native
          popover, placed by floating-ui while it's open (npm install
          @floating-ui/dom).
        </p>
        <Code code={FLOATING} />
      </div>
    </section>
  )
})
