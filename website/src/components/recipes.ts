// The README's date picker recipes, as the site shows them

export const NATIVE = `import { $, type Signal, component$, useId, useSignal } from '@qwik.dev/core';
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

export const USAGE = `const date = useSignal<LocalDate | null>(null);

<DatePicker bind:value={date} name="due" />;`

export const RANGE = `<button /* ... */>{range.value ? formatDateRange(range.value) : 'Pick dates'}</button>
<Calendar
  autoFocus
  mode="range"
  bind:value={range}
  onChange$={(value) => value.end && document.getElementById(id)?.hidePopover()}
  containerProps={/* the same */}
/>`

export const FLOATING = `import { autoUpdate, computePosition, flip, offset, shift } from '@floating-ui/dom';
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
