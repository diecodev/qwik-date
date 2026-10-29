import { component$, useSignal, useTask$ } from '@qwik.dev/core'
import { Link } from '@qwik.dev/router'
import type { DateRange, LocalDate } from 'qwik-date/headless'
import { Code } from '~/components/code'
import { addDays, useToday } from '~/components/dates'
import { H2, Preview, md } from '~/components/docs'
import { EventsDemo, HeadlessDemo } from '~/components/headless-demo'
import { docHead } from '~/components/seo'
import { Toc } from '~/components/toc'

const STYLED = `import { component$, useSignal } from '@qwik.dev/core';
import { Calendar, type DateRange } from 'qwik-date/headless';

export default component$(() => {
  const range = useSignal<DateRange | null>(null);

  return (
    <Calendar.Root mode="range" bind:value={range} class="calendar">
      <header>
        <Calendar.PrevButton>‹</Calendar.PrevButton>
        <Calendar.Title />
        <Calendar.NextButton>›</Calendar.NextButton>
      </header>
      <Calendar.Grid>
        <Calendar.GridHead cellProps={{ class: 'weekday' }} />
        <Calendar.GridBody dayProps={{ class: 'day' }} />
      </Calendar.Grid>
      <Calendar.MonthGrid />
      <Calendar.YearGrid />
    </Calendar.Root>
  );
});`

const STYLED_CSS = `.day { width: 36px; height: 36px; border-radius: 4px; }
.day[aria-current='date'] { box-shadow: inset 0 -2px 0 #2563eb; }
.day[data-in-range] { background: #2563eb14; color: #2563eb; }
.day[data-selected] { background: #2563eb; color: white; }
.day:disabled { opacity: 0.35; }`

const IMPORT = `import { Calendar, useCalendar } from 'qwik-date/headless';`

const ANATOMY = `<Calendar.Root>
  <Calendar.PrevButton />
  <Calendar.Title />
  <Calendar.NextButton />
  <Calendar.Grid>
    <Calendar.GridHead />
    <Calendar.GridBody />
  </Calendar.Grid>
  <Calendar.MonthGrid />
  <Calendar.YearGrid />
</Calendar.Root>`

const TAILWIND = `<Calendar.GridBody
  dayProps={{
    class: 'size-9 rounded data-[selected]:bg-black data-[selected]:text-white data-[in-range]:bg-black/5',
  }}
/>`

const EVENTS = `import { component$ } from '@qwik.dev/core';
import { Calendar, type LocalDate, useCalendar } from 'qwik-date/headless';

const EventDays = component$<{ events: LocalDate[] }>(({ events }) => {
  const calendar = useCalendar();

  return (
    <tbody>
      {calendar.grids.value[0].weeks.map((week) => (
        <tr key={week.number}>
          {week.days.map((day, i) => (
            <Calendar.Cell key={day?.date ?? i} day={day?.date}>
              {day && (
                <Calendar.Day day={day.date}>
                  {day.date.slice(8)}
                  {events.includes(day.date) && <span class="dot" />}
                </Calendar.Day>
              )}
            </Calendar.Cell>
          ))}
        </tr>
      ))}
    </tbody>
  );
});

<Calendar.Root bind:value={date}>
  <Calendar.Title />
  <Calendar.Grid>
    <Calendar.GridHead />
    <EventDays events={%events%} />
  </Calendar.Grid>
</Calendar.Root>;`

