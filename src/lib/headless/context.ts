import { type QRL, type Signal, createContextId, useContext } from '@qwik.dev/core';
import type { CalendarGrid, CalendarPeriod, CalendarView, DateRange, Labels, LocalDate, Mode, Month } from '../core';

/** The state and the handlers of a `Calendar.Root`, as `useCalendar()` gives them. Everything in it serializes. */
export interface CalendarState<V extends LocalDate | DateRange | LocalDate[] = LocalDate | DateRange | LocalDate[]> {
  /** the selected value: the `bind:value` signal, or one of its own (`[]` for none with `mode="multiple"`) */
  value: Signal<V | null>;
  /** `single`, `range` or `multiple` */
  mode: Readonly<Signal<Mode>>;
  /**
   * while a range has a start and no end, the range a choice of the day under the pointer or the focus would make
   * (the days of the grids have `preview`), or `null`
   */
  preview: Readonly<Signal<DateRange | null>>;
  /** the month on show */
  month: Readonly<Signal<{ year: number; month: Month }>>;
  /** the days of the month, the months of a year (a click on the title), or twelve years */
  view: Readonly<Signal<CalendarView>>;
  /** the title of the view: "August 2024", "2024", "2016 – 2027" */
  title: Readonly<Signal<string>>;
  /** the months on show, with the state of each day */
  grids: Readonly<Signal<CalendarGrid[]>>;
  /** the months of the year on show in the months view */
  monthCells: Readonly<Signal<CalendarPeriod[]>>;
  /** the twelve years on show in the years view */
  yearCells: Readonly<Signal<CalendarPeriod[]>>;
  /** the visitor's day */
  today: Readonly<Signal<LocalDate>>;
  /** where Tab enters the grid: the day keeping the focus, or the first one of the month that can be chosen */
  tabDay: Readonly<Signal<LocalDate | null>>;
  /** whether `prev$` can go back: a month, a year or twelve years, as the view shows, with days `min` allows */
  canGoBack: Readonly<Signal<boolean>>;
  /** the same for `next$` and `max` */
  canGoForward: Readonly<Signal<boolean>>;
  /** the weekday names in column order: `short` for the header, `long` for its accessible name */
  weekdays: Readonly<Signal<{ long: string; short: string }[]>>;
  /** the texts of the locale, with the `labels` given */
  labels: Readonly<Signal<Labels>>;
  /** chooses a day, as a click on it does: ignored when it can't be chosen */
  select$: QRL<(day: LocalDate) => void>;
  /** previews the range up to a day, as the pointer or the focus on it does; `null` for no preview */
  setPreview$: QRL<(day: LocalDate | null) => void>;
  /** shows the previous month, year or twelve years, as the view shows: ignored at `min` */
  prev$: QRL<() => void>;
  /** the same, forward: ignored at `max` */
  next$: QRL<() => void>;
  /** shows a view: the months and years open on the month on show, with the focus on it */
  setView$: QRL<(view: CalendarView) => void>;
  /** shows the days of a month, as a click on it in the months view does: ignored past `min` or `max` */
  chooseMonth$: QRL<(year: number, month: Month) => void>;
  /** shows the days of the same month of a year (or of the limit it's past), as a click on it does */
  chooseYear$: QRL<(year: number) => void>;
}

/** What the parts share besides the public state. */
export interface CalendarContext extends CalendarState {
  /** the id of the title, which names the grid */
  titleId: string;
  showWeekNumber: Readonly<Signal<boolean>>;
  /** the title button: days, months, years, and back */
  toggleView$: QRL<() => void>;
  /** the grid's pointerover and focusin: the day to preview */
  previewTarget$: QRL<(event: Event, grid: HTMLElement) => void>;
  /** the grid's pointerleave and focusout: no preview */
  previewEnd$: QRL<(event: Event, grid: HTMLElement) => void>;
  /** a month or year button's click */
  pickPeriod$: QRL<(event: Event, button: HTMLElement) => void>;
  /** the months and years grids' keys */
  periodKeyDown$: QRL<(event: KeyboardEvent, grid: HTMLElement) => void>;
  /** a day button's click: chooses the day of its `data-value` */
  pick$: QRL<(event: Event, button: HTMLElement) => void>;
  /** the grid keys, from a day */
  keyDown$: QRL<(event: KeyboardEvent, grid: HTMLElement) => void>;
}

export const CalendarContextId = createContextId<CalendarContext>('qwik-date.calendar');

/**
 * The state and the handlers of the `Calendar.Root` around, to render parts of your own (cells with prices, a
 * readout…). Call it in a component inside the root: Qwik's context only reaches its descendants. The value takes
 * the type of the mode: `useCalendar<DateRange>()`, `useCalendar<LocalDate[]>()`.
 */
export const useCalendar = <V extends LocalDate | DateRange | LocalDate[] = LocalDate | DateRange | LocalDate[]>() =>
  useContext(CalendarContextId) as unknown as CalendarState<V>;
