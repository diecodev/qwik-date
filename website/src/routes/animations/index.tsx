import { component$, useSignal } from '@qwik.dev/core'
import { Link } from '@qwik.dev/router'
import { Calendar, type LocalDate } from 'qwik-date'
import { Code } from '~/components/code'
import { H2, Preview } from '~/components/docs'
import { docHead } from '~/components/seo'
import { Toc } from '~/components/toc'

const CSS = `@media (prefers-reduced-motion: no-preference) {
  [data-qwik-date] table:not([data-period]) > tbody > tr[data-direction='next'] {
    animation: month-next 200ms ease-out;
  }
  [data-qwik-date] table:not([data-period]) > tbody > tr[data-direction='prev'] {
    animation: month-prev 200ms ease-out;
  }
  [data-qwik-date] table[data-period] {
    animation: view-in 150ms ease-out;
  }
}

@keyframes month-next { from { opacity: 0; translate: 1rem 0; } }
@keyframes month-prev { from { opacity: 0; translate: -1rem 0; } }
@keyframes view-in { from { opacity: 0; scale: 0.96; } }`

const TAILWIND = `<Calendar.GridBody
  rowProps={{
    class: 'motion-safe:data-[direction=next]:animate-month-next motion-safe:data-[direction=prev]:animate-month-prev',
  }}
/>`

const POPOVER = `@media (prefers-reduced-motion: no-preference) {
  [data-qwik-date][popover] {
    transition: opacity 150ms, translate 150ms, display 150ms allow-discrete, overlay 150ms allow-discrete;
  }
  @starting-style {
    [data-qwik-date][popover]:popover-open { opacity: 0; translate: 0 -4px; }
  }
}`

export default component$(() => {
  const date = useSignal<LocalDate | null>(null)

  return (
    <div class="page">
      <article class="article">
        <h1 class="h1">animations</h1>
        <p class="lead">
          The calendar doesn't move by itself. It tells your CSS when it moved,
          and which way.
        </p>

        <Preview code={CSS} file="global.css">
          <div class="anim">
            <Calendar bind:value={date} theme="auto" />
          </div>
          <p class="cap">
            change the month, or open the months and the years from the title
          </p>
        </Preview>

        <H2 id="moments">the moments</H2>
        <ul class="ul">
          <li>
            <code class="c">data-direction="next"</code> or{' '}
            <code class="c">"prev"</code>, on the calendar and on the rows of
            days, after each move: the buttons, the keyboard, a month or a year
            chosen, or a value written from outside. Before the first move
            there's none, so nothing moves on load.
          </li>
          <li>
            The rows of days are new for each month, in every grid with{' '}
            <code class="c">months</code>, so an animation on them plays on
            every change, in the direction they were created with.
          </li>
          <li>
            The months and years grids (
            <code class="c">table[data-period]</code>) are new when their view
            opens, and their rows for each year or page of years.
          </li>
        </ul>
        <p class="p">
          On its own, the calendar only fades its colors when the theme changes,
          in 150 ms, and not at all with{' '}
          <code class="c">prefers-reduced-motion</code>. Keep your animations
          inside it too, as the CSS above does.
        </p>

        <H2 id="tailwind">tailwind</H2>
        <p class="p">
          With the <Link href="/headless/">headless parts</Link>, on the rows:{' '}
          <code class="c">animate-month-next</code> and{' '}
          <code class="c">animate-month-prev</code> take the keyframes above in
          your Tailwind config. For anything else,{' '}
          <code class="c">useCalendar().direction</code> has the same value.
        </p>
        <Code code={TAILWIND} />

        <H2 id="popover">the popover</H2>
        <p class="p">
          The <Link href="/date-picker/">date picker recipe</Link>, as it opens
          and closes:
        </p>
        <Code code={POPOVER} />

        <div class="callout">
          <span class="label">note</span>View Transitions aren't built in: Qwik
          doesn't tell when a change of month is on the screen, and these
          attributes give CSS the same without JavaScript.
        </div>

        <div class="pager">
          <Link class="pn" href="/theming/">
            <small>← previous</small>Theming
          </Link>
          <Link class="pn" href="/accessibility/" style="text-align: right">
            <small>next →</small>Accessibility
          </Link>
        </div>
      </article>

      <Toc
        items={[
          { id: 'moments', label: 'The moments' },
          { id: 'tailwind', label: 'Tailwind' },
          { id: 'popover', label: 'The popover' },
        ]}
      />
    </div>
  )
})

export const head = docHead(
  'Animations',
  'Animate the changes of month and view of a qwik-date Calendar with CSS: data-direction and new rows on every move.',
  '/animations/',
)
