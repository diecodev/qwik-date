// The headless parts and what useCalendar() returns: the Headless page, the search and llms-full.txt read them

export const PARTS = [
  [
    'Calendar.Root',
    '<div role="group">',
    'Takes the options of the `Calendar`, all but the styling ones: `mode`, `value`, `bind:value`, `onChange$`, `min`, `max`, `months`, `name`, `autoFocus`, `locale`, `labels`… Its name is its `aria-label` (`labels.calendar` by default) followed by the selection. With `name`, it adds the hidden inputs.',
  ],
  [
    'Calendar.PrevButton, Calendar.NextButton',
    '<button>',
    'Change the month, a year or twelve years, as the view shows, with the matching label, and `aria-disabled` at `min` and `max`. The icon goes inside.',
  ],
  [
    'Calendar.Title',
    '<div aria-live="polite">',
    'The title of the view: "August 2024", "2024" or "2016 – 2027". It names the grid. Its button shows the months, then the years: `button={false}` for a title without it, `buttonProps` for the button. With `months`, `offset` is its month.',
  ],
  [
    'Calendar.Grid',
    '<table role="grid">',
    'The keyboard: arrows, Home and End, PageUp and PageDown, Enter and Space. With `months`, `offset` is its month, and its `GridBody` shows that month.',
  ],
  [
    'Calendar.GridHead',
    '<thead>',
    'The weekday names. `rowProps` and `cellProps` go to its `<tr>` and its `<th>`s.',
  ],
  [
    'Calendar.GridBody',
    '<tbody>',
    'A row per week and a button per day. `rowProps`, `cellProps`, `dayProps` and `weekNumberProps` go to every `<tr>`, `<td>`, day `<button>` and week number cell.',
  ],
  [
    'Calendar.MonthGrid, Calendar.YearGrid',
    '<table role="grid">',
    'The months of a year and twelve years, only in their view (the days grid, only in its own). `rowProps`, `cellProps` and `buttonProps`. The buttons have `data-month` or `data-year`, `data-selected`, `aria-current="date"` and `disabled`.',
  ],
  [
    'Calendar.Cell, Calendar.Day',
    '<td>, <button>',
    'For rows of your own: they keep the attributes of each day, the choice and the keyboard.',
  ],
]

export const STATE = [
  [
    'value',
    'The selected value, a signal you can write to: the calendar shows the month of a value written from outside.',
  ],
  ['mode', 'The mode, as the root got it.'],
  [
    'preview',
    'The range a choice of the day under the pointer or the focus would make, while a range has no end, or `null`.',
  ],
  [
    'direction',
    "`'next'` or `'prev'` after each move, `null` before the first one, as the root's `data-direction`.",
  ],
  ['month', 'The month on show, `{ year, month }`.'],
  [
    'view, title',
    "`'days'`, `'months'` or `'years'`, and the title of that view.",
  ],
  [
    'grids',
    'The months on show, each with its `title` and its `weeks`: `{ number, days }`, with a `CalendarDay` per day (`null` for the empty cells): `date`, `label`, `outside`, `unavailable`, `disabled`, `today`, `selected`, `rangeStart`, `rangeEnd`, `inRange`, `preview` and `tabbable`.',
  ],
  [
    'monthCells, yearCells',
    'The cells of the months and the years views: `year`, `month`, `text`, `label`, `disabled`, `selected`, `today` and `tabbable`.',
  ],
  ['today, tabDay', 'Today, and the day where Tab enters the grid.'],
  [
    'canGoBack, canGoForward',
    'Whether the view can move, within `min` and `max`.',
  ],
  [
    'weekdays, labels',
    'The weekday names in column order, `{ long, short }`, and the texts of the locale.',
  ],
  ['showWeekNumber, titleId', 'The option, and the id of the first title.'],
  [
    'select$(day)',
    "Chooses a day, as a click on it does. A day that can't be chosen is ignored.",
  ],
  [
    'setPreview$(day)',
    'Previews the range up to a day, as the pointer on it does: `null` for none.',
  ],
  [
    'prev$(), next$()',
    'A month, a year or twelve years away, as the view shows.',
  ],
  ['setView$(view)', 'What the title does.'],
  [
    'chooseMonth$(year, month), chooseYear$(year)',
    'What the month and year buttons do.',
  ],
]
