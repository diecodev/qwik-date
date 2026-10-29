import { component$ } from '@qwik.dev/core'
import { H3, md } from '~/components/docs'
import { docHead } from '~/components/seo'
import { Toc } from '~/components/toc'

const BREAKING = [
  'Needs Qwik v2 (`@qwik.dev/core`). The CommonJS build is gone.',
  'Everything is exported from `qwik-date`. `qwik-date/inline` and `qwik-date/picker` are gone.',
  '`DatePicker` is removed. Put the `Calendar` in a popover instead.',
  '`date`, `bind:date` and `onDateChange$` are now `value`, `bind:value` and `onChange$`. The value is selected from the start.',
  '`unStyled` is now `unstyled`.',
  '`iconLeft` and `iconRight` are now `prevIcon` and `nextIcon`, and the `action*Props` are now `navButtonProps`, `prevButtonProps` and `nextButtonProps`.',
  '`CalendarProps` is a type alias: extend it with an intersection, not an interface.',
  '`labels` has new texts, required for locales other than `en` and `es`.',
  'An `aria-label` in `containerProps` is now followed by the selection, and `containerProps` no longer takes `onChange$`.',
]

const FEATURES = [
  'Select a range with `mode="range"`, with a preview under the pointer.',
  'Select several days with `mode="multiple"`.',
  'Show months side by side with `months`.',
  'Rule out days with `min`, `max`, `disabledDates` and `disabledWeekdays`.',
  'Choose the month and the year from the title.',
  '`qwik-date/headless`: the calendar in parts, and `useCalendar()`.',
  'Submit the value with a form through `name`.',
  'Any locale through `Intl`, with `labels` and `weekStartsOn`.',
  'A `theme` prop: light, dark or auto.',
  '`autoFocus`, to focus a day when the calendar shows up.',
  '`formatDate` and `formatDateRange`, to show the value in a trigger.',
  '`data-direction` on the calendar and its rows, to animate month changes with CSS.',
  'Recipes for a date picker: native popover, floating-ui.',
]

const FIXES = [
  'Icons keep their size in `unstyled` calendars.',
  'Keys pressed back to back land on the right day.',
  'The grid is named after the month it shows.',
  'Better contrast for weekday names and week numbers.',
  "Dates whose day doesn't exist in their month are rejected.",
  'Arrow keys are mirrored in right-to-left layouts.',
  "The default day is the visitor's, not the server's.",
  'The calendar has a readable, complete accessible name.',
  'Month chevrons flip in right-to-left layouts.',
  '`useStyles$` is called unconditionally.',
  'Library styles stay off unstyled calendars.',
  'Rows are numbered after their ISO week.',
  'The selected day is exposed to assistive technology.',
  'The binding works in both directions.',
  'Home and End go to the start and end of the focused row.',
  'Only the keys the grid handles are cancelled.',
  'The focus stays on the month buttons after changing month.',
  'PageUp and PageDown land on a day that exists in the target month.',
  "Day buttons are looked up inside the calendar's own element.",
  "The focus doesn't move when the calendar first becomes visible.",
  'Week numbers are computed in local time.',
  'Keyboard navigation dates are computed in local time.',
  'The default date is the local day.',
  'Calendar buttons inherit the page font.',
]

/** What 1.x code becomes in 2.x, as removed and added lines. */
const RENAMES: [string, string][] = [
  [
    "import { CalendarInline } from 'qwik-date/inline';",
    "import { Calendar } from 'qwik-date';",
  ],
  ['date · bind:date · onDateChange$', 'value · bind:value · onChange$'],
  ['unStyled', 'unstyled'],
  ['iconLeft · iconRight', 'prevIcon · nextIcon'],
  ['actionButtonProps', 'navButtonProps'],
  ['actionLeftProps · actionRightProps', 'prevButtonProps · nextButtonProps'],
  [
    'triggerLabel · triggerIcon · triggerProps',
    'your own trigger + formatDate()',
  ],
  ['[data-preselected]', '[aria-current="date"]'],
  [
    'interface Props extends CalendarProps',
    'type Props = CalendarProps & Extra',
  ],
]

const List = (props: { items: string[]; kind: 'brk' | 'add' | 'fix' }) => (
  <ul class={['log', props.kind]}>
    {props.items.map((item) => (
      <li key={item}>{md(item)}</li>
    ))}
  </ul>
)

