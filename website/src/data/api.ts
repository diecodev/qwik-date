// The props and the data attributes of the Calendar: the API page, the search and llms-full.txt read them

export type Group =
  | 'selection'
  | 'limits'
  | 'display'
  | 'locale'
  | 'forms'
  | 'styling'
  | 'parts'

export type Prop = {
  name: string
  group: Group
  type: string
  default: string
  /** `new` in 2.x, or `renamed` from 1.x */
  badge?: 'new' | 'renamed'
  /** the name in 1.x */
  was?: string
  description: string
  example: string
}

export const PROPS: Prop[] = [
  {
    name: 'mode',
    group: 'selection',
    type: "'single' | 'range' | 'multiple'",
    default: "'single'",
    badge: 'new',
    description:
      'What a click selects: one day, a start and an end, or any days. It sets the type of `value`, `bind:value` and `onChange$`.',
    example: '<Calendar mode="range" bind:value={range} />',
  },
  {
    name: 'value',
    group: 'selection',
    type: 'LocalDate | DateRange | LocalDate[] | null',
    default: 'null',
    badge: 'renamed',
    was: 'date',
    description:
      'The selected value, selected from the start: a day, a `DateRange` with `mode="range"`, or the days with `mode="multiple"` (`[]` by default). The calendar opens on its month, or on today\'s without one.',
    example: '<Calendar value="%today%" />',
  },
  {
    name: 'bind:value',
    group: 'selection',
    type: 'Signal<…>',
    default: '–',
    badge: 'renamed',
    was: 'bind:date',
    description:
      "A signal of the value's type, kept in sync in both directions: write to it and the calendar shows that month.",
    example:
      'const date = useSignal<LocalDate | null>(null);\n\n<Calendar bind:value={date} />',
  },
  {
    name: 'onChange$',
    group: 'selection',
    type: '(value) => void',
    default: '–',
    badge: 'renamed',
    was: 'onDateChange$',
    description:
      'Called with the new value on every choice. In a range, also after the first day, with `end: null`; with `mode="multiple"`, on every mark and unmark, with the days in order.',
    example: '<Calendar onChange$={(value) => console.log(value)} />',
  },
  {
    name: 'min, max',
    group: 'limits',
    type: 'LocalDate',
    default: '–',
    badge: 'new',
    description:
      'The first and the last day that can be chosen. The month buttons stop at their months, and the months and years views disable the ones past them.',
    example: '<Calendar min="%today%" max="%max%" />',
  },
  {
    name: 'disabledDates',
    group: 'limits',
    type: 'readonly LocalDate[]',
    default: '–',
    badge: 'new',
    description:
      "Days that can't be chosen. The keyboard skips them, and a range can't cross them: it ends right before the first one, as with every day ruled out.",
    example: "<Calendar disabledDates={['%christmas%', '%new-year%']} />",
  },
  {
    name: 'disabledWeekdays',
    group: 'limits',
    type: 'readonly WeekDay[]',
    default: '–',
    badge: 'new',
    description:
      "Weekdays that can't be chosen, `0` for Sunday: `[0, 6]` disables the weekends.",
    example: '<Calendar disabledWeekdays={[0, 6]} />',
  },
  {
    name: 'months',
    group: 'display',
    type: 'number',
    default: '1',
    badge: 'new',
    description:
      'How many months show side by side, with one Tab stop for all of them. The buttons move one month, and they stack on narrow screens.',
    example: '<Calendar mode="range" months={2} />',
  },
  {
    name: 'fullWeeks',
    group: 'display',
    type: 'boolean',
    default: 'false',
    description:
      'Fills the first and the last week with the days of the months around, disabled, and shows six weeks in every month.',
    example: '<Calendar fullWeeks />',
  },
  {
    name: 'showWeekNumber',
    group: 'display',
    type: 'boolean',
    default: 'false',
    description: 'Adds a column with the ISO week number of each row.',
    example: '<Calendar showWeekNumber />',
  },
  {
    name: 'showDaysOfWeek',
    group: 'display',
    type: 'boolean',
    default: 'true',
    description: 'Shows the weekday names over the grid.',
    example: '<Calendar showDaysOfWeek={false} />',
  },
  {
    name: 'prevIcon, nextIcon',
    group: 'display',
    type: "Component<PropsOf<'svg'>>",
    default: 'chevrons',
    badge: 'renamed',
    was: 'iconLeft, iconRight',
    description:
      'Components for the icons of the month buttons. They get `iconProps`, and the library styles turn them around in right-to-left layouts.',
    example: '<Calendar prevIcon={ArrowLeft} nextIcon={ArrowRight} />',
  },
  {
    name: 'locale',
    group: 'locale',
    type: 'Locale',
    default: "'en'",
    description:
      "`'en'`, `'es'`, or any BCP 47 tag (`'fr-FR'`). Other languages take their month and weekday names from `Intl`, and need `labels`.",
    example: '<Calendar locale="es" />',
  },
  {
    name: 'labels',
    group: 'locale',
    type: 'Labels | Partial<Labels>',
    default: '–',
    badge: 'new',
    description:
      "The texts `Intl` can't give: the calendar's name and the labels of the buttons. With `en` and `es` they're built in, and `labels` overrides some of them; any other locale needs all of them, and TypeScript asks for them.",
    example: '<Calendar locale="fr-FR" labels={fr} weekStartsOn={1} />',
  },
  {
    name: 'weekStartsOn',
    group: 'locale',
    type: 'WeekDay',
    default: '0',
    badge: 'new',
    description: 'The first column, from `0` (Sunday) to `6`.',
    example: '<Calendar weekStartsOn={1} />',
  },
  {
    name: 'name',
    group: 'forms',
    type: 'string',
    default: '–',
    badge: 'new',
    description:
      'Submits the value with the form around the calendar, in hidden inputs: `name` for a day (empty without one), `name[start]` and `name[end]` for a range, a `name[]` per day for multiple (nothing without days).',
    example: '<form>\n  <Calendar name="due" />\n</form>',
  },
  {
    name: 'autoFocus',
    group: 'forms',
    type: 'boolean',
    default: 'false',
    badge: 'new',
    description:
      'Focuses the day where Tab enters every time the calendar shows up: on load, or when a popover, dialog or details around it opens. Without it, the calendar never takes the focus.',
    example: "<Calendar autoFocus containerProps={{ popover: 'auto' }} />",
  },
  {
    name: 'theme',
    group: 'styling',
    type: 'Theme | Signal<Theme>',
    default: "'light'",
    badge: 'new',
    description:
      "`'light'`, `'dark'` or `'auto'`, which follows `prefers-color-scheme` with CSS only. A signal changes it at runtime.",
    example: '<Calendar theme="auto" />',
  },
  {
    name: 'unstyled',
    group: 'styling',
    type: 'boolean',
    default: 'false',
    badge: 'renamed',
    was: 'unStyled',
    description:
      'Leaves the calendar without the library styles: style it through the props of its parts and its data attributes.',
    example: '<Calendar unstyled />',
  },
  {
    name: 'containerProps',
    group: 'parts',
    type: "Omit<PropsOf<'div'>, 'onChange$'>",
    default: '{}',
    description:
      'The root, a `<div role="group">`. Its `aria-label` names the calendar, followed by the selection. No DOM `onChange$`: the calendar\'s is the value\'s.',
    example:
      "<Calendar containerProps={{ class: 'calendar', 'aria-label': 'Due date' }} />",
  },
  {
    name: 'headerProps',
    group: 'parts',
    type: "PropsOf<'header'>",
    default: '{}',
    description:
      "The `<header>` with the month buttons and the title. With `months`, each month's header, around its title.",
    example: "<Calendar headerProps={{ class: 'header' }} />",
  },
  {
    name: 'navButtonProps',
    group: 'parts',
    type: "PropsOf<'button'>",
    default: '{}',
    badge: 'renamed',
    was: 'actionButtonProps',
    description:
      'Both month buttons. `prevButtonProps` and `nextButtonProps` win over it, and an `onClick$` in both runs both.',
    example: "<Calendar navButtonProps={{ class: 'nav' }} />",
  },
  {
    name: 'prevButtonProps, nextButtonProps',
    group: 'parts',
    type: "PropsOf<'button'>",
    default: '{}',
    badge: 'renamed',
    was: 'actionLeftProps, actionRightProps',
    description: 'The previous and the next button, one each.',
    example: "<Calendar prevButtonProps={{ title: 'Previous' }} />",
  },
  {
    name: 'titleProps',
    group: 'parts',
    type: "PropsOf<'div'>",
    default: '{}',
    description:
      'The title, the live region that announces each month and view. Its `id` names the first grid.',
    example: "<Calendar titleProps={{ class: 'title' }} />",
  },
  {
    name: 'iconProps',
    group: 'parts',
    type: "PropsOf<'svg'>",
    default: '{}',
    description:
      'Both icons: the chevrons, or `prevIcon` and `nextIcon`. The chevrons are `1em` wide, so the text around sizes them.',
    example: "<Calendar iconProps={{ 'stroke-width': 2 }} />",
  },
  {
    name: 'calendarProps',
    group: 'parts',
    type: "PropsOf<'table'>",
    default: '{}',
    description: 'Each days grid, a `<table role="grid">`.',
    example: "<Calendar calendarProps={{ class: 'grid' }} />",
  },
  {
    name: 'theadProps',
    group: 'parts',
    type: "PropsOf<'thead'>",
    default: '{}',
    description: 'The head of the grid, with the weekday names.',
    example: "<Calendar theadProps={{ class: 'weekdays' }} />",
  },
  {
    name: 'theadRowProps',
    group: 'parts',
    type: "PropsOf<'tr'>",
    default: '{}',
    description: 'The row of the weekday names.',
    example: "<Calendar theadRowProps={{ class: 'weekdays-row' }} />",
  },
  {
    name: 'headerCellProps',
    group: 'parts',
    type: "PropsOf<'th'>",
    default: '{}',
    description: 'Each weekday name.',
    example: "<Calendar headerCellProps={{ class: 'weekday' }} />",
  },
  {
    name: 'tbodyProps',
    group: 'parts',
    type: "PropsOf<'tbody'>",
    default: '{}',
    description: 'The body of the grid, with the weeks.',
    example: "<Calendar tbodyProps={{ class: 'weeks' }} />",
  },
  {
    name: 'tbodyRowProps',
    group: 'parts',
    type: "PropsOf<'tr'>",
    default: '{}',
    description:
      'Each week. Rows get `data-direction` after a move, to animate them.',
    example: "<Calendar tbodyRowProps={{ class: 'week' }} />",
  },
  {
    name: 'cellProps',
    group: 'parts',
    type: "PropsOf<'td'>",
    default: '{}',
    description:
      'The cell around each day, with `aria-selected` and `aria-disabled`.',
    example: "<Calendar cellProps={{ class: 'cell' }} />",
  },
  {
    name: 'dayButtonProps',
    group: 'parts',
    type: "PropsOf<'button'>",
    default: '{}',
    description:
      'Each day button: style its states by the data attributes below.',
    example: "<Calendar dayButtonProps={{ class: 'day' }} />",
  },
  {
    name: 'weekNumberProps',
    group: 'parts',
    type: "PropsOf<'td'>",
    default: '{}',
    description: 'Each week number cell, with `showWeekNumber`.',
    example:
      "<Calendar showWeekNumber weekNumberProps={{ class: 'week-number' }} />",
  },
]

