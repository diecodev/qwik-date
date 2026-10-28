import { component$ } from '@qwik.dev/core'

const calendarInlinePropsInfo = [
  {
    name: 'mode',
    description:
      "'single' selects a day, 'range' a start and an end ({ start, end }), 'multiple' any days (an array, [] for none)",
    defaultValue: "'single'",
  },
  {
    name: 'value',
    description:
      "The selected day as 'YYYY-MM-DD' (a range, or an array of days with mode='multiple'), or null for none. Without one the calendar opens on today's month",
    defaultValue: 'null',
  },
  {
    name: 'bind:value',
    description:
      'Signal kept in sync with the selected day, in both directions',
    defaultValue: 'undefined',
  },
  {
    name: 'name',
    description:
      'Submits the value with the form, in a hidden input with this name (name[start] and name[end] for a range, a name[] per day with mode="multiple": an array for a Qwik Router action)',
    defaultValue: 'undefined',
  },
  {
    name: 'autoFocus',
    description:
      'Focuses the day where Tab enters the grid (the selected one, or the first that can be chosen) whenever the calendar shows up: on load, or when a popover, dialog or details around it opens',
    defaultValue: 'false',
  },
  {
    name: 'min / max',
    description: "First and last day that can be chosen ('YYYY-MM-DD')",
    defaultValue: 'undefined',
  },
  {
    name: 'disabledDates',
    description: "Days that can't be chosen",
    defaultValue: '[]',
  },
  {
    name: 'disabledWeekdays',
    description:
      "Weekdays that can't be chosen, 0 for Sunday ([0, 6]: weekends)",
    defaultValue: '[]',
  },
  {
    name: 'fullWeeks',
    description: 'Displays full weeks in the calendar',
    defaultValue: 'false',
  },
  {
    name: 'locale',
    description:
      "'en', 'es' or any BCP 47 language tag ('fr-FR'): month and weekday names come from Intl",
    defaultValue: "'en'",
  },
  {
    name: 'labels',
    description:
      'The texts Intl cannot give (calendar, previousMonth, nextMonth, previousYear, nextYear, previousYears, nextYears, selectedDate, selectedRange, selectedDates). Required for locales other than en and es',
    defaultValue: 'built in for en and es',
  },
  {
    name: 'weekStartsOn',
    description: 'First day of the week, from 0 (Sunday) to 6',
    defaultValue: '0',
  },
  {
    name: 'showWeekNumber',
    description: 'Displays the week number in the calendar',
    defaultValue: 'false',
  },
  {
    name: 'showDaysOfWeek',
    description: 'Displays the days of the week in the calendar',
    defaultValue: 'true',
  },
  {
    name: 'prevIcon',
    description: 'Icon of the previous month button',
    defaultValue: 'undefined',
  },
  {
    name: 'nextIcon',
    description: 'Icon of the next month button',
    defaultValue: 'undefined',
  },
  {
    name: 'containerProps',
    description: "Props to be passed to the calendar's container",
    defaultValue: '-',
  },
  {
    name: 'headerProps',
    description: "Props to be passed to the calendar's header",
    defaultValue: '-',
  },
  {
    name: 'navButtonProps',
    description: 'Props for both month buttons',
    defaultValue: '-',
  },
  {
    name: 'prevButtonProps',
    description: 'Props for the previous month button',
    defaultValue: '-',
  },
  {
    name: 'nextButtonProps',
    description: 'Props for the next month button',
    defaultValue: '-',
  },
  {
    name: 'calendarProps',
    description: "Props to be passed to the calendar's container",
    defaultValue: '-',
  },
  {
    name: 'theadProps',
    description: 'Props to be passed to the thead element of the calendar',
    defaultValue: '-',
  },
  {
    name: 'tbodyProps',
    description: 'Props to be passed to the tbody element of the calendar',
    defaultValue: '-',
  },
  {
    name: 'theadRowProps',
    description: 'Props to be passed to the rows of the thead',
    defaultValue: '-',
  },
  {
    name: 'tbodyRowProps',
    description: 'Props to be passed to the rows of the tbody',
    defaultValue: '-',
  },
  {
    name: 'headerCellProps',
    description: 'Props to be passed to the header cells',
    defaultValue: '-',
  },
  {
    name: 'cellProps',
    description: 'Props to be passed to the body cells of the calendar',
    defaultValue: '-',
  },
  {
    name: 'dayButtonProps',
    description: 'Props for the buttons representing each day in the calendar',
    defaultValue: '-',
  },
  {
    name: 'iconProps',
    description: 'Props to be passed to the icons of the calendar',
    defaultValue: '-',
  },
  {
    name: 'titleProps',
    description: "Props to be passed to the calendar's title",
    defaultValue: '-',
  },
  {
    name: 'weekNumberProps',
    description: 'Props to be passed to the week numbers in the calendar',
    defaultValue: '-',
  },
  {
    name: 'onChange$',
    description: 'Called with the new value (a day or a range) on every choice',
    defaultValue: 'undefined',
  },
  {
    name: 'unstyled',
    description: 'Disables default styling',
    defaultValue: 'false',
  },
  {
    name: 'theme',
    description:
      "Color theme: 'light', 'dark' or 'auto' (follows the OS). Also accepts a Signal",
    defaultValue: "'light'",
  },
] as const

const helpers = [
  {
    name: 'formatDate(value, locale?)',
    description:
      "A day as a trigger shows it: two-digit day, capitalized month, in any locale ('en' by default)",
    example: "'Aug 15, 2024'",
  },
  {
    name: 'formatDateRange(range, locale?)',
    description: 'A range as a trigger shows it, with … until it has an end',
    example: "'Aug 05, 2024 – Aug 12, 2024'",
  },
]

