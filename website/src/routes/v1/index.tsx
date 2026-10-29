import { component$ } from '@qwik.dev/core'
import { Link } from '@qwik.dev/router'
import { Code, Install } from '~/components/code'
import { fillDates, useToday } from '~/components/dates'
import { H2 } from '~/components/docs'
import { docHead } from '~/components/seo'
import { Toc } from '~/components/toc'
import { CURRENT } from '~/data/release'
import { pageAt } from '~/data/site'

// the docs of qwik-date 1.0.0, from its README
const INLINE = `import { component$, useSignal } from '@builder.io/qwik';
import { CalendarInline } from 'qwik-date/inline';

export default component$(() => {
  const date = useSignal('%today%');

  return (
    <CalendarInline
      date={date.value}
      onDateChange$={(newDate) => console.log({ newDate })}
    />
  );
});`

const PICKER = `import { component$, useSignal } from '@builder.io/qwik';
import { DatePicker } from 'qwik-date/picker';

export default component$(() => {
  const date = useSignal('%today%');

  return (
    <DatePicker
      date={date.value}
      onDateChange$={(newDate) => console.log({ newDate })}
      triggerLabel="Select Date"
    />
  );
});`

const INLINE_PROPS = [
  ['date', 'The date to display.', 'today'],
  ['onDateChange$', 'Called when the date changes.', '–'],
  ['fullWeeks', 'Shows full weeks.', 'false'],
  ['locale', 'The locale of the calendar.', "'en'"],
  ['showWeekNumber', 'Shows the week numbers.', 'false'],
  ['showDaysOfWeek', 'Shows the weekday names.', 'true'],
  ['iconLeft, iconRight', 'Icons for the month buttons.', '–'],
  ['unStyled', 'Removes the default styles.', 'false'],
  [
    'containerProps, …',
    'Props for each part: headerProps, actionButtonProps, actionLeftProps, actionRightProps, calendarProps, theadProps, tbodyProps, theadRowProps, tbodyRowProps, headerCellProps, cellProps, dayButtonProps, iconProps, titleProps and weekNumberProps.',
    '–',
  ],
]

const PICKER_PROPS = [
  ['triggerLabel', 'The text of the trigger button.', '–'],
  ['triggerIcon', 'An icon for the trigger button.', '–'],
  ['triggerProps', 'Props for the trigger button.', '–'],
  ['mode', "'popup' or 'inline'.", "'popup'"],
  ['…', 'Every prop of CalendarInline.', '–'],
]

const PropsTable = (props: { rows: string[][] }) => (
  <div class="scroll">
    <table class="tbl">
      <thead>
        <tr>
          <th>prop</th>
          <th>description</th>
          <th>default</th>
        </tr>
      </thead>
      <tbody>
        {props.rows.map(([name, description, value]) => (
          <tr key={name}>
            <td>
              <code class="prop">{name}</code>
            </td>
            <td style="color: var(--fg2)">{description}</td>
            <td>
              <code class="mono" style="font-size: 12.5px; color: var(--muted)">
                {value}
              </code>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)

export default component$(() => {
  // the examples start on today, as in the 2.x docs
  const today = useToday()

  return (
    <div class="page">
      <article class="article">
        <div class="banner">
          <span>
            You're reading the docs for <code class="c">qwik-date@1</code>, for
            Qwik v1.
          </span>
          <Link class="link" href="/">
            Go to {CURRENT.label} →
          </Link>
        </div>

        <h1 class="h1">qwik-date@1</h1>
        <p class="lead">
          The 1.x line, for Qwik v1: an inline calendar and a popup date picker.
        </p>

        <H2 id="install">install</H2>
        <p class="p">
          qwik-date 1.x works with Qwik v1 (
          <code class="c">@builder.io/qwik</code>
          ).
        </p>
        <Install pkg="qwik-date@1" />
        <p class="small">
          <code class="c">@1</code> keeps you on 1.x once 2.0 is the latest.
        </p>
        <div class="callout">
          <span class="label">note</span>Moving to Qwik v2? 2.x renames a few
          props and drops the DatePicker. See{' '}
          <Link href="/changelog/#upgrading">upgrading from 1.x</Link>.
        </div>

        <H2 id="calendar-inline">calendar-inline</H2>
        <p class="p">
          The calendar on the page. Import it from{' '}
          <code class="c">qwik-date/inline</code>, or as{' '}
          <code class="c">Calendar</code> from <code class="c">qwik-date</code>.
        </p>
        <Code
          code={fillDates(INLINE, today.value)}
          file="src/routes/index.tsx"
        />
        <PropsTable rows={INLINE_PROPS} />

        <H2 id="date-picker">date-picker</H2>
        <p class="p">
          A trigger and a popup calendar, placed with floating-ui. Import it
          from <code class="c">qwik-date/picker</code>, or from{' '}
          <code class="c">qwik-date</code>.
        </p>
        <Code
          code={fillDates(PICKER, today.value)}
          file="src/routes/index.tsx"
        />
        <PropsTable rows={PICKER_PROPS} />

        <div class="pager">
          <span />
          <Link
            class="pn"
            href="/changelog/#upgrading"
            style="text-align: right"
          >
            <small>next →</small>Upgrading to 2.x
          </Link>
        </div>
      </article>

      <Toc items={pageAt('/v1/').sections} />
    </div>
  )
})

export const head = docHead('/v1/')
