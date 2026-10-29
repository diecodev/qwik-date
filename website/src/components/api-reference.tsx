import { component$, useSignal } from '@qwik.dev/core'
import { type LocalDate, formatDate, formatDateRange } from 'qwik-date'
import { Code, Tokens } from './code'
import { addDays, fillDates } from './dates'
import { H3, md } from './docs'

type Group =
  | 'selection'
  | 'limits'
  | 'display'
  | 'locale'
  | 'forms'
  | 'styling'
  | 'parts'

type Prop = {
  name: string
  group: Group
  type: string
  default: string
  /** `new` in 2.x, or `renamed` from 1.x */
  badge?: 'new' | 'renamed'
  /** the name in 1.x */
  was?: string
  description: string
  example: string
}

const PROPS: Prop[] = [
  {
    name: 'mode',
    group: 'selection',
    type: "'single' | 'range' | 'multiple'",
    default: "'single'",
    badge: 'new',
    description:
      'What a click selects: one day, a start and an end, or any days. It sets the type of `value`, `bind:value` and `onChange$`.',
    example: '<Calendar mode="range" bind:value={range} />',
  },
  {
    name: 'value',
    group: 'selection',
    type: 'LocalDate | DateRange | LocalDate[] | null',
    default: 'null',
    badge: 'renamed',
    was: 'date',
    description:
      'The selected value, selected from the start: a day, a `DateRange` with `mode="range"`, or the days with `mode="multiple"` (`[]` by default). The calendar opens on its month, or on today\'s without one.',
    example: '<Calendar value="%today%" />',
  },
  {
    name: 'bind:value',
    group: 'selection',
    type: 'Signal<…>',
    default: '–',
    badge: 'renamed',
    was: 'bind:date',
    description:
      "A signal of the value's type, kept in sync in both directions: write to it and the calendar shows that month.",
    example:
      'const date = useSignal<LocalDate | null>(null);\n\n<Calendar bind:value={date} />',
  },
  {
    name: 'onChange$',
    group: 'selection',
    type: '(value) => void',
    default: '–',
    badge: 'renamed',
    was: 'onDateChange$',
    description:
      'Called with the new value on every choice. In a range, also after the first day, with `end: null`; with `mode="multiple"`, on every mark and unmark, with the days in order.',
    example: '<Calendar onChange$={(value) => console.log(value)} />',
  },
  {
    name: 'min, max',
    group: 'limits',
    type: 'LocalDate',
    default: '–',
    badge: 'new',
    description:
      'The first and the last day that can be chosen. The month buttons stop at their months, and the months and years views disable the ones past them.',
    example: '<Calendar min="%today%" max="%max%" />',
  },
  {
    name: 'disabledDates',
    group: 'limits',
    type: 'readonly LocalDate[]',
    default: '–',
    badge: 'new',
    description:
      "Days that can't be chosen. The keyboard skips them, and a range can't cross them: it ends right before the first one, as with every day ruled out.",
    example: "<Calendar disabledDates={['%christmas%', '%new-year%']} />",
  },
  {
    name: 'disabledWeekdays',
    group: 'limits',
    type: 'readonly WeekDay[]',
    default: '–',
    badge: 'new',
    description:
      "Weekdays that can't be chosen, `0` for Sunday: `[0, 6]` disables the weekends.",
    example: '<Calendar disabledWeekdays={[0, 6]} />',
  },
  {
    name: 'months',
    group: 'display',
    type: 'number',
    default: '1',
    badge: 'new',
    description:
      'How many months show side by side, with one Tab stop for all of them. The buttons move one month, and they stack on narrow screens.',
    example: '<Calendar mode="range" months={2} />',
  },
  {
    name: 'fullWeeks',
    group: 'display',
    type: 'boolean',
    default: 'false',
    description:
      'Fills the first and the last week with the days of the months around, disabled, and shows six weeks in every month.',
    example: '<Calendar fullWeeks />',
  },
  {
    name: 'showWeekNumber',
    group: 'display',
    type: 'boolean',
    default: 'false',
    description: 'Adds a column with the ISO week number of each row.',
    example: '<Calendar showWeekNumber />',
  },
  {
    name: 'showDaysOfWeek',
    group: 'display',
    type: 'boolean',
    default: 'true',
    description: 'Shows the weekday names over the grid.',
    example: '<Calendar showDaysOfWeek={false} />',
  },
  {
    name: 'prevIcon, nextIcon',
    group: 'display',
    type: "Component<PropsOf<'svg'>>",
    default: 'chevrons',
    badge: 'renamed',
    was: 'iconLeft, iconRight',
    description:
      'Components for the icons of the month buttons. They get `iconProps`, and the library styles turn them around in right-to-left layouts.',
    example: '<Calendar prevIcon={ArrowLeft} nextIcon={ArrowRight} />',
  },
  {
    name: 'locale',
    group: 'locale',
    type: 'Locale',
    default: "'en'",
    description:
      "`'en'`, `'es'`, or any BCP 47 tag (`'fr-FR'`). Other languages take their month and weekday names from `Intl`, and need `labels`.",
    example: '<Calendar locale="es" />',
  },
  {
    name: 'labels',
    group: 'locale',
    type: 'Labels | Partial<Labels>',
    default: '–',
    badge: 'new',
    description:
      "The texts `Intl` can't give: the calendar's name and the labels of the buttons. With `en` and `es` they're built in, and `labels` overrides some of them; any other locale needs all of them, and TypeScript asks for them.",
    example: '<Calendar locale="fr-FR" labels={fr} weekStartsOn={1} />',
  },
  {
    name: 'weekStartsOn',
    group: 'locale',
    type: 'WeekDay',
    default: '0',
    badge: 'new',
    description: 'The first column, from `0` (Sunday) to `6`.',
    example: '<Calendar weekStartsOn={1} />',
  },
  {
    name: 'name',
    group: 'forms',
    type: 'string',
    default: '–',
    badge: 'new',
    description:
      'Submits the value with the form around the calendar, in hidden inputs: `name` for a day (empty without one), `name[start]` and `name[end]` for a range, a `name[]` per day for multiple (nothing without days).',
    example: '<form>\n  <Calendar name="due" />\n</form>',
  },
  {
    name: 'autoFocus',
    group: 'forms',
    type: 'boolean',
    default: 'false',
    badge: 'new',
    description:
      'Focuses the day where Tab enters every time the calendar shows up: on load, or when a popover, dialog or details around it opens. Without it, the calendar never takes the focus.',
    example: "<Calendar autoFocus containerProps={{ popover: 'auto' }} />",
  },
  {
    name: 'theme',
    group: 'styling',
    type: 'Theme | Signal<Theme>',
    default: "'light'",
    badge: 'new',
    description:
      "`'light'`, `'dark'` or `'auto'`, which follows `prefers-color-scheme` with CSS only. A signal changes it at runtime.",
    example: '<Calendar theme="auto" />',
  },
  {
    name: 'unstyled',
    group: 'styling',
    type: 'boolean',
    default: 'false',
    badge: 'renamed',
    was: 'unStyled',
    description:
      'Leaves the calendar without the library styles: style it through the props of its parts and its data attributes.',
    example: '<Calendar unstyled />',
  },
  {
    name: 'containerProps',
    group: 'parts',
    type: "Omit<PropsOf<'div'>, 'onChange$'>",
    default: '{}',
    description:
      'The root, a `<div role="group">`. Its `aria-label` names the calendar, followed by the selection. No DOM `onChange$`: the calendar\'s is the value\'s.',
    example:
      "<Calendar containerProps={{ class: 'calendar', 'aria-label': 'Due date' }} />",
  },
  {
    name: 'headerProps',
    group: 'parts',
    type: "PropsOf<'header'>",
    default: '{}',
    description:
      "The `<header>` with the month buttons and the title. With `months`, each month's header, around its title.",
    example: "<Calendar headerProps={{ class: 'header' }} />",
  },
  {
    name: 'navButtonProps',
    group: 'parts',
    type: "PropsOf<'button'>",
    default: '{}',
    badge: 'renamed',
    was: 'actionButtonProps',
    description:
      'Both month buttons. `prevButtonProps` and `nextButtonProps` win over it, and an `onClick$` in both runs both.',
    example: "<Calendar navButtonProps={{ class: 'nav' }} />",
  },
  {
    name: 'prevButtonProps, nextButtonProps',
    group: 'parts',
    type: "PropsOf<'button'>",
    default: '{}',
    badge: 'renamed',
    was: 'actionLeftProps, actionRightProps',
    description: 'The previous and the next button, one each.',
    example: "<Calendar prevButtonProps={{ title: 'Previous' }} />",
  },
  {
    name: 'titleProps',
    group: 'parts',
    type: "PropsOf<'div'>",
    default: '{}',
    description:
      'The title, the live region that announces each month and view. Its `id` names the first grid.',
    example: "<Calendar titleProps={{ class: 'title' }} />",
  },
  {
    name: 'iconProps',
    group: 'parts',
    type: "PropsOf<'svg'>",
    default: '{}',
    description:
      'Both icons: the chevrons, or `prevIcon` and `nextIcon`. The chevrons are `1em` wide, so the text around sizes them.',
    example: "<Calendar iconProps={{ 'stroke-width': 2 }} />",
  },
  {
    name: 'calendarProps',
    group: 'parts',
    type: "PropsOf<'table'>",
    default: '{}',
    description: 'Each days grid, a `<table role="grid">`.',
    example: "<Calendar calendarProps={{ class: 'grid' }} />",
  },
  {
    name: 'theadProps',
    group: 'parts',
    type: "PropsOf<'thead'>",
    default: '{}',
    description: 'The head of the grid, with the weekday names.',
    example: "<Calendar theadProps={{ class: 'weekdays' }} />",
  },
  {
    name: 'theadRowProps',
    group: 'parts',
    type: "PropsOf<'tr'>",
    default: '{}',
    description: 'The row of the weekday names.',
    example: "<Calendar theadRowProps={{ class: 'weekdays-row' }} />",
  },
  {
    name: 'headerCellProps',
    group: 'parts',
    type: "PropsOf<'th'>",
    default: '{}',
    description: 'Each weekday name.',
    example: "<Calendar headerCellProps={{ class: 'weekday' }} />",
  },
  {
    name: 'tbodyProps',
    group: 'parts',
    type: "PropsOf<'tbody'>",
    default: '{}',
    description: 'The body of the grid, with the weeks.',
    example: "<Calendar tbodyProps={{ class: 'weeks' }} />",
  },
  {
    name: 'tbodyRowProps',
    group: 'parts',
    type: "PropsOf<'tr'>",
    default: '{}',
    description:
      'Each week. Rows get `data-direction` after a move, to animate them.',
    example: "<Calendar tbodyRowProps={{ class: 'week' }} />",
  },
  {
    name: 'cellProps',
    group: 'parts',
    type: "PropsOf<'td'>",
    default: '{}',
    description:
      'The cell around each day, with `aria-selected` and `aria-disabled`.',
    example: "<Calendar cellProps={{ class: 'cell' }} />",
  },
  {
    name: 'dayButtonProps',
    group: 'parts',
    type: "PropsOf<'button'>",
    default: '{}',
    description:
      'Each day button: style its states by the data attributes below.',
    example: "<Calendar dayButtonProps={{ class: 'day' }} />",
  },
  {
    name: 'weekNumberProps',
    group: 'parts',
    type: "PropsOf<'td'>",
    default: '{}',
    description: 'Each week number cell, with `showWeekNumber`.',
    example:
      "<Calendar showWeekNumber weekNumberProps={{ class: 'week-number' }} />",
  },
]

