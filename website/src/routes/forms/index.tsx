import { component$, useSignal, useTask$ } from '@qwik.dev/core'
import { Link } from '@qwik.dev/router'
import { Calendar, type DateRange, type LocalDate } from 'qwik-date'
import { Code } from '~/components/code'
import { addDays, useToday } from '~/components/dates'
import { H2, Preview } from '~/components/docs'
import { docHead } from '~/components/seo'
import { Toc } from '~/components/toc'
import { pageAt } from '~/data/site'

type Mode = 'single' | 'range' | 'multiple'

const NAMES: Record<Mode, string> = {
  single: 'due',
  range: 'stay',
  multiple: 'days',
}

const DEMO = (mode: Mode) =>
  `<form>
  <Calendar${mode === 'single' ? '' : ` mode="${mode}"`} name="${NAMES[mode]}" bind:value={value} />
  <button type="submit">submit</button>
</form>`

const ACTION = `import { component$, useSignal } from '@qwik.dev/core';
import { Form, routeAction$ } from '@qwik.dev/router';
import { Calendar, type LocalDate } from 'qwik-date';

export const useBook = routeAction$((data) => {
  // { days: ['%today%', '%week%'] }
  return { days: data.days };
});

export default component$(() => {
  const book = useBook();
  const days = useSignal<LocalDate[]>([]);

  return (
    <Form action={book}>
      <Calendar mode="multiple" bind:value={days} name="days" />
      <button type="submit">Book</button>
    </Form>
  );
});`

export default component$(() => {
  const today = useToday()
  const mode = useSignal<Mode>('range')
  const due = useSignal<LocalDate | null>(null)
  const stay = useSignal<DateRange | null>(null)
  const days = useSignal<LocalDate[]>([])
  const sent = useSignal<string | null>(null)

  // the demo starts on today, and follows the visitor's day
  useTask$(({ track }) => {
    const day = track(today)
    due.value = day
    stay.value = { start: day, end: addDays(day, 3) }
    days.value = [day, addDays(day, 7)]
  })

  return (
    <div class="page">
      <article class="article">
        <h1 class="h1">forms</h1>
        <p class="lead">
          Give the calendar a <code class="c">name</code> and its value goes
          with the form around it, like any input.
        </p>

        <Preview
          code={DEMO(mode.value).replace('%today%', today.value)}
          file="form.tsx"
        >
          <div role="group" aria-label="Mode" class="chips">
            {(['single', 'range', 'multiple'] as const).map((id) => (
              <button
                key={id}
                type="button"
                class="chip"
                aria-pressed={mode.value === id}
                onClick$={() => {
                  mode.value = id
                  sent.value = null
                }}
              >
                {id}
              </button>
            ))}
          </div>
          <form
            preventdefault:submit
            onSubmit$={(_, form) => {
              const entries = [...new FormData(form)].map(
                ([name, value]) => `${name}=${value}`,
              )
              sent.value = entries.length ? entries.join('\n') : '(nothing)'
            }}
            style="display: flex; flex-direction: column; align-items: center; gap: 14px"
          >
            {mode.value === 'single' && (
              <Calendar name="due" bind:value={due} theme="auto" />
            )}
            {mode.value === 'range' && (
              <Calendar
                mode="range"
                name="stay"
                bind:value={stay}
                theme="auto"
              />
            )}
            {mode.value === 'multiple' && (
              <Calendar
                mode="multiple"
                name="days"
                bind:value={days}
                theme="auto"
              />
            )}
            <button type="submit" class="submit">
              submit
            </button>
          </form>
          <pre class="sent mono" aria-live="polite">
            {sent.value ?? 'submit to see what the form sends'}
          </pre>
        </Preview>

        <H2 id="inputs">hidden inputs</H2>
        <p class="p">
          With <code class="c">name</code>, the calendar adds hidden inputs with
          its value, as <code class="c">YYYY-MM-DD</code>:
        </p>
        <div class="scroll">
          <table class="tbl">
            <thead>
              <tr>
                <th>mode</th>
                <th>inputs</th>
                <th>without a value</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <code class="c">single</code>
                </td>
                <td>
                  <code class="c">due</code>
                </td>
                <td>empty</td>
              </tr>
              <tr>
                <td>
                  <code class="c">range</code>
                </td>
                <td>
                  <code class="c">stay[start]</code>,{' '}
                  <code class="c">stay[end]</code>
                </td>
                <td>empty, and the end until it's chosen</td>
              </tr>
              <tr>
                <td>
                  <code class="c">multiple</code>
                </td>
                <td>
                  a <code class="c">days[]</code> per day
                </td>
                <td>none: nothing is sent</td>
              </tr>
            </tbody>
          </table>
        </div>

        <H2 id="actions">qwik router actions</H2>
        <p class="p">
          A <code class="c">routeAction$</code> gets the value with the rest of
          the form. Qwik Router builds arrays from names ending in{' '}
          <code class="c">[]</code>, so <code class="c">mode="multiple"</code>{' '}
          arrives as <code class="c">{'{ days: [...] }'}</code>: a name repeated
          without <code class="c">[]</code> would keep only the last day.
        </p>
        <Code
          code={ACTION.replace('%today%', today.value).replace(
            '%week%',
            addDays(today.value, 7),
          )}
          file="src/routes/book/index.tsx"
        />
        <div class="callout">
          <span class="label">note</span>The inputs are plain text: check the
          days on the server too, with the same <code class="c">min</code>,{' '}
          <code class="c">max</code> and disabled days the calendar has.
        </div>

        <div class="pager">
          <Link class="pn" href="/headless/">
            <small>← previous</small>Headless
          </Link>
          <Link class="pn" href="/localization/" style="text-align: right">
            <small>next →</small>Localization
          </Link>
        </div>
      </article>

      <Toc items={pageAt('/forms/').sections} />
    </div>
  )
})

export const head = docHead('/forms/')
