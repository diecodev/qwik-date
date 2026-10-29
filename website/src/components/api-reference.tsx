import { component$, useSignal } from '@qwik.dev/core'
import { type LocalDate, formatDate, formatDateRange } from 'qwik-date'
import { ATTRIBUTES, GROUPS, type Group, PROPS, propAnchor } from '~/data/api'
import { Code, Tokens } from './code'
import { addDays, fillDates } from './dates'
import { H3, md } from './docs'

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
                id={propAnchor(prop.name)}
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