export const GROUPS: { id: Group; label: string }[] = [
  { id: 'selection', label: 'selection' },
  { id: 'limits', label: 'limits' },
  { id: 'display', label: 'display' },
  { id: 'locale', label: 'locale' },
  { id: 'forms', label: 'forms & focus' },
  { id: 'styling', label: 'styling' },
  { id: 'parts', label: 'props of each part' },
]

export const ATTRIBUTES = [
  [
    'data-qwik-date',
    'root',
    "Always, on the styled Calendar. The headless root doesn't have it.",
  ],
  ['data-theme', 'root', 'light, dark or auto, from the theme prop.'],
  ['data-unstyled', 'root', 'With unstyled.'],
  ['data-view', 'root', 'days, months or years: the view on show.'],
  [
    'data-direction',
    'root, rows',
    'next or prev, after each move. None on load.',
  ],
  ['data-value', 'day', 'The day, as YYYY-MM-DD.'],
  ['data-selected', 'day', 'The selected day, or an end of the range.'],
  ['data-range-start', 'day', 'The first day of the range.'],
  ['data-range-end', 'day', 'The last day of the range.'],
  ['data-in-range', 'day', 'The days between the ends.'],
  [
    'data-preview',
    'day',
    'The range a click would make, while the range has no end.',
  ],
  ['data-unavailable', 'day', 'Ruled out by min, max or the disabled days.'],
  ['aria-current="date"', 'day', 'Today.'],
  ['disabled', 'day', "Can't be chosen."],
  ['data-period', 'table', 'The months and the years grids.'],
  [
    'data-month, data-year',
    'month, year',
    "The cell's month (%month%) or year.",
  ],
]

/** The anchor of a prop's row: `#prop-mode`, `#prop-min` for `min, max`. */
export const propAnchor = (name: string) =>
  `prop-${name
    .split(',')[0]
    .replace(/[^a-z0-9]+/gi, '-')
    .toLowerCase()}`
