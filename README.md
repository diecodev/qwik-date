# qwik-date

**Calendar and date picker component for Qwik.**

Pick one day, a range or several days, with the keyboard, for screen readers and in any locale. Send it with a form, theme it, or build your own from its headless parts. No runtime dependencies.

**[Docs](https://qwik-date.dieco.dev)** · [Changelog](https://qwik-date.dieco.dev/changelog/) · [npm](https://www.npmjs.com/package/qwik-date)

## Install

qwik-date 2 is in beta, for Qwik v2 (`@qwik.dev/core`):

```sh
npm install -D -E qwik-date@beta
```

Keep `@beta`: until 2.0 is stable, `qwik-date` without a tag installs 1.0.0, which is for Qwik v1. On Qwik v1 (`@builder.io/qwik`), install `qwik-date@1` and read [its docs](https://qwik-date.dieco.dev/v1/).

## Usage

```tsx
import { component$, useSignal } from '@qwik.dev/core';
import { Calendar, type LocalDate } from 'qwik-date';

export default component$(() => {
  const date = useSignal<LocalDate | null>(null);

  return <Calendar bind:value={date} />;
});
```

Dates are `'YYYY-MM-DD'` strings, without time or timezone. `mode="range"` selects a start and an end, and `mode="multiple"` several days.

## Docs

- [Calendar](https://qwik-date.dieco.dev/calendar/): the modes, months side by side, limits, display options, and the API (props, data attributes, keyboard, types).
- [Date picker](https://qwik-date.dieco.dev/date-picker/): the calendar in a popover, with a trigger of your own.
- [Headless](https://qwik-date.dieco.dev/headless/): `qwik-date/headless`, the calendar in parts, and `useCalendar()`.
- Guides: [forms](https://qwik-date.dieco.dev/forms/), [localization](https://qwik-date.dieco.dev/localization/), [theming](https://qwik-date.dieco.dev/theming/), [animations](https://qwik-date.dieco.dev/animations/) and [accessibility](https://qwik-date.dieco.dev/accessibility/).
- For LLMs and agents: [llms.txt](https://qwik-date.dieco.dev/llms.txt) and [llms-full.txt](https://qwik-date.dieco.dev/llms-full.txt), every use case in one file.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the development setup and how to run the tests.