const GROUPS: { id: Group; label: string }[] = [
  { id: 'selection', label: 'selection' },
  { id: 'limits', label: 'limits' },
  { id: 'display', label: 'display' },
  { id: 'locale', label: 'locale' },
  { id: 'forms', label: 'forms & focus' },
  { id: 'styling', label: 'styling' },
  { id: 'parts', label: 'props of each part' },
]

const ATTRIBUTES = [
  [
    'data-qwik-date',
    'root',
    "Always, on the styled Calendar. The headless root doesn't have it.",
  ],
  ['data-theme', 'root', 'light, dark or auto, from the theme prop.'],
  ['data-unstyled', 'root', 'With unstyled.'],
  ['data-view', 'root', 'days, months or years: the view on show.'],
  [
    'data-direction',
    'root, rows',
    'next or prev, after each move. None on load.',
  ],
  ['data-value', 'day', 'The day, as YYYY-MM-DD.'],
  ['data-selected', 'day', 'The selected day, or an end of the range.'],
  ['data-range-start', 'day', 'The first day of the range.'],
  ['data-range-end', 'day', 'The last day of the range.'],
  ['data-in-range', 'day', 'The days between the ends.'],
  [
    'data-preview',
    'day',
    'The range a click would make, while the range has no end.',
  ],
  ['data-unavailable', 'day', 'Ruled out by min, max or the disabled days.'],
  ['aria-current="date"', 'day', 'Today.'],
  ['disabled', 'day', "Can't be chosen."],
  ['data-period', 'table', 'The months and the years grids.'],
  [
    'data-month, data-year',
    'month, year',
    "The cell's month (%month%) or year.",
  ],
]

