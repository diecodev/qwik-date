import { component$ } from '@qwik.dev/core'

const calendarInlinePropsInfo = [
  {
    name: 'value',
    description:
      "The selected day as 'YYYY-MM-DD', or null for none. Without one the calendar opens on today's month",
    defaultValue: 'null',
  },
  {
    name: 'bind:value',
    description:
      'Signal kept in sync with the selected day, in both directions',
    defaultValue: 'undefined',
  },
  {
    name: 'fullWeeks',
    description: 'Displays full weeks in the calendar',
    defaultValue: 'false',
  },
  {
    name: 'locale',
    description: 'Locale and regional settings for the calendar',
    defaultValue: "'en'",
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
    description: 'Called with the day the user chooses',
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

const datePickerProps = [
  {
    name: 'triggerProps',
    description: 'Props to be passed to the trigger button',
    defaultValue: 'undefined',
  },
  {
    name: 'triggerIcon',
    description: 'Icon component to be displayed in the trigger button',
    defaultValue: 'undefined',
  },
  {
    name: 'triggerLabel',
    description: 'Label for the trigger button',
    defaultValue: 'undefined',
  },
]

export const Docs = component$(() => {
  return (
    <section class="space-y-3">
      <h3 class="text-center font-medium">
        {'> '}API Reference{' <'}
      </h3>
      <h4 class="text-center font-medium">~Inline mode~</h4>
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
        <h4 class="text-center font-medium">~Popup mode~</h4>
        <p class="text-balance text-center text-neutral-600 text-sm">
          Got the same props as the inline mode, but also accepts the following
          props:
        </p>
      </div>
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
            {datePickerProps.map((prop, index) => (
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
    </section>
  )
})
