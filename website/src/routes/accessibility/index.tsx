import { component$ } from '@qwik.dev/core'
import { Link } from '@qwik.dev/router'
import { H2, md } from '~/components/docs'
import { docHead } from '~/components/seo'
import { Toc } from '~/components/toc'
import { pageAt } from '~/data/site'

const NAMES = [
  [
    'the calendar',
    '`<div role="group">`',
    'Its `aria-label` (`labels.calendar` by default) followed by the selection: "Calendar, selected date: Wednesday, October 28, 2026". A range and several days are read the same way.',
  ],
  [
    'the title',
    '`aria-live="polite"`',
    'Announces each month and view as it changes, and names the grid.',
  ],
  [
    'the days',
    '`<table role="grid">`',
    'Each day button is named with its full date. Today has `aria-current="date"`; the cell of a selected day, or of a day in the range, has `aria-selected`.',
  ],
  [
    'the month buttons',
    '`<button>`',
    'Named "go to previous month", "go to next year"… as the view shows. At `min` and `max` they get `aria-disabled` and stay focusable, so the focus doesn\'t drop.',
  ],
  [
    'the days ruled out',
    '`disabled`',
    'Their cells have `aria-disabled`, and the keyboard skips them.',
  ],
]

export default component$(() => (
  <div class="page">
    <article class="article">
      <h1 class="h1">accessibility</h1>
      <p class="lead">
        What a pointer gets, the keyboard and a screen reader get too. Here is
        what the calendar does, and what's left for you.
      </p>

      <H2 id="names">names and announcements</H2>
      <div style="margin-top: 12px">
        {NAMES.map(([part, element, what]) => (
          <div key={part} class="ref">
            <span>
              <span style="display: block; color: var(--fg)">{part}</span>
              <span style="font-size: 13px">{md(element)}</span>
            </span>
            <span>{md(what)}</span>
          </div>
        ))}
      </div>
      <p class="p">
        The texts come from <Link href="/localization/#labels">labels</Link>:
        translate them along with the locale.
      </p>

      <H2 id="focus">keyboard and focus</H2>
      <ul class="ul">
        <li>
          The grid is a single Tab stop, even with several months. Tab enters on
          the selected day, or on the first one that can be chosen.
        </li>
        <li>
          Arrows, Home and End, PageUp and PageDown, Enter and Space: the whole
          table is in the <Link href="/calendar/#keyboard">API</Link>. In
          right-to-left layouts the arrows follow the reading direction.
        </li>
        <li>
          After a month button, the focus stays on it. From the months and the
          years, Escape goes back to the days with the focus on the title, and a
          popover around stays open.
        </li>
        <li>
          The calendar never takes the focus on its own. With{' '}
          <code class="c">autoFocus</code> it does, every time it shows up: for
          a popover or a dialog.
        </li>
      </ul>

      <H2 id="motion">motion and contrast</H2>
      <ul class="ul">
        <li>
          Nothing moves by itself. The colors fade in 150 ms when the theme
          changes, and not at all with{' '}
          <code class="c">prefers-reduced-motion</code>; the{' '}
          <Link href="/animations/">animations</Link> guide keeps yours inside
          it too.
        </li>
        <li>
          The weekday names and the week numbers reach 4.7:1 on the light theme
          and 5.3:1 on the dark one, over the 4.5:1 of WCAG AA.
        </li>
        <li>
          The days that can't be chosen are faded and struck through: not only a
          color tells them apart.
        </li>
      </ul>

      <H2 id="yours">your part</H2>
      <ul class="ul">
        <li>
          Name the calendar after what it's for, through{' '}
          <code class="c">containerProps</code>:{' '}
          <code class="c">{"{ 'aria-label': 'Due date' }"}</code>.
        </li>
        <li>
          In a date picker, the trigger needs{' '}
          <code class="c">aria-haspopup="dialog"</code> and{' '}
          <code class="c">aria-expanded</code>, and the focus goes back to it
          when the popup closes: the <Link href="/date-picker/">recipes</Link>{' '}
          do it.
        </li>
        <li>
          With <code class="c">unstyled</code> or the{' '}
          <Link href="/headless/">headless parts</Link>, the attributes stay,
          but the focus ring and the contrast are yours.
        </li>
      </ul>
      <p class="p">
        The library checks the names, the selection and the accessibility tree
        with end-to-end tests in Chromium and WebKit, along with the keyboard
        and the focus.
      </p>

      <div class="pager">
        <Link class="pn" href="/animations/">
          <small>← previous</small>Animations
        </Link>
        <Link class="pn" href="/changelog/" style="text-align: right">
          <small>next →</small>Changelog
        </Link>
      </div>
    </article>

    <Toc items={pageAt('/accessibility/').sections} />
  </div>
))

export const head = docHead('/accessibility/')
