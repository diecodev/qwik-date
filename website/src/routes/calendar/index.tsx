import { component$, useSignal, useStore, useTask$ } from '@qwik.dev/core'
import { Link } from '@qwik.dev/router'
import { Calendar, type DateRange, type LocalDate } from 'qwik-date'
import { ApiReference } from '~/components/api-reference'
import { Code } from '~/components/code'
import { addDays, fillDates, nextWeekday, useToday } from '~/components/dates'
import { H2, H3, Preview } from '~/components/docs'
import { docHead } from '~/components/seo'
import { Toc } from '~/components/toc'
import { pageAt } from '~/data/site'

const SINGLE = `import { component$, useSignal } from '@qwik.dev/core';
import { Calendar, type LocalDate } from 'qwik-date';

export default component$(() => {
  const date = useSignal<LocalDate | null>(null);

  return <Calendar bind:value={date} />;
});`

const USAGE = `import { Calendar } from 'qwik-date';

<Calendar bind:value={date} onChange$={(value) => console.log(value)} />`

const RANGE = `const range = useSignal<DateRange | null>(null);

<Calendar mode="range" bind:value={range} />`

const MULTIPLE = `const days = useSignal<LocalDate[]>([]);

<Calendar mode="multiple" bind:value={days} />`

const MONTHS = '<Calendar mode="range" months={2} bind:value={range} />'

const VIEWS = '<Calendar min="%today%" bind:value={date} />'

/** The code of the display options example, with the options it has on. */
const displayCode = (options: Record<string, boolean>) =>
  [
    '<Calendar',
    options.fullWeeks && '  fullWeeks',
    options.showWeekNumber && '  showWeekNumber',
    !options.showDaysOfWeek && '  showDaysOfWeek={false}',
    options.monday && '  weekStartsOn={1}',
    '  bind:value={date}',
    '/>',
  ]
    .filter(Boolean)
    .join('\n')

const DISABLED = `<Calendar
  min="%today%"
  disabledWeekdays={[0, 6]}
  bind:value={date}
/>`

/** A value as it would read in code: `'YYYY-MM-DD'`, `{ start: …, end: … }` or `[…]`. */
const show = (value: LocalDate | DateRange | LocalDate[] | null): string => {
  if (value === null) return 'null'
  if (typeof value === 'string') return `'${value}'`
  if (Array.isArray(value)) return `[${value.map(show).join(', ')}]`
  return `{ start: ${show(value.start)}, end: ${show(value.end)} }`
}