const headlessParts = [
  {
    name: 'Calendar.Root',
    description:
      'Takes the options (the Calendar props from mode to showWeekNumber) and is named after its aria-label and the selection. Adds the hidden inputs with name',
    renders: '<div role="group">',
  },
  {
    name: 'Calendar.PrevButton / NextButton',
    description:
      'Change the month, labelled, with aria-disabled at min and max. The icon goes inside',
    renders: '<button>',
  },
  {
    name: 'Calendar.Title',
    description:
      'The title of the view, announced when it changes: it names the grid. Its button shows the months of the year, then twelve years (button={false} without it)',
    renders: '<div aria-live>',
  },
  {
    name: 'Calendar.Grid',
    description:
      'The grid and its keyboard: arrows, Home/End, PageUp/PageDown, Enter, Space',
    renders: '<table role="grid">',
  },
  {
    name: 'Calendar.GridHead',
    description: 'The weekday names (rowProps, cellProps)',
    renders: '<thead>',
  },
  {
    name: 'Calendar.GridBody',
    description:
      'A row per week, a button per day (rowProps, cellProps, dayProps, weekNumberProps). Style the days by data-selected, data-in-range, data-unavailable, aria-current="date"…',
    renders: '<tbody>',
  },
  {
    name: 'Calendar.MonthGrid / YearGrid',
    description:
      'The months of a year and twelve years, only in their view: arrows, Enter or Space shows the days, Escape goes back (rowProps, cellProps, buttonProps)',
    renders: '<table role="grid">',
  },
  {
    name: 'Calendar.Cell / Day',
    description:
      'For rows of your own: a component inside the root reads useCalendar() (value, month, grids, today, tabDay, view, select$, prev$, next$, setView$, chooseMonth$…)',
    renders: '<td> / <button>',
  },
]

export const Docs = component$(() => {
  return (
    <section class="space-y-3">
      <h3 class="text-center font-medium">
        {'> '}API Reference{' <'}
      </h3>
      <h4 class="text-center font-medium">~Calendar~</h4>
      <div class="overflow-clip rounded-lg border ">
        <table class="min-w-full table-auto border-collapse text-sm">
          <thead class="bg-neutral-100">
            <tr>
              <th class="border-r border-b px-4 py-2 text-left">Prop</th>
              <th class="border-b px-4 py-2 text-left">Description</th>
              <th class="border-b border-l px-4 py-2 text-left">Default</th>
            </tr>
          </thead>
          <tbody>
            {calendarInlinePropsInfo.map((prop, index) => (
              <tr key={index} class="border-b text-neutral-700 last:border-b-0">
                <td class="border-r px-4 py-2 font-semibold">{prop.name}</td>
                <td class="px-4 py-2">{prop.description}</td>
                <td class="border-l px-2 py-1.5">
                  <span class="rounded-lg bg-neutral-100 px-2 py-0.5 font-mono text-xs">
                    {prop.defaultValue}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div class="!mt-12 space-y-2">
        <h4 class="text-center font-medium">~Formatting~</h4>
        <p class="text-balance text-center text-neutral-600 text-sm">
          Exported from qwik-date too, to write a trigger in one line:{' '}
          <code class="rounded bg-neutral-100 px-1 font-mono text-xs">
            {"date.value ? formatDate(date.value) : 'Pick a date'"}
          </code>
        </p>
      </div>
      <div class="overflow-clip rounded-lg border ">
        <table class="min-w-full table-auto border-collapse text-sm">
          <thead class="bg-neutral-100">
            <tr>
              <th class="border-r border-b px-4 py-2 text-left">Function</th>
              <th class="border-b px-4 py-2 text-left">Description</th>
              <th class="border-b border-l px-4 py-2 text-left">Returns</th>
            </tr>
          </thead>
          <tbody>
            {helpers.map((helper, index) => (
              <tr key={index} class="border-b text-neutral-700 last:border-b-0">
                <td class="border-r px-4 py-2 font-semibold">{helper.name}</td>
                <td class="px-4 py-2">{helper.description}</td>
                <td class="border-l px-2 py-1.5">
                  <span class="rounded-lg bg-neutral-100 px-2 py-0.5 font-mono text-xs">
                    {helper.example}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div class="!mt-12 space-y-2">
        <h4 class="text-center font-medium">~Headless~</h4>
        <p class="text-balance text-center text-neutral-600 text-sm">
          The calendar without its styles, in parts you style yourself:{' '}
          <code class="rounded bg-neutral-100 px-1 font-mono text-xs">
            {"import { Calendar, useCalendar } from 'qwik-date/headless'"}
          </code>
        </p>
      </div>
      <div class="overflow-clip rounded-lg border ">
        <table class="min-w-full table-auto border-collapse text-sm">
          <thead class="bg-neutral-100">
            <tr>
              <th class="border-r border-b px-4 py-2 text-left">Part</th>
              <th class="border-b px-4 py-2 text-left">Description</th>
              <th class="border-b border-l px-4 py-2 text-left">Renders</th>
            </tr>
          </thead>
          <tbody>
            {headlessParts.map((part, index) => (
              <tr key={index} class="border-b text-neutral-700 last:border-b-0">
                <td class="border-r px-4 py-2 font-semibold">{part.name}</td>
                <td class="px-4 py-2">{part.description}</td>
                <td class="border-l px-2 py-1.5">
                  <span class="rounded-lg bg-neutral-100 px-2 py-0.5 font-mono text-xs">
                    {part.renders}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
})
