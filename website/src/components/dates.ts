import { useSignal, useVisibleTask$ } from '@qwik.dev/core'
import type { LocalDate } from 'qwik-date'

/** A day as `YYYY-MM-DD` in local time (`toISOString` would give the UTC day). */
export const localDate = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}` as LocalDate

const parse = (day: LocalDate) => {
  const [year, month, date] = day.split('-').map(Number)
  return new Date(year, month - 1, date)
}

export const addDays = (day: LocalDate, days: number) => {
  const date = parse(day)
  date.setDate(date.getDate() + days)
  return localDate(date)
}

/** The first day from Monday to Friday after `day`. */
export const nextWeekday = (day: LocalDate) => {
  let next = addDays(day, 1)
  while ([0, 6].includes(parse(next).getDay())) next = addDays(next, 1)
  return next
}

/** The next `MM-DD` from `day` on: this year's, or next year's once it's past. */
const nextOf = (day: LocalDate, monthDay: string) => {
  const year = Number(day.slice(0, 4))
  const thisYear = `${year}-${monthDay}` as LocalDate
  return thisYear >= day ? thisYear : (`${year + 1}-${monthDay}` as LocalDate)
}

/** Puts the dates of the examples, all counted from `today`, in place of their `%tokens%`. */
export const fillDates = (text: string, today: LocalDate) =>
  text
    .replaceAll('%today%', today)
    .replaceAll('%week%', addDays(today, 7))
    .replaceAll('%max%', addDays(today, 90))
    .replaceAll('%christmas%', nextOf(today, '12-25'))
    .replaceAll('%new-year%', nextOf(today, '01-01'))
    .replaceAll('%month%', today.slice(0, 7))

/**
 * Today, for the examples to start on: the build's day in the static HTML, then the visitor's once the page
 * runs, as the calendar does with its own today.
 */
export const useToday = () => {
  const today = useSignal(localDate(new Date()))

  useVisibleTask$(
    () => {
      const visitor = localDate(new Date())
      if (visitor !== today.value) today.value = visitor
    },
    { strategy: 'document-ready' },
  )

  return today
}
