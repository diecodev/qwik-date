# qwik-date

**Qwik calendar, simple integration**

`qwik-date` is an opinionated calendar component designed for the Qwik framework. It offers two main versions: an `inline` calendar and a `popup` date picker, providing flexibility in how you integrate it into your applications.

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

#### Props

- `value`: The selected day, or `null` for none (default: `null`). The calendar opens on its month, or on today's month without one. Today is marked with `aria-current="date"`.
- `bind:value`: A `Signal<LocalDate | null>` kept in sync with the selected day, in both directions.
- `onChange$`: Called with the day the user chooses.
- `fullWeeks`: If true, shows full weeks (default: false).
- `locale`: Locale for the calendar (default: 'en').
- `showWeekNumber`: If true, shows week numbers (default: false).
- `showDaysOfWeek`: If true, shows days of the week ~Mo, Tu, We, etc.~ (default: true).
- `prevIcon`, `nextIcon`: Custom icons for the previous and next month buttons.
- `containerProps`, `headerProps`, `navButtonProps` (both month buttons), `prevButtonProps`, `nextButtonProps`, `calendarProps`, `theadProps`, `tbodyProps`, `theadRowProps`, `tbodyRowProps`, `headerCellProps`, `cellProps`, `dayButtonProps`, `iconProps`, `titleProps`, `weekNumberProps`: Custom props for various parts of the component.
- `unstyled`: If true, removes default styling (default: false).
- `theme`: `'light'` (default), `'dark'`, or `'auto'` to follow the operating system's color scheme. It also accepts a `Signal<Theme>` to change it at runtime.

#### Theme

```tsx
import { component$, useSignal } from '@qwik.dev/core';
import { Calendar, type Theme } from 'qwik-date';

export default component$(() => {
  const theme = useSignal<Theme>('auto');

  return <Calendar theme={theme} />;
});
```

`auto` is resolved with CSS (`prefers-color-scheme`), so it ships no JavaScript. The `DatePicker` accepts the same prop.

### Popup Date Picker

```ts
import { DatePicker } from 'qwik-date';
```

#### Popup Date Picker Example

Here's a basic example of how to use the popup date picker:

```tsx
import { component$, useSignal } from '@qwik.dev/core';
import { DatePicker, type LocalDate } from 'qwik-date';

export default component$(() => {
  const date = useSignal<LocalDate | null>(null);

  return <DatePicker bind:value={date} placeholder="Pick a date" />;
});
```

#### Props

- `triggerProps`: Custom props for the trigger button.
- `placeholder`: What the trigger shows without a value (default: "Select a date"). With a value it shows the date, like "Aug 15, 2024".
- `closeOnSelect`: Close the popup once a day is chosen; the focus goes back to the trigger (default: true).
- `triggerIcon`: Custom icon for the trigger button.
- All other props from `Calendar` can also be used.

## Roadmap

- [ ] Add support for additional locales.
- [ ] range date selection
- [ ] month and year navigation
- [ ] Custom date ranges (last 7 days, next 30d)
- [ ] Fancy animations (styled version)
- [ ] website docs: easy to read, understand and implement.
## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the development setup and how to run the tests.