const STYLE_EXAMPLE = `/* a range in your own color */
[data-qwik-date] [data-in-range] { background: #dbeafe; }
[data-qwik-date] :is([data-range-start], [data-range-end]) { background: #2563eb; color: white; }
[data-qwik-date] [data-unavailable] { text-decoration: line-through; }`

const TYPES = `import type { CalendarProps, DateRange, Labels, LocalDate, Locale, Theme, WeekDay } from 'qwik-date';

// a day, without time or timezone: '%today%'
type LocalDate = \`\${number}-\${number}-\${number}\`;

// the value of mode="range": end is null until the second day
type DateRange = { start: LocalDate; end: LocalDate | null };

// 0 is Sunday, as in Date#getDay()
type WeekDay = 0 | 1 | 2 | 3 | 4 | 5 | 6;

type Theme = 'light' | 'dark' | 'auto';
type Locale = 'en' | 'es' | (string & {});

// built in for en and es, required for any other locale
interface Labels {
  calendar: string;
  previousMonth: string;   nextMonth: string;
  previousYear: string;    nextYear: string;
  previousYears: string;   nextYears: string;
  selectedDate: string;    selectedRange: string;   selectedDates: string;
}`

const SIGNATURES = `formatDate(value: LocalDate, locale?: Locale): string            // locale = 'en'
formatDateRange(range: DateRange, locale?: Locale): string     // '…' while end is null`