export default component$(() => {
  // every example starts on today: the main one without a value, the others with one counted from today
  const today = useToday()
  const date = useSignal<LocalDate | null>(null)
  const range = useSignal<DateRange | null>(null)
  const days = useSignal<LocalDate[]>([])
  const twoMonths = useSignal<DateRange | null>(null)
  const weekday = useSignal<LocalDate | null>(null)
  const viewDate = useSignal<LocalDate | null>(null)
  const displayDate = useSignal<LocalDate | null>(null)
  const display = useStore({
    fullWeeks: true,
    showWeekNumber: true,
    showDaysOfWeek: true,
    monday: false,
  })

  // on the server before the first render, and again if the visitor's day isn't the build's
  useTask$(({ track }) => {
    const day = track(today)
    range.value = { start: day, end: addDays(day, 6) }
    // three days in a row join in one shape
    days.value = [day, addDays(day, 1), addDays(day, 2), addDays(day, 7)]
    twoMonths.value = { start: addDays(day, 3), end: addDays(day, 17) }
    weekday.value = nextWeekday(day)
  })

  return (
    <div class="page">
      <article class="article">
        <h1 class="h1">calendar</h1>
        <p class="lead">
          One component, three modes. Bind a signal and get dates back as plain
          strings.
        </p>

        <Preview code={SINGLE}>
          <Calendar bind:value={date} theme="auto" />
          <p class="cap">value → {show(date.value)}</p>
        </Preview>

        <H2 id="usage">usage</H2>
        <Code code={USAGE} />
        <p class="p">
          Dates are <code class="c">YYYY-MM-DD</code> strings: no time, no
          timezone, no <code class="c">Date</code> objects to compare. Today
          gets <code class="c">aria-current="date"</code>.
        </p>

        <H2 id="examples">examples</H2>

        <H3 id="range">range</H3>
        <p class="p">
          With <code class="c">mode="range"</code> the value is{' '}
          <code class="c">{'{ start, end }'}</code>. Before the second click,
          the days up to the pointer show the range you'd get.
        </p>
        <Preview code={RANGE}>
          <Calendar mode="range" bind:value={range} theme="auto" />
          <p class="cap">value → {show(range.value)}</p>
        </Preview>

        <H3 id="multiple">multiple</H3>
        <p class="p">
          With <code class="c">mode="multiple"</code> the value is an array of
          days. Click a day again to unmark it.
        </p>
        <Preview code={MULTIPLE}>
          <Calendar mode="multiple" bind:value={days} theme="auto" />
          <p class="cap">value → {show(days.value)}</p>
        </Preview>

        <H3 id="two-months">two months</H3>
        <p class="p">
          <code class="c">{'months={2}'}</code> shows two months side by side.
          They stack on narrow screens.
        </p>
        <Preview code={MONTHS}>
          {/* a new calendar on the visitor's day: an outside value of a later month would show in the second panel */}
          <Calendar
            key={today.value}
            mode="range"
            months={2}
            bind:value={twoMonths}
            theme="auto"
          />
        </Preview>

        <H3 id="disabled">disabled days</H3>
        <p class="p">
          <code class="c">min</code>, <code class="c">max</code>,{' '}
          <code class="c">disabledDates</code> and{' '}
          <code class="c">disabledWeekdays</code> rule out days. The keyboard
          skips them.
        </p>
        <Preview code={fillDates(DISABLED, today.value)}>
          <Calendar
            min={today.value}
            disabledWeekdays={[0, 6]}
            bind:value={weekday}
            theme="auto"
          />
          <p class="cap">
            {`min="${today.value}" · disabledWeekdays={[0, 6]}`}
          </p>
        </Preview>

        <H3 id="months-and-years">months and years</H3>
        <p class="p">
          The title is a button: a click shows the months of the year, another
          one twelve years, and a third one the days again. Choosing a month or
          a year shows its days. Nothing is selected on the way.
        </p>
        <Preview code={fillDates(VIEWS, today.value)}>
          <Calendar min={today.value} bind:value={viewDate} theme="auto" />
          <p class="cap">
            click the title: the past months and years are ruled out
          </p>
        </Preview>
        <ul class="ul">
          <li>
            In those views, ‹ and › move a year, or twelve years, with their own
            labels.
          </li>
          <li>
            <code class="c">min</code> and <code class="c">max</code> disable
            the months and years past them, and a year past them shows the month
            of the limit.
          </li>
          <li>
            The keyboard goes along the months and the years too, and Escape
            goes back to the days: see <a href="#keyboard">keyboard</a>.
          </li>
        </ul>

        <H3 id="display">display options</H3>
        <p class="p">
          Full weeks, week numbers, the weekday names and the first day of the
          week. Turn them on and off:
        </p>
        <Preview code={displayCode(display)}>
          <div role="group" aria-label="Options" class="chips">
            {(
              [
                ['fullWeeks', 'fullWeeks'],
                ['showWeekNumber', 'showWeekNumber'],
                ['showDaysOfWeek', 'showDaysOfWeek'],
                ['monday', 'weekStartsOn={1}'],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                class="chip"
                aria-pressed={display[key]}
                onClick$={() => {
                  display[key] = !display[key]
                }}
              >
                {label}
              </button>
            ))}
          </div>
          {/* a new calendar for each set of options: they shape the grid it builds */}
          <Calendar
            key={JSON.stringify(display)}
            fullWeeks={display.fullWeeks}
            showWeekNumber={display.showWeekNumber}
            showDaysOfWeek={display.showDaysOfWeek}
            weekStartsOn={display.monday ? 1 : 0}
            bind:value={displayDate}
            theme="auto"
          />
        </Preview>
        <ul class="ul">
          <li>
            <code class="c">fullWeeks</code>: the days of the months around fill
            the first and the last week, disabled, and every month shows six
            weeks, so the calendar keeps its height from month to month.
          </li>
          <li>
            <code class="c">showWeekNumber</code>: a column with the ISO week
            number of each row.
          </li>
          <li>
            <code class="c">{'showDaysOfWeek={false}'}</code>: no weekday names
            over the grid.
          </li>
          <li>
            <code class="c">weekStartsOn</code>: the first column, from{' '}
            <code class="c">0</code> (Sunday, the default) to{' '}
            <code class="c">6</code>. Home and End follow it. See also{' '}
            <Link href="/localization/">localization</Link>.
          </li>
        </ul>

        <H2 id="api">api</H2>
        <p class="p">
          Everything <code class="c">qwik-date</code> exports, and what the
          calendar puts in the DOM for your CSS.
        </p>
        <ApiReference today={today.value} />

        <div class="pager">
          <Link class="pn" href="/">
            <small>← previous</small>Installation
          </Link>
          <Link class="pn" href="/date-picker/" style="text-align: right">
            <small>next →</small>Date Picker
          </Link>
        </div>
      </article>

      <Toc items={pageAt('/calendar/').sections} />
    </div>
  )
})

export const head = docHead('/calendar/')