export default component$(() => (
  <div class="page">
    <article class="article">
      <h1 class="h1">changelog</h1>
      <p class="lead">What changed, release by release. Newest first.</p>
      <div class="legend">
        <span>
          <span style="color: var(--amber)">!</span> breaking
        </span>
        <span>
          <span style="color: var(--blue)">+</span> new
        </span>
        <span>~ fix</span>
      </div>

      <section class="rel">
        <h2 class="rel-h" id="v2-0-0-beta-0">
          <span class="hash" aria-hidden="true">
            ##
          </span>
          2.0.0-beta.0
        </h2>
        <p class="meta">
          tag: <b>beta</b> · qwik v2
        </p>
        <p class="p">
          qwik-date 2 is built for Qwik v2 and only does the calendar now: the
          DatePicker is gone, and you put the <code class="c">Calendar</code> in
          a popover with a trigger of your own. Zero runtime dependencies.
        </p>
        <p class="p">
          New on top: ranges, several days, two months side by side, min and max
          dates, forms, any locale and a headless version.
        </p>
        <div class="term">
          <pre class="tpre">
            <code>
              <span class="pr">$ </span>pnpm add -D -E{' '}
              <span class="tk-n">qwik-date@beta</span>
            </code>
          </pre>
        </div>

        <H3 id="breaking">breaking</H3>
        <List items={BREAKING} kind="brk" />

        <H3 id="new">new</H3>
        <List items={FEATURES} kind="add" />

        <H3 id="fixes">fixes</H3>
        <details>
          <summary class="sum">
            <span class="sum-closed">show {FIXES.length} fixes</span>
            <span class="sum-open">hide the fixes</span>
          </summary>
          <List items={FIXES} kind="fix" />
        </details>

        <H3 id="upgrading">upgrading from 1.x</H3>
        <ol class="steps">
          <li>
            Move your app to Qwik v2. qwik-date 2 needs{' '}
            <code class="c">@qwik.dev/core</code> and ships ESM only.
          </li>
          <li>
            Install <code class="c">qwik-date@beta</code>.
          </li>
          <li>
            Import everything from <code class="c">qwik-date</code>. The{' '}
            <code class="c">/inline</code> and <code class="c">/picker</code>{' '}
            entry points are gone.
          </li>
          <li>Rename the props, as in the diff below.</li>
          <li>
            Replace the <code class="c">DatePicker</code> with the{' '}
            <a href="/date-picker/">popover recipe</a>, and format the trigger
            with <code class="c">formatDate()</code>.
          </li>
          <li>
            For locales other than <code class="c">en</code> and{' '}
            <code class="c">es</code>, pass <code class="c">labels</code>.
          </li>
        </ol>
        <div class="term">
          <div class="term-h">
            <span class="term-file">renames.diff</span>
            <span
              class="mono"
              style="margin-left: auto; padding-right: 8px; font-size: 12px"
            >
              <span style="color: #ff9f6b">−{RENAMES.length}</span>{' '}
              <span style="color: #7cb4ff">+{RENAMES.length}</span>
            </span>
          </div>
          <div class="diff">
            {RENAMES.map(([before, after]) => (
              <div key={before}>
                <div class="dl" data-t="-">
                  <span class="dl-m" aria-label="removed">
                    −
                  </span>
                  {before}
                </div>
                <div class="dl" data-t="+">
                  <span class="dl-m" aria-label="added">
                    +
                  </span>
                  {after}
                </div>
              </div>
            ))}
          </div>
        </div>
        <p class="p" style="font-size: 14px">
          <a href="https://github.com/diecodev/qwik-date/compare/v1.0.0...v2.0.0-beta.0">
            git log v1.0.0..v2.0.0-beta.0 →
          </a>
        </p>
      </section>

      <section class="rel">
        <h2 class="rel-h" id="v1-0-0">
          <span class="hash" aria-hidden="true">
            ##
          </span>
          1.0.0
        </h2>
        <p class="meta">tag: latest · qwik v1 · 2024-08-02</p>
        <p class="p">
          The first release, for Qwik v1 (
          <code class="c">@builder.io/qwik</code>
          ).
        </p>
        <List
          kind="add"
          items={[
            '`CalendarInline` from `qwik-date/inline`, also exported as `Calendar`.',
            '`DatePicker` from `qwik-date/picker`: a trigger and a popup placed with floating-ui.',
            'Week numbers, full weeks, weekday names and `locale`.',
            'Props for every part of the calendar, and `unStyled`.',
          ]}
        />
        <div class="term">
          <pre class="tpre">
            <code>
              <span class="pr">$ </span>pnpm add -D -E{' '}
              <span class="tk-n">qwik-date@1</span>
            </code>
          </pre>
        </div>
      </section>
    </article>

    <Toc
      items={[
        { id: 'v2-0-0-beta-0', label: '2.0.0-beta.0' },
        { id: 'breaking', label: 'Breaking', sub: true },
        { id: 'new', label: 'New', sub: true },
        { id: 'fixes', label: 'Fixes', sub: true },
        { id: 'upgrading', label: 'Upgrading from 1.x', sub: true },
        { id: 'v1-0-0', label: '1.0.0' },
      ]}
    />
  </div>
))

export const head = docHead(
  'Changelog',
  'Every release of qwik-date, and how to upgrade from 1.x to 2.x.',
  '/changelog/',
)
