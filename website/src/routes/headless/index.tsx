import { component$, useSignal, useTask$ } from '@qwik.dev/core'
import { Link } from '@qwik.dev/router'
import type { DateRange, LocalDate } from 'qwik-date/headless'
import { Code } from '~/components/code'
import { addDays, useToday } from '~/components/dates'
import { H2, Preview, md } from '~/components/docs'
import { EventsDemo, HeadlessDemo } from '~/components/headless-demo'
import { docHead } from '~/components/seo'
import { Toc } from '~/components/toc'
import { PARTS, STATE } from '~/data/headless'
import { pageAt } from '~/data/site'

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

      <Toc items={pageAt('/headless/').sections} />
    </div>
  )
})

export const head = docHead('/headless/')