const LOCALES = ['en', 'es', 'fr', 'de', 'ja']

const Chevron = () => (
  <svg
    class="caret"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path d="m9 18 6-6-6-6" />
  </svg>
)

const Key = (props: { k: string }) => <kbd class="key">{props.k}</kbd>

/** The props, the data attributes, the keyboard, the types and the functions of `qwik-date`. */
export const ApiReference = component$<{ today: LocalDate }>((props) => {
  const query = useSignal('')
  const group = useSignal<Group | 'all'>('all')
  const locale = useSignal('en')
  const today = props.today
  const week = addDays(today, 7)

  const q = query.value.trim().toLowerCase()
  const shown = PROPS.filter(
    (prop) =>
      (group.value === 'all' || prop.group === group.value) &&
      (!q ||
        `${prop.name} ${prop.type} ${prop.description}`
          .toLowerCase()
          .includes(q)),
  )
  const arg = locale.value === 'en' ? '' : `, '${locale.value}'`
  const calls = [
    [`formatDate('${today}'${arg})`, formatDate(today, locale.value)],
    [
      `formatDateRange({ start: '${today}', end: '${week}' }${arg})`,
      formatDateRange({ start: today, end: week }, locale.value),
    ],
    [
      `formatDateRange({ start: '${today}', end: null }${arg})`,
      formatDateRange({ start: today, end: null }, locale.value),
    ],
  ]

  return (
    <>
      <nav class="subnav" aria-label="API sections">
        <a href="#props">
          props <span style="color: var(--muted)">{PROPS.length}</span>
        </a>
        <a href="#data-attributes">
          data attributes{' '}
          <span style="color: var(--muted)">{ATTRIBUTES.length}</span>
        </a>
        <a href="#keyboard">keyboard</a>
        <a href="#types">types</a>
        <a href="#functions">functions</a>
      </nav>

      <H3 id="props">props</H3>
      <p class="p">
        Click a prop for the details and an example.{' '}
        <span class="badge" data-kind="new">
          new
        </span>{' '}
        came in 2.x,{' '}
        <span class="badge" data-kind="renamed">
          renamed
        </span>{' '}
        had another name in 1.x. The headless{' '}
        <code class="c">Calendar.Root</code> takes the same options, except{' '}
        <code class="c">showDaysOfWeek</code>, <code class="c">theme</code>,{' '}
        <code class="c">unstyled</code>, the icons and the props of each part,
        which only the styled <code class="c">Calendar</code> has: the headless
        parts take their props directly.
      </p>
      <div class="tools">
        <label class="filter">
          <svg
            class="i"
            style="width: 14px; height: 14px"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            type="search"
            placeholder="filter props…"
            aria-label="Filter props"
            bind:value={query}
          />
          <span class="mono" style="font-size: 11px">
            {shown.length}/{PROPS.length}
          </span>
        </label>
        <div
          role="group"
          aria-label="Prop groups"
          style="display: flex; flex-wrap: wrap; gap: 6px"
        >
          {[{ id: 'all' as const, label: 'all' }, ...GROUPS].map((item) => (
            <button
              key={item.id}
              type="button"
              class="chip"
              aria-pressed={group.value === item.id}
              onClick$={() => {
                group.value = item.id
              }}
            >
              {item.id}
            </button>
          ))}
        </div>
      </div>

      {GROUPS.map((item) => {
        const props = shown.filter((prop) => prop.group === item.id)
        if (!props.length) return null
        return (
          <div key={item.id}>
            <p class="grp">// {item.label}</p>
            {props.map((prop) => (
              <details
                key={prop.name}
                class="prow"
                id={`prop-${prop.name
                  .split(',')[0]
                  .replace(/[^a-z0-9]+/gi, '-')
                  .toLowerCase()}`}
                open={prop.name === 'mode'}
              >
                <summary class="prow-h">
                  <Chevron />
                  <code class="prop">{prop.name}</code>
                  <code class="ptype">{prop.type}</code>
                  <code class="pdef">{prop.default}</code>
                  {prop.badge ? (
                    <span class="badge" data-kind={prop.badge}>
                      {prop.badge}
                    </span>
                  ) : (
                    <span />
                  )}
                </summary>
                <div class="prow-d">
                  <p>{md(prop.description)}</p>
                  <dl class="facts">
                    <dt>type</dt>
                    <dd>{prop.type}</dd>
                    <dt>default</dt>
                    <dd>{prop.default}</dd>
                    {prop.was && (
                      <>
                        <dt>1.x</dt>
                        <dd style="color: var(--amber)">{prop.was}</dd>
                      </>
                    )}
                  </dl>
                  <pre class="ex">
                    <code>
                      <Tokens code={fillDates(prop.example, today)} />
                    </code>
                  </pre>
                </div>
              </details>
            ))}
          </div>
        )
      })}
      {!shown.length && (
        <p class="empty">
          no props match "{query.value}".{' '}
          <button
            type="button"
            class="link"
            onClick$={() => {
              query.value = ''
              group.value = 'all'
            }}
          >
            clear
          </button>
        </p>
      )}

      <H3 id="data-attributes">data attributes</H3>
      <p class="p">
        The styled <code class="c">Calendar</code> and the headless parts set
        these, so each state can be styled with plain CSS or Tailwind's{' '}
        <code class="c">data-[selected]:</code>.
      </p>
      <div class="scroll">
        <div style="min-width: 560px">
          <div class="attr attr-h">
            <span>attribute</span>
            <span>on</span>
            <span>when</span>
          </div>
          {ATTRIBUTES.map(([name, on, when]) => (
            <div key={name} class="attr">
              <code class="attr-n">{name}</code>
              <span class="mono" style="font-size: 12.5px; color: var(--muted)">
                {on}
              </span>
              <span style="color: var(--fg2)">{fillDates(when, today)}</span>
            </div>
          ))}
        </div>
      </div>
      <Code code={STYLE_EXAMPLE} />

      <H3 id="keyboard">keyboard</H3>
      <p class="p">
        The grid is a single Tab stop, even with several months. Days that can't
        be chosen are skipped.
      </p>
      <p class="grp">// days</p>
      <div class="keys">
        <span>
          <Key k="←" />
          <Key k="→" />
        </span>
        <span>
          The previous or next day. Mirrored in right-to-left layouts.
        </span>
        <span>
          <Key k="↑" />
          <Key k="↓" />
        </span>
        <span>The same weekday, a week before or after.</span>
        <span>
          <Key k="Home" />
          <Key k="End" />
        </span>
        <span>The start or the end of the week.</span>
        <span>
          <Key k="PageUp" />
          <Key k="PageDown" />
        </span>
        <span>
          The same day in the previous or next month, or that month's last day.
        </span>
        <span>
          <Key k="Enter" />
          <Key k="Space" />
        </span>
        <span>Chooses the focused day.</span>
        <span>
          <Key k="Tab" />
        </span>
        <span>
          Enters on the selected day, or on the first one that can be chosen.
        </span>
      </div>
      <p class="grp">// months and years, after clicking the title</p>
      <div class="keys">
        <span>
          <Key k="←" />
          <Key k="→" />
          <Key k="↑" />
          <Key k="↓" />
        </span>
        <span>Move across months or years, past the edges of the page.</span>
        <span>
          <Key k="Enter" />
          <Key k="Space" />
        </span>
        <span>
          Show the days of that month, or of the same month in that year.
        </span>
        <span>
          <Key k="Escape" />
        </span>
        <span>
          Back to the days, with the focus on the title. A popover around stays
          open.
        </span>
      </div>

      <H3 id="types">types</H3>
      <p class="p">
        All exported from <code class="c">qwik-date</code>, along with{' '}
        <code class="c">CalendarProps</code>.
      </p>
      <Code code={fillDates(TYPES, today)} />

      <H3 id="functions">functions</H3>
      <p class="p">
        To show a value in a trigger or a label. They work in any locale, with a
        capital letter on the month.
      </p>
      <Code code={SIGNATURES} />
      <div class="term">
        <div class="repl-h" role="group" aria-label="Locale">
          <span
            class="mono"
            style="margin-right: 6px; font-size: 12px; color: #8b8b90"
          >
            try a locale
          </span>
          {LOCALES.map((id) => (
            <button
              key={id}
              type="button"
              class="lc"
              aria-pressed={locale.value === id}
              onClick$={() => {
                locale.value = id
              }}
            >
              {id}
            </button>
          ))}
        </div>
        <pre class="tpre" aria-live="polite">
          <code>
            {calls.map(([call, result], i) => (
              <span key={i}>
                <span class="pr">{'> '}</span>
                {call}
                {'\n'}
                <span class="out">'{result}'</span>
                {i < calls.length - 1 ? '\n' : ''}
              </span>
            ))}
          </code>
        </pre>
      </div>
    </>
  )
})
