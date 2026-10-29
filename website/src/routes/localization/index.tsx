import { component$, useSignal } from '@qwik.dev/core'
import { Link } from '@qwik.dev/router'
import { Calendar, type Labels, type LocalDate, formatDate } from 'qwik-date'
import type { LocaleOptions } from 'qwik-date/headless'
import { Code } from '~/components/code'
import { H2, Preview, md } from '~/components/docs'
import { docHead } from '~/components/seo'
import { Toc } from '~/components/toc'
import { pageAt } from '~/data/site'

const FR: Labels = {
  calendar: 'Calendrier',
  previousMonth: 'Mois précédent',
  nextMonth: 'Mois suivant',
  previousYear: 'Année précédente',
  nextYear: 'Année suivante',
  previousYears: 'Années précédentes',
  nextYears: 'Années suivantes',
  selectedDate: 'date sélectionnée :',
  selectedRange: 'période sélectionnée :',
  selectedDates: 'dates sélectionnées :',
}

const DE: Labels = {
  calendar: 'Kalender',
  previousMonth: 'Vorheriger Monat',
  nextMonth: 'Nächster Monat',
  previousYear: 'Vorheriges Jahr',
  nextYear: 'Nächstes Jahr',
  previousYears: 'Vorherige Jahre',
  nextYears: 'Nächste Jahre',
  selectedDate: 'ausgewähltes Datum:',
  selectedRange: 'ausgewählter Zeitraum:',
  selectedDates: 'ausgewählte Daten:',
}

const LOCALES = ['en', 'es', 'fr-FR', 'de-DE'] as const
type DemoLocale = (typeof LOCALES)[number]

/** `en` and `es` have their texts; any other locale takes `labels`. */
const localeOptions = (locale: DemoLocale): LocaleOptions =>
  locale === 'en' || locale === 'es'
    ? { locale }
    : { locale, labels: locale === 'fr-FR' ? FR : DE }

const EXAMPLE = `import { Calendar, type Labels } from 'qwik-date';

const fr: Labels = {
  calendar: 'Calendrier',
  previousMonth: 'Mois précédent',
  nextMonth: 'Mois suivant',
  previousYear: 'Année précédente',
  nextYear: 'Année suivante',
  previousYears: 'Années précédentes',
  nextYears: 'Années suivantes',
  selectedDate: 'date sélectionnée :',
  selectedRange: 'période sélectionnée :',
  selectedDates: 'dates sélectionnées :',
};

<Calendar locale="fr-FR" labels={fr} weekStartsOn={1} />;`

const OVERRIDE = `// en and es take some of the texts: the others stay built in
<Calendar locale="es" labels={{ calendar: 'Fecha de entrega' }} />`

const LABELS = [
  ['calendar', "The calendar's accessible name, before the selection."],
  ['previousMonth, nextMonth', 'The month buttons.'],
  [
    'previousYear, nextYear',
    'The same buttons while the months of a year show.',
  ],
  ['previousYears, nextYears', 'The same buttons while twelve years show.'],
  [
    'selectedDate',
    'Between the name and the selected day: `date sélectionnée :`.',
  ],
  [
    'selectedRange, selectedDates',
    'The same, for a range and for `mode="multiple"`.',
  ],
]

export default component$(() => {
  const locale = useSignal<DemoLocale>('fr-FR')
  const monday = useSignal(true)
  const date = useSignal<LocalDate | null>(null)

  const code = [
    `<Calendar locale="${locale.value}"`,
    locale.value.includes('-') ? ' labels={labels}' : '',
    monday.value ? ' weekStartsOn={1}' : '',
    ' bind:value={date} />',
  ].join('')

  return (
    <div class="page">
      <article class="article">
        <h1 class="h1">localization</h1>
        <p class="lead">
          Any language <code class="c">Intl</code> knows, and the first day of
          the week of your users.
        </p>

        <Preview code={code}>
          <div role="group" aria-label="Locale" class="chips">
            {LOCALES.map((id) => (
              <button
                key={id}
                type="button"
                class="chip"
                aria-pressed={locale.value === id}
                onClick$={() => {
                  locale.value = id
                }}
              >
                {id}
              </button>
            ))}
            <button
              type="button"
              class="chip"
              aria-pressed={monday.value}
              onClick$={() => {
                monday.value = !monday.value
              }}
            >
              weekStartsOn={'{1}'}
            </button>
          </div>
          {/* a new calendar for each locale: its names are computed once */}
          <Calendar
            key={`${locale.value}-${monday.value}`}
            {...localeOptions(locale.value)}
            weekStartsOn={monday.value ? 1 : 0}
            bind:value={date}
            theme="auto"
          />
          <p class="cap">
            {date.value
              ? `formatDate(value, '${locale.value}') → '${formatDate(date.value, locale.value)}'`
              : 'pick a day'}
          </p>
        </Preview>

        <H2 id="locale">locale</H2>
        <p class="p">
          <code class="c">en</code> (the default) and <code class="c">es</code>{' '}
          have every text built in. Any other BCP 47 tag,{' '}
          <code class="c">'fr-FR'</code> or <code class="c">'de'</code>, takes
          its month and weekday names from <code class="c">Intl</code>, with a
          capital letter, and needs the other texts in{' '}
          <code class="c">labels</code>: TypeScript asks for them.
        </p>
        <Code code={EXAMPLE} />

        <H2 id="labels">labels</H2>
        <p class="p">
          The texts <code class="c">Intl</code> can't give. Screen readers read
          them: the buttons have no text of their own.
        </p>
        <div style="margin-top: 12px">
          {LABELS.map(([name, what]) => (
            <div key={name} class="ref">
              <code>{name}</code>
              <span>{md(what)}</span>
            </div>
          ))}
        </div>
        <p class="p">
          With <code class="c">en</code> and <code class="c">es</code>,{' '}
          <code class="c">labels</code> takes some of them, and the others stay
          as they are:
        </p>
        <Code code={OVERRIDE} />

        <H2 id="week">first day of the week</H2>
        <p class="p">
          <code class="c">weekStartsOn</code> is the first column, from{' '}
          <code class="c">0</code> (Sunday, the default) to{' '}
          <code class="c">6</code>, as in <code class="c">Date#getDay()</code>.
          It doesn't follow the locale: set it for your users.
        </p>

        <H2 id="formatting">formatting</H2>
        <p class="p">
          <code class="c">formatDate</code> and{' '}
          <code class="c">formatDateRange</code> take the same locales, built in
          or not, for a trigger or a label. Try them in the{' '}
          <Link href="/calendar/#functions">API of the Calendar</Link>.
        </p>

        <div class="pager">
          <Link class="pn" href="/forms/">
            <small>← previous</small>Forms
          </Link>
          <Link class="pn" href="/theming/" style="text-align: right">
            <small>next →</small>Theming
          </Link>
        </div>
      </article>

      <Toc items={pageAt('/localization/').sections} />
    </div>
  )
})

export const head = docHead('/localization/')
