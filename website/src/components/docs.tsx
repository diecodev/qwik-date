import { component$ } from '@builder.io/qwik'

const calendarInlinePropsInfo = [
  {
    name: 'date',
    description: 'Default date to be used in the calendar',
    defaultValue: 'today',
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
    name: 'iconLeft',
    description: 'Icon to display on the left side of the calendar',
    defaultValue: 'undefined',
  },
  {
    name: 'iconRight',
    description: 'Icon to display on the right side of the calendar',
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
    name: 'actionButtonProps',
    description: 'Props for action buttons in the calendar',
    defaultValue: '-',
  },
  {
    name: 'actionLeftProps',
    description: 'Props for the left action',
    defaultValue: '-',
  },
  {
    name: 'actionRightProps',
    description: 'Props for the right action',
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
    name: 'onDateChange$',
    description:
      'Callback function triggered when the date changes in the calendar',
    defaultValue: 'undefined',
  },
  {
    name: 'unStyled',
    description: 'Disables default styling',
    defaultValue: 'false',
  },
  {
    name: 'bind:date',
    description: 'Signal with the default date',
    defaultValue: 'undefined',
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
