import { $, type Signal, component$, useId, useSignal } from '@qwik.dev/core';
import { Calendar, type DateRange, type LocalDate, formatDate, formatDateRange } from '../lib';

// The README's native recipe (a native popover placed with CSS anchor positioning), as code: tests/e2e/popover.spec.ts
// and the catalog render it, so keep it and the README in sync.

/** Under the trigger, 8px away, or above it when there's no room below. */
const placement = (id: string) =>
  `position-anchor: --${id}; position-area: bottom span-right; position-try-fallbacks: flip-block; margin: 8px 0`;

export const DatePicker = component$<{ 'bind:value': Signal<LocalDate | null>; name?: string }>((props) => {
  const id = useId();
  const date = props['bind:value'];
  const open = useSignal(false);
  const trigger = useSignal<HTMLButtonElement>();

  return (
    <>
      <button
        ref={trigger}
        type='button'
        popovertarget={id}
        aria-haspopup='dialog'
        aria-expanded={open.value}
        style={`anchor-name: --${id}`}
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
          // inside an object, not a JSX attribute: the optimizer doesn't turn it into a QRL, `$()` does
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
});

export const DateRangePicker = component$<{ 'bind:value': Signal<DateRange | null>; name?: string }>((props) => {
  const id = useId();
  const range = props['bind:value'];
  const open = useSignal(false);
  const trigger = useSignal<HTMLButtonElement>();

  return (
    <>
      <button
        ref={trigger}
        type='button'
        popovertarget={id}
        aria-haspopup='dialog'
        aria-expanded={open.value}
        style={`anchor-name: --${id}`}
      >
        {range.value ? formatDateRange(range.value) : 'Pick dates'}
      </button>
      <Calendar
        autoFocus
        mode='range'
        bind:value={range}
        name={props.name}
        // a range is chosen once it has an end
        onChange$={(value) => value.end && document.getElementById(id)?.hidePopover()}
        containerProps={{
          id,
          popover: 'auto',
          role: 'dialog',
          style: placement(id),
          onToggle$: $((event, popover) => {
            open.value = event.newState === 'open';
            const focused = document.activeElement;
            if (!open.value && (focused === document.body || popover.contains(focused))) trigger.value?.focus();
          }),
        }}
      />
    </>
  );
});
