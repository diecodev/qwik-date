import { type Signal, component$ } from '@qwik.dev/core'
import {
  Calendar,
  type DateRange,
  type LocalDate,
  useCalendar,
} from 'qwik-date/headless'

const Header = () => (
  <header class="hl-head">
    {/* the buttons name themselves: previous month, previous year or previous years, as the view shows */}
    <Calendar.PrevButton class="hl-nav">‹</Calendar.PrevButton>
    <Calendar.Title class="hl-title" />
    <Calendar.NextButton class="hl-nav">›</Calendar.NextButton>
  </header>
)

const Periods = () => (
  <>
    <Calendar.MonthGrid buttonProps={{ class: 'hl-period' }} />
    <Calendar.YearGrid buttonProps={{ class: 'hl-period' }} />
  </>
)

/** The headless parts, styled by the site: square days, a blue range, today underlined. */
export const HeadlessDemo = component$<{
  'bind:value': Signal<DateRange | null>
}>((props) => (
  <Calendar.Root mode="range" bind:value={props['bind:value']} class="hl">
    <Header />
    <Calendar.Grid>
      <Calendar.GridHead cellProps={{ class: 'hl-wd' }} />
      <Calendar.GridBody dayProps={{ class: 'hl-day' }} />
    </Calendar.Grid>
    <Periods />
  </Calendar.Root>
))

/** The rows of the days, rendered with `useCalendar()`: a dot under the days with events. */
const EventDays = component$<{ events: LocalDate[] }>((props) => {
  const calendar = useCalendar()

  return (
    <tbody>
      {calendar.grids.value[0].weeks.map((week) => (
        <tr key={week.number}>
          {week.days.map((day, i) => (
            <Calendar.Cell key={day?.date ?? i} day={day?.date}>
              {day && (
                <Calendar.Day day={day.date} class="hl-day">
                  {day.date.slice(8)}
                  <span
                    class="hl-dot"
                    data-on={props.events.includes(day.date) || undefined}
                  />
                </Calendar.Day>
              )}
            </Calendar.Cell>
          ))}
        </tr>
      ))}
    </tbody>
  )
})

export const EventsDemo = component$<{
  'bind:value': Signal<LocalDate | null>
  events: LocalDate[]
}>((props) => (
  <Calendar.Root bind:value={props['bind:value']} class="hl">
    <Header />
    <Calendar.Grid>
      <Calendar.GridHead cellProps={{ class: 'hl-wd' }} />
      <EventDays events={props.events} />
    </Calendar.Grid>
    <Periods />
  </Calendar.Root>
))
