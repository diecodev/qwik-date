# qwik-date

**Qwik calendar, simple integration**

`qwik-date` is an opinionated calendar component designed for the Qwik framework. It offers two main versions: an `inline` calendar and a `popup` date picker, providing flexibility in how you integrate it into your applications.

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

The inline calendar can be imported in two ways:

```ts
import { Calendar } from 'qwik-date';
import { CalendarInline } from 'qwik-date/inline';
```

#### Inline Calendar Example

Here's a basic example of how to use the inline calendar:

```tsx
import { component$, useSignal } from '@builder.io/qwik';
import { CalendarInline } from 'qwik-date/inline';

export default component$(() => {
  const date = useSignal('2023-07-23');
  
  return (
    <CalendarInline 
      date={date.value} 
      onDateChange$={(newDate) => console.log({ newDate })} 
    />
  );
});
```

#### Props

- `date`: Initial date to display (default: current date).
- `fullWeeks`: If true, shows full weeks (default: false).
- `locale`: Locale for the calendar (default: 'en').
- `showWeekNumber`: If true, shows week numbers (default: false).
- `showDaysOfWeek`: If true, shows days of the week ~Mo, Tu, We, etc.~ (default: true).
- `iconLeft`, `iconRight`: Custom icons for navigation buttons.
- `containerProps`, `headerProps`, `actionButtonProps`, `actionLeftProps`, `actionRightProps`, `calendarProps`, `theadProps`, `tbodyProps`, `theadRowProps`, `tbodyRowProps`, `headerCellProps`, `cellProps`, `dayButtonProps`, `iconProps`, `titleProps`, `weekNumberProps`: Custom props for various parts of the component.
- `onDateChange$`: Callback for when the date changes.
- `unStyled`: If true, removes default styling (default: false).

### Popup Date Picker

The popup date picker can be imported in two ways:

```ts
import { DatePicker } from 'qwik-date';
import { DatePicker } from 'qwik-date/picker';
```

#### Popup Date Picker Example

Here's a basic example of how to use the popup date picker:

```tsx
import { component$, useSignal } from '@builder.io/qwik';
import { DatePicker } from 'qwik-date/picker';

export default component$(() => {
  const date = useSignal('2023-07-23');
  
  return (
    <DatePicker 
      date={date.value} 
      onDateChange$={(newDate) => console.log({ newDate })}
      triggerLabel="Select Date"
    />
  );
});
```

#### Props

- `triggerProps`: Custom props for the trigger button.
- `triggerLabel`: Label for the trigger button.
- `triggerIcon`: Custom icon for the trigger button.
- `mode`: Mode of the date picker (`'popup'` or `'inline'`, default: `'popup'`).
- All other props from `CalendarInline` can also be used.

## Roadmap

- [ ] Add support for additional locales.
- [ ] range date selection
- [ ] month and year navigation
- [ ] Custom date ranges (last 7 days, next 30d)
- [ ] Fancy animations (styled version)
- [ ] website docs: easy to read, understand and implement.