const PARTS = [
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

const STATE = [
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

export default component$(() => {
  const today = useToday()
  const range = useSignal<DateRange | null>(null)
  const date = useSignal<LocalDate | null>(null)
  const events = useSignal<LocalDate[]>([])

  // the examples start on today, and follow the visitor's day
  useTask$(({ track }) => {
    const day = track(today)
    range.value = { start: day, end: addDays(day, 4) }
    events.value = [addDays(day, 1), addDays(day, 4), addDays(day, 11)]
  })

  return (
    <div class="page">
      <article class="article">
        <h1 class="h1">headless</h1>
        <p class="lead">
          The same calendar in parts. The keyboard, the state and the
          accessibility come with them; the markup and the looks are yours.
        </p>

        <Preview code={STYLED}>
          <HeadlessDemo bind:value={range} />
          <p class="cap">
            the parts, styled by this site: no qwik-date stylesheet
          </p>
        </Preview>
        <Code code={STYLED_CSS} />
        <p class="p">
          The styled <code class="c">Calendar</code> is these parts plus a
          stylesheet. Use them as in <a href="https://qwikui.com">Qwik UI</a> or{' '}
          <a href="https://www.npmjs.com/package/@qds.dev/ui">QDS</a>: put them
          together and style them by their attributes.
        </p>

        <H2 id="import">import</H2>
        <Code code={IMPORT} />
        <p class="p">
          The same package, another entry point. It also exports the types and{' '}
          <code class="c">formatDate</code>.
        </p>

        <H2 id="anatomy">anatomy</H2>
        <Code code={ANATOMY} />

        <H2 id="parts">parts</H2>
        <div class="scroll">
          <div style="min-width: 560px">
            <div class="attr attr-h">
              <span>part</span>
              <span>renders</span>
              <span>what it does</span>
            </div>
            {PARTS.map(([name, renders, does]) => (
              <div key={name} class="attr">
                <code class="attr-n">{name}</code>
                <code class="mono" style="font-size: 12px; color: var(--muted)">
                  {renders}
                </code>
                <span style="color: var(--fg2)">{md(does)}</span>
              </div>
            ))}
          </div>
        </div>

        <H2 id="styling">styling</H2>
        <p class="p">
          Style the days by their attributes, the same ones the styled{' '}
          <code class="c">Calendar</code> uses:{' '}
          <code class="c">data-selected</code>,{' '}
          <code class="c">data-in-range</code>,{' '}
          <code class="c">data-preview</code>,{' '}
          <code class="c">data-unavailable</code>,{' '}
          <code class="c">aria-current="date"</code> and{' '}
          <code class="c">disabled</code>. The whole list is in the{' '}
          <Link href="/calendar/#data-attributes">API of the Calendar</Link>.
          With Tailwind:
        </p>
        <Code code={TAILWIND} />
        <p class="p">
          The root has no <code class="c">data-qwik-date</code>, so the
          stylesheet of a styled <code class="c">Calendar</code> on the same
          page leaves it alone.
        </p>

        <H2 id="rows">rows of your own</H2>
        <p class="p">
          For days with content of your own, a price or a dot for the days with
          events, render the body yourself. <code class="c">useCalendar()</code>{' '}
          gives the state of the root around, and{' '}
          <code class="c">Calendar.Cell</code> and{' '}
          <code class="c">Calendar.Day</code> keep each day's attributes, the
          choice and the keyboard. Call it in a component inside the root:
          Qwik's context only reaches the root's descendants.
        </p>
        <Preview
          code={EVENTS.replace(
            '%events%',
            `[${events.value.map((day) => `'${day}'`).join(', ')}]`,
          )}
        >
          <EventsDemo bind:value={date} events={events.value} />
          <p class="cap">a dot under the days with events</p>
        </Preview>

        <H2 id="use-calendar">useCalendar()</H2>
        <p class="p">
          It returns signals and QRLs only, so handlers can use it. The value
          takes the type of the mode:{' '}
          <code class="c">{'useCalendar<DateRange>()'}</code>.
        </p>
        <div style="margin-top: 12px">
          {STATE.map(([name, what]) => (
            <div key={name} class="ref">
              <code>{name}</code>
              <span>{md(what)}</span>
            </div>
          ))}
        </div>

        <div class="pager">
          <Link class="pn" href="/date-picker/">
            <small>← previous</small>Date Picker
          </Link>
          <Link class="pn" href="/forms/" style="text-align: right">
            <small>next →</small>Forms
          </Link>
        </div>
      </article>

      <Toc
        items={[
          { id: 'import', label: 'Import' },
          { id: 'anatomy', label: 'Anatomy' },
          { id: 'parts', label: 'Parts' },
          { id: 'styling', label: 'Styling' },
          { id: 'rows', label: 'Rows of your own' },
          { id: 'use-calendar', label: 'useCalendar()' },
        ]}
      />
    </div>
  )
})

export const head = docHead(
  'Headless',
  'qwik-date/headless: the calendar in parts, with the keyboard, the state and the accessibility, styled by you.',
  '/headless/',
)
