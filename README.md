# qwik-date

**Qwik calendar, simple integration**

`qwik-date` is an opinionated calendar component designed for the Qwik framework. It does the calendar, with no runtime dependencies; for a date picker, put it in a popover with a trigger of your own: see the [recipes](#date-picker-popover-recipes).

## Requirements

`qwik-date` 2.x targets **Qwik v2** (`@qwik.dev/core`), which is a peer dependency. It ships ESM only.

If your app is still on Qwik v1 (`@builder.io/qwik`), stay on `qwik-date@1`.

## Installation

You can install `qwik-date` using any of the following package managers:

```sh
npm install -D -E qwik-date
pnpm add -D -E qwik-date
bun add -D -E qwik-date
yarn add -D -E qwik-date
```

## Usage

### Inline Calendar

```ts
import { Calendar } from 'qwik-date';
```

#### Inline Calendar Example

Here's a basic example of how to use the inline calendar:

```tsx
import { component$, useSignal } from '@qwik.dev/core';
import { Calendar, type LocalDate } from 'qwik-date';

export default component$(() => {
  const date = useSignal<LocalDate | null>(null);

  return <Calendar bind:value={date} onChange$={(value) => console.log({ value })} />;
});
```

Dates are `'YYYY-MM-DD'` strings (the `LocalDate` type): a day, without time or timezone.

#### Range

With `mode="range"` the value is a `DateRange`, `{ start, end }`: the first day chosen starts it (`end: null`), the second ends it (they swap if it's earlier), and the next one starts a new range. `onChange$` is called on every choice.

```tsx
import { component$, useSignal } from '@qwik.dev/core';
import { Calendar, type DateRange } from 'qwik-date';

export default component$(() => {
  const range = useSignal<DateRange | null>(null);

  return <Calendar mode="range" bind:value={range} onChange$={({ start, end }) => console.log(start, end)} />;
});
```

#### Formatting

`formatDate` and `formatDateRange` turn a value into text for a trigger or a label: a two-digit day and a capitalized month, in any locale (`'en'` by default). A range without an end shows `…`.

```tsx
import { formatDate, formatDateRange } from 'qwik-date';

formatDate('2024-08-15'); // 'Aug 15, 2024'
formatDate('2024-08-01', 'es'); // '01 Ago 2024'
formatDateRange({ start: '2024-08-05', end: '2024-08-12' }); // 'Aug 05, 2024 – Aug 12, 2024'
formatDateRange({ start: '2024-08-05', end: null }); // 'Aug 05, 2024 – …'
```

So a trigger is one line:

```tsx
<button type="button">{date.value ? formatDate(date.value) : 'Pick a date'}</button>
```

#### Props

- `mode`: `'single'` (default) to select a day, `'range'` to select a start and an end; see [Range](#range).
- `value`: The selected day (a `DateRange` with `mode="range"`), or `null` for none (default: `null`). The calendar opens on its month, or on today's month without one. Today is marked with `aria-current="date"`.
- `bind:value`: A signal kept in sync with the value, in both directions.
- `name`: Submits the value with the form around the calendar, in a hidden input with this name (`YYYY-MM-DD`, empty without a value). A range submits `name[start]` and `name[end]`.
- `autoFocus`: Focuses the day where Tab enters the grid (the selected one, or the first that can be chosen) every time the calendar shows up: on load or once mounted if it's visible, and when a popover, dialog or `<details>` around it opens. Without it the calendar never takes the focus on its own. As with the HTML `autofocus` attribute, Chromium drops the focus on load when the URL points at an element (`#id`).
- `min`, `max`: The first and the last day that can be chosen (`'YYYY-MM-DD'`). The month buttons stop at their months.
- `disabledDates`: Days that can't be chosen (`LocalDate[]`).
- `disabledWeekdays`: Weekdays that can't be chosen, `0` for Sunday: `[0, 6]` disables the weekends. The keyboard skips these days, and a range can't cross them (it ends right before the first one).
- `onChange$`: Called with the new value when the user chooses a day.
- `fullWeeks`: If true, shows full weeks (default: false).
- `locale`: `'en'` (default), `'es'`, or any BCP 47 language tag (`'fr-FR'`, `'de'`); see [Languages](#languages).
- `labels`: The texts `Intl` can't give (`calendar`, `previousMonth`, `nextMonth`, `selectedDate`, `selectedRange`). Optional for `en` and `es`, required for any other locale.
- `weekStartsOn`: The first day of the week, from `0` (Sunday, the default) to `6`, as in `Date#getDay()`.
- `showWeekNumber`: If true, shows week numbers (default: false).
- `showDaysOfWeek`: If true, shows days of the week ~Mo, Tu, We, etc.~ (default: true).
- `prevIcon`, `nextIcon`: Custom icons for the previous and next month buttons.
- `containerProps`, `headerProps`, `navButtonProps` (both month buttons), `prevButtonProps`, `nextButtonProps`, `calendarProps`, `theadProps`, `tbodyProps`, `theadRowProps`, `tbodyRowProps`, `headerCellProps`, `cellProps`, `dayButtonProps`, `iconProps`, `titleProps`, `weekNumberProps`: Custom props for various parts of the component.
- `unstyled`: If true, removes default styling (default: false).
- `theme`: `'light'` (default), `'dark'`, or `'auto'` to follow the operating system's color scheme. It also accepts a `Signal<Theme>` to change it at runtime.

#### Languages

`en` and `es` have built-in texts. Any other language takes its month and weekday names from `Intl`, with a capital letter, and needs the other texts in `labels` (TypeScript asks for them):

```tsx
import { Calendar, type Labels } from 'qwik-date';

const fr: Labels = {
  calendar: 'Calendrier',
  previousMonth: 'Mois précédent',
  nextMonth: 'Mois suivant',
  selectedDate: 'date sélectionnée :',
  selectedRange: 'période sélectionnée :',
};

<Calendar locale="fr-FR" labels={fr} weekStartsOn={1} />;
```

#### Theme

```tsx
import { component$, useSignal } from '@qwik.dev/core';
import { Calendar, type Theme } from 'qwik-date';

export default component$(() => {
  const theme = useSignal<Theme>('auto');

  return <Calendar theme={theme} />;
});
```

`auto` is resolved with CSS (`prefers-color-scheme`), so it ships no JavaScript.

### Date picker (popover) recipes

There's no `DatePicker` component: as with shadcn/ui (Popover + Calendar), you put the `Calendar` in a popover next to a trigger of your own. The trigger, its format, its placeholder and when the popup closes are yours, and `qwik-date` stays free of runtime dependencies.

The recipes below do the same, with full accessibility:

- the trigger has `aria-haspopup="dialog"` and `aria-expanded`, and the popup is a dialog (`role="dialog"`, named after the calendar);
- opening it focuses the selected day, or the first one that can be chosen (`autoFocus`);
- Escape closes it, and so does a click outside;
- choosing a day closes it (a range, once it has an end) and the focus goes back to the trigger, as it does after Escape;
- the trigger shows the value with `formatDate` / `formatDateRange`.

`onToggle$` goes inside `containerProps`, an object: the optimizer only turns `$` props of JSX attributes into QRLs, so wrap it in `$()`.

#### 1. Native popover + CSS anchor positioning

No dependencies and no positioning JavaScript. The calendar is itself the popover (`containerProps.popover`, styled as a card like an inline calendar), the browser closes it on Escape and on clicks outside, and CSS anchor positioning keeps it under the trigger, or above it when there's no room below. Anchor positioning is Baseline since January 2026: Chrome and Edge 125, Safari 26, Firefox 147.

This recipe is tested in this repo: [`src/recipes/popover.tsx`](./src/recipes/popover.tsx), by [`tests/e2e/popover.spec.ts`](./tests/e2e/popover.spec.ts).

```tsx
import { $, type Signal, component$, useId, useSignal } from '@qwik.dev/core';
import { Calendar, type LocalDate, formatDate } from 'qwik-date';

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
        type="button"
        popovertarget={id}
        aria-haspopup="dialog"
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
```

```tsx
const date = useSignal<LocalDate | null>(null);

<DatePicker bind:value={date} name="due" />;
```

For a range, `mode="range"`, `formatDateRange` and close it once the range has an end:

```tsx
<button /* ... */>{range.value ? formatDateRange(range.value) : 'Pick dates'}</button>
<Calendar
  autoFocus
  mode="range"
  bind:value={range}
  onChange$={(value) => value.end && document.getElementById(id)?.hidePopover()}
  containerProps={/* the same */}
/>
```

#### 2. Qwik UI Popover

Not yet: Qwik UI doesn't run on Qwik v2. Its latest release, `@qwik-ui/headless` 0.7.7, is built for Qwik v1 (`@builder.io/qwik`). Tried with `@qwik.dev/core` 2.0.0-rc.4, its `Popover` renders nothing in a production build (neither the trigger nor the panel, only its children), its components don't typecheck as Qwik v2 components, and in dev the first opening shows an invisible panel (it stays `hidden`). Until Qwik UI supports Qwik v2, use recipe 1, or recipe 3: Qwik UI's Popover is a native popover placed by floating-ui too.

#### 3. floating-ui

For the browsers without CSS anchor positioning (Safari before 26, Firefox before 147), or for floating-ui's middleware: the same native popover, placed by floating-ui while it's open.

```sh
npm install @floating-ui/dom
```

```tsx
import { autoUpdate, computePosition, flip, offset, shift } from '@floating-ui/dom';
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
          // floating-ui sets `left` and `top`
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
                }).then(({ x, y }) => Object.assign(popover.style, { left: `${x}px`, top: `${y}px` }));
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
});
```

## Roadmap

- [x] Add support for additional locales.
- [x] range date selection
- [x] min / max and disabled dates
- [x] forms: a hidden input with the value
- [ ] a text input with a date format
- [ ] multiple selection
- [ ] month and year navigation
- [ ] Custom date ranges (last 7 days, next 30d)
- [ ] headless version
- [ ] Fancy animations (styled version)
- [ ] website docs: easy to read, understand and implement.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the development setup and how to run the tests.
