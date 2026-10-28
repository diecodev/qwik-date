import { type QRL, type Signal, createContextId, useContext } from '@qwik.dev/core';
import type { CalendarGrid, DateRange, Labels, LocalDate, Month } from '../core';

/** The state and the handlers of a `Calendar.Root`, as `useCalendar()` gives them. Everything in it serializes. */
export interface CalendarState<V extends LocalDate | DateRange = LocalDate | DateRange> {
  /** the selected value: the `bind:value` signal, or one of its own */
  value: Signal<V | null>;
  /** the month on show */
  month: Readonly<Signal<{ year: number; month: Month }>>;
  /** the months on show, with the state of each day */
  grids: Readonly<Signal<CalendarGrid[]>>;
  /** the visitor's day */
  today: Readonly<Signal<LocalDate>>;
  /** where Tab enters the grid: the day keeping the focus, or the first one of the month that can be chosen */
  tabDay: Readonly<Signal<LocalDate | null>>;
  /** whether the month before the one on show has days `min` allows */
  canGoBack: Readonly<Signal<boolean>>;
  /** whether the month after the one on show has days `max` allows */
  canGoForward: Readonly<Signal<boolean>>;
  /** the weekday names in column order: `short` for the header, `long` for its accessible name */
  weekdays: Readonly<Signal<{ long: string; short: string }[]>>;
  /** the texts of the locale, with the `labels` given */
  labels: Readonly<Signal<Labels>>;
  /** chooses a day, as a click on it does: ignored when it can't be chosen */
  select$: QRL<(day: LocalDate) => void>;
  /** shows the previous month: ignored at `min` */
  prevMonth$: QRL<() => void>;
  /** shows the next month: ignored at `max` */
  nextMonth$: QRL<() => void>;
}

/** What the parts share besides the public state. */
export interface CalendarContext extends CalendarState {
  /** the id of the title, which names the grid */
  titleId: string;
  showWeekNumber: Readonly<Signal<boolean>>;
  /** a day button's click: chooses the day of its `data-value` */
  pick$: QRL<(event: Event, button: HTMLElement) => void>;
  /** the grid keys, from a day */
  keyDown$: QRL<(event: KeyboardEvent, grid: HTMLElement) => void>;
}

export const CalendarContextId = createContextId<CalendarContext>('qwik-date.calendar');

/**
 * The state and the handlers of the `Calendar.Root` around, to render parts of your own (cells with prices, a
 * readout…). Call it in a component inside the root: Qwik's context only reaches its descendants. The value takes
 * the type of the mode: `useCalendar<DateRange>()`.
 */
export const useCalendar = <V extends LocalDate | DateRange = LocalDate | DateRange>() =>
  useContext(CalendarContextId) as unknown as CalendarState<V>;
