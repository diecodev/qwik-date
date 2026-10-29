import { component$, useSignal, useTask$ } from '@qwik.dev/core'
import { Link } from '@qwik.dev/router'
import { Calendar, type DateRange, type LocalDate, type Theme } from 'qwik-date'
import { Code } from '~/components/code'
import { addDays, useToday } from '~/components/dates'
import { H2, Preview } from '~/components/docs'
import { docHead } from '~/components/seo'
import { Toc } from '~/components/toc'
import { pageAt } from '~/data/site'

const THEME = `import { component$, useSignal } from '@qwik.dev/core';
import { Calendar, type Theme } from 'qwik-date';

export default component$(() => {
  const theme = useSignal<Theme>('auto');

  return <Calendar theme={theme} />;
});`

const OWN = `<Calendar mode="range" bind:value={range} containerProps={{ class: 'brand' }} />

/* the library's rules weigh nothing: these win, without !important */
.brand [data-selected] { background: #2563eb; color: white; }
.brand td:has(> [data-in-range]) { background: #2563eb14; }
.brand [data-in-range] { color: #2563eb; }
.brand td > button { border-radius: 4px; }`

const UNSTYLED = `<Calendar
  unstyled
  containerProps={{ class: 'calendar' }}
  dayButtonProps={{ class: 'day' }}
/>`

const RTL = `<html dir="rtl">
<!-- or, for one calendar -->
<Calendar containerProps={{ dir: 'rtl' }} />`

export default component$(() => {
  const today = useToday()
  const theme = useSignal<Theme>('auto')
  const date = useSignal<LocalDate | null>(null)
  const range = useSignal<DateRange | null>(null)
  const dir = useSignal<'ltr' | 'rtl'>('rtl')
  const rtlDate = useSignal<LocalDate | null>(null)

  // the demo starts on today, and follows the visitor's day
  useTask$(({ track }) => {
    const day = track(today)
    range.value = { start: day, end: addDays(day, 5) }
  })

  return (
    <div class="page">
      <article class="article">
        <h1 class="h1">theming</h1>
        <p class="lead">
          Light, dark or the system's. Your own colors over the library's, or no
          library styles at all.
        </p>

        <H2 id="theme">theme</H2>
        <p class="p">
          <code class="c">'light'</code> (the default),{' '}
          <code class="c">'dark'</code>, or <code class="c">'auto'</code>, which
          follows the operating system with{' '}
          <code class="c">prefers-color-scheme</code> and ships no JavaScript. A
          signal changes it at runtime:
        </p>
        <Preview code={THEME}>
          <div role="group" aria-label="Theme" class="chips">
            {(['light', 'dark', 'auto'] as const).map((id) => (
              <button
                key={id}
                type="button"
                class="chip"
                aria-pressed={theme.value === id}
                onClick$={() => {
                  theme.value = id
                }}
              >
                {id}
              </button>
            ))}
          </div>
          <Calendar theme={theme} bind:value={date} />
        </Preview>
        <p class="p">
          Colors change in 150 ms, and at once with{' '}
          <code class="c">prefers-reduced-motion</code>.
        </p>

        <H2 id="your-styles">your own styles</H2>
        <p class="p">
          Every rule of the stylesheet goes through{' '}
          <code class="c">:where()</code>, so they weigh nothing: a rule of
          yours on a part or a{' '}
          <Link href="/calendar/#data-attributes">data attribute</Link> wins,
          without <code class="c">!important</code>. A class on the root through{' '}
          <code class="c">containerProps</code> keeps it to one calendar.
        </p>
        <Preview code={OWN}>
          <Calendar
            mode="range"
            bind:value={range}
            containerProps={{ class: 'brand' }}
            theme="auto"
          />
          <p class="cap">the site's blue, square days: four rules</p>
        </Preview>

        <H2 id="unstyled">unstyled</H2>
        <p class="p">
          <code class="c">unstyled</code> leaves the calendar without the
          library's styles: the markup, the keyboard and the attributes stay.
          Style it through the props of its parts and its data attributes. The
          chevrons are <code class="c">1em</code> wide, so the text around sizes
          them.
        </p>
        <Code code={UNSTYLED} />
        <p class="p">
          For markup of your own, not only styles, use the{' '}
          <Link href="/headless/">headless parts</Link>.
        </p>

        <H2 id="rtl">right to left</H2>
        <p class="p">
          In a right-to-left page, or with <code class="c">dir="rtl"</code> on
          the calendar, the chevrons turn around and the left and right arrow
          keys swap, so they move the way they point.
        </p>
        <Preview code={RTL}>
          <div role="group" aria-label="Direction" class="chips">
            {(['ltr', 'rtl'] as const).map((id) => (
              <button
                key={id}
                type="button"
                class="chip"
                aria-pressed={dir.value === id}
                onClick$={() => {
                  dir.value = id
                }}
              >
                dir="{id}"
              </button>
            ))}
          </div>
          <Calendar
            key={dir.value}
            containerProps={{ dir: dir.value }}
            bind:value={rtlDate}
            theme="auto"
          />
          <p class="cap">focus a day and use the arrows</p>
        </Preview>

        <div class="pager">
          <Link class="pn" href="/localization/">
            <small>← previous</small>Localization
          </Link>
          <Link class="pn" href="/animations/" style="text-align: right">
            <small>next →</small>Animations
          </Link>
        </div>
      </article>

      <Toc items={pageAt('/theming/').sections} />
    </div>
  )
})

export const head = docHead('/theming/')
