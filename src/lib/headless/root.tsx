import {
  $,
  type PropsOf,
  type QRL,
  type Signal,
  Slot,
  component$,
  sync$,
  useComputed$,
  useContextProvider,
  useId,
  useSignal,
  useTask$,
  useVisibleTask$,
} from '@qwik.dev/core';
import {
  type Availability,
  type BuiltInLocale,
  type CalendarValue,
  type CalendarView,
  type DateRange,
  type Direction,
  type GridKey,
  type Labels,
  type LocalDate,
  type Locale,
  type Mode,
  type Month,
  type PeriodKey,
  type WeekDay,
  YEARS_PER_PAGE,
  type YearMonth,
  calendarGrid,
  canStep,
  clampDay,
  clampMonth,
  clampYear,
  daysArrGenerator,
  firstShownFor,
  isMonthInLimits,
  isPageInLimits,
  isShown,
  isUnavailable,
  isValidLocalDate,
  isValidValue,
  isYearInLimits,
  keyTarget,
  monthCells,
  nearestAvailable,
  nextValue,
  openingDay,
  periodKeyTarget,
  previewRange,
  resolveLabels,
  sameDayIn,
  selectionLabel,
  shiftMonth,
  shownMonths,
  stepDirection,
  tabDayOfMonths,
  toLocalDateString,
  viewTitle,
  weekdayNames,
  yearCells,
  yearPageStart,
} from '../core';
import { CalendarContextId } from './context';

/** `en` and `es` have built-in texts (`labels` overrides some of them); any other locale needs all of them. */
export type LocaleOptions = { locale?: BuiltInLocale; labels?: Partial<Labels> } | { locale: Locale; labels: Labels };

/** `mode="single"` (the default) selects a day, `mode="range"` a start and an end. */
export type ModeOptions =
  | {
      mode?: 'single';
      /** the selected day, `null` (the default) for none */
      value?: LocalDate | null;
      'bind:value'?: Signal<LocalDate | null>;
      onChange$?: QRL<(value: LocalDate) => void>;
    }
  | {
      mode: 'range';
      /** the selected range, `null` (the default) for none; `end` is `null` until it's chosen */
      value?: DateRange | null;
      'bind:value'?: Signal<DateRange | null>;
      /** called on every choice: with `end: null` after the first day */
      onChange$?: QRL<(value: DateRange) => void>;
    }
  | {
      mode: 'multiple';
      /** the selected days, `[]` (the default) for none: a click or Enter marks a day, and unmarks it */
      value?: LocalDate[];
      'bind:value'?: Signal<LocalDate[]>;
      /** called on every change, with the days in order */
      onChange$?: QRL<(value: LocalDate[]) => void>;
    };

interface BaseOptions extends Availability {
  /**
   * submits the value with the form around the calendar, in a hidden input with this name (`YYYY-MM-DD`, empty
   * without a value); a range submits `name[start]` and `name[end]`
   */
  name?: string;
  /**
   * focuses the day where Tab enters the grid every time the calendar shows up: on load or once mounted if it's
   * visible, and when a popover, dialog or details around it opens
   */
  autoFocus?: boolean;
  /** the first column: 0 for Sunday (the default), 1 for Monday... */
  weekStartsOn?: WeekDay;
  /** the days of the adjacent months fill the first and the last week (disabled), and every month has six */
  fullWeeks?: boolean;
  /** a column with the ISO week number of each row */
  showWeekNumber?: boolean;
  /** how many months show side by side (1 by default): the buttons move one month */
  months?: number;
}

/** What a calendar does, apart from how it looks: the props of `Calendar.Root`, and of the styled `Calendar`. */
export type CalendarOptions = BaseOptions & ModeOptions & LocaleOptions;

/** The options and the props of its `<div>`: `aria-label` names the calendar, and the selection follows it. */
export type RootProps = CalendarOptions & Omit<PropsOf<'div'>, 'onChange$'>;

const ACTION_KEYS = [
  'enter',
  ' ',
  'arrowup',
  'arrowdown',
  'arrowleft',
  'arrowright',
  'home',
  'end',
  'pageup',
  'pagedown',
] as const;

/** Where each grid key looks for a day that can be chosen when it lands on one that can't. */
const KEY_DIRECTIONS: Record<GridKey, 1 | -1> = {
  arrowright: 1,
  arrowdown: 1,
  pagedown: 1,
  arrowleft: -1,
  arrowup: -1,
  pageup: -1,
  // towards the day the key was pressed on, inside the row
  home: 1,
  end: -1,
};

/**
 * `autoFocus`: focuses the day where Tab enters the grid once the calendar shows up (`qinit`: on load, or once
 * mounted), and when a popover, dialog or details around it opens (`toggle` doesn't bubble: the document gets it
 * while capturing). sync$, so the focus moves along with the opening instead of once a chunk loads, and defined
 * once: a new handler on each render would fire `qinit` again.
 */
const focusTabDay = sync$((event: Event, root: HTMLElement) => {
  const opened = (event as Event & { newState?: string }).newState === 'open' && (event.target as Node).contains(root);
  if ((event.type === 'qinit' || opened) && root.checkVisibility())
    root.querySelector<HTMLElement>(':is([data-value], [data-month], [data-year])[tabindex="0"]')?.focus();
});

/** The signals of a calendar: the handlers pass them to the helpers below, with the props they read. */
interface State {
  selected: Signal<CalendarValue>;
  chosen: Signal<CalendarValue>;
  yearToRender: Signal<number>;
  monthToRender: Signal<Month>;
  dateToFocus: Signal<LocalDate>;
  focusDayOnMonthChange: Signal<boolean>;
  view: Signal<CalendarView>;
  /** the focused cell of the months and years grids */
  periodFocus: Signal<YearMonth>;
  /** where the calendar last moved, for animations */
  direction: Signal<Direction | null>;
  rootRef: Signal<HTMLDivElement | undefined>;
}

/**
 * Shows the months from `first` on, and keeps the direction of the move with it: both change before any render,
 * so the new grids are created with their direction.
 */
const showMonth = (state: State, first: YearMonth) => {
  const position = ({ year, month }: YearMonth) => year * 12 + +month - 1;
  const from = { year: state.yearToRender.value, month: state.monthToRender.value };
  state.direction.value = stepDirection(position(from), position(first)) ?? state.direction.value;
  state.yearToRender.value = first.year;
  state.monthToRender.value = first.month;
};

/** Focuses a cell of the months or years grid, with the direction of the move: a year, or a page of years. */
const focusPeriod = (state: State, target: YearMonth) => {
  const position = ({ year }: YearMonth) => (state.view.value === 'years' ? yearPageStart(year) : year);
  state.direction.value = stepDirection(position(state.periodFocus.value), position(target)) ?? state.direction.value;
  state.periodFocus.value = target;
};

const observers = new WeakMap<Element, MutationObserver>();
/** The time of the last pointer or focus event that set a calendar's preview. */
const previewTimes = new WeakMap<Element, number>();

/**
 * Focuses what `selector` finds in `root`, once it's there: a view or a month renders after the handler that shows
 * it. A newer call replaces a pending one.
 */
const focusWhenReady = (root: Element | undefined, selector: string) => {
  if (!root) return;
  observers.get(root)?.disconnect();
  // the first one that takes the focus: Qwik keeps the days of a hidden grid in a <q:template>, where they can't
  const focus = () =>
    [...root.querySelectorAll<HTMLElement>(selector)].some((element) => {
      element.focus();
      return document.activeElement === element;
    });
  if (focus()) return;

  const observer = new MutationObserver(() => focus() && observer.disconnect());
  observers.set(root, observer);
  observer.observe(root, {
    subtree: true,
    childList: true,
    attributeFilter: ['data-value', 'data-month', 'data-year', 'tabindex', 'disabled'],
  });
  setTimeout(() => observer.disconnect(), 2000);
};

/** The day where Tab enters the months on show, as a selector: the day itself, the grid may still show the month before. */
const tabDaySelector = (first: YearMonth, count: number, focus: LocalDate, availability: Availability) =>
  `[data-value="${tabDayOfMonths(shownMonths(first, count), focus, availability)}"]`;

/** A cell of the months or years grid. */
const periodSelector = (view: CalendarView, { year, month }: YearMonth) =>
  view === 'months' ? `[data-month="${year}-${month}"]` : `[data-year="${year}"]`;

/**
 * Shows the months one month away, unless `min` or `max` rule out the new one (forward, the one after the last on
 * show): Tab enters on the first day.
 */
const moveMonth = (delta: 1 | -1, state: State, limits: Availability, count: number) => {
  const shown = (offset: number) => shiftMonth(state.yearToRender.value, state.monthToRender.value, offset);
  const coming = shown(delta < 0 ? -1 : count);
  if (!isMonthInLimits(coming.year, coming.month, limits)) return;
  const { year, month } = shown(delta);
  // the month buttons keep the focus, so they can be pressed repeatedly
  state.focusDayOnMonthChange.value = false;
  showMonth(state, { year, month: month as Month });
  state.dateToFocus.value = `${year}-${month}-01` as LocalDate;
};

/** The previous (`-1`) or next (`1`) button: a month, a year or twelve years away, as the view shows. */
const step = (delta: 1 | -1, state: State, limits: Availability, count: number) => {
  const { view, periodFocus } = state;
  if (view.value === 'days') return moveMonth(delta, state, limits, count);
  const { year, month } = periodFocus.value;
  if (view.value === 'months') {
    if (isYearInLimits(year + delta, limits)) focusPeriod(state, clampMonth(year + delta, month, limits));
    return;
  }
  if (isPageInLimits(yearPageStart(year) + delta * YEARS_PER_PAGE, limits))
    focusPeriod(state, { year: clampYear(year + delta * YEARS_PER_PAGE, limits), month });
};

/** Shows a view: the months and years grids open on the month on show, with the focus on it. */
const setView = (next: CalendarView, state: State) => {
  if (state.view.value === 'days' && next !== 'days')
    state.periodFocus.value = { year: state.yearToRender.value, month: state.monthToRender.value };
  state.view.value = next;
  if (next !== 'days') focusWhenReady(state.rootRef.value, periodSelector(next, state.periodFocus.value));
};

/** Back to the days, of the month chosen in the months or years grid: the focus goes to the same day of it. */
const showDays = (shown: YearMonth, state: State, availability: Availability, count: number) => {
  state.focusDayOnMonthChange.value = false;
  showMonth(state, shown);
  state.dateToFocus.value = sameDayIn(state.dateToFocus.value, shown);
  state.view.value = 'days';
  // where Tab enters: that day, or the first one of the month that can be chosen
  focusWhenReady(state.rootRef.value, tabDaySelector(shown, count, state.dateToFocus.value, availability));
};

const chooseMonth = (year: number, month: Month, state: State, availability: Availability, count: number) => {
  if (isMonthInLimits(year, month, availability)) showDays({ year, month }, state, availability, count);
};

/** A year shows the same month of it, or the month of the limit it's past. */
const chooseYear = (year: number, state: State, availability: Availability, count: number) => {
  if (isYearInLimits(year, availability))
    showDays(clampMonth(year, state.monthToRender.value, availability), state, availability, count);
};

/** Chooses `day` (the new value, where Tab enters, `onChange$`), unless it can't be chosen. */
const choose = (
  day: LocalDate,
  mode: Mode,
  availability: Availability,
  { selected, chosen, dateToFocus }: State,
  onChange$: ModeOptions['onChange$'],
) => {
  if (!isValidLocalDate(day) || isUnavailable(day, availability)) return;

  const next = nextValue(mode, selected.value, day, availability);
  chosen.value = next;
  selected.value = next;
  // Tab (and autoFocus) enters on the day chosen last
  dateToFocus.value = day;
  // the type of the value follows `mode`
  (onChange$ as QRL<(value: LocalDate | DateRange | LocalDate[]) => void> | undefined)?.(next);
};

const PERIOD_KEYS = ['enter', ' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'];

/**
 * Escape goes back to the days from the months or the years, and keeps a popover around the calendar open: sync$
 * (the default action can't wait for a chunk), so it reads the view from the DOM.
 */
const keepOpen = sync$((e: KeyboardEvent, root: HTMLElement) => {
  if (e.key === 'Escape' && root.getAttribute('data-view') !== 'days') e.preventDefault();
});

/** The calendar's state and its `<div>`: the other parts go inside, and read the state through the context. */
export const Root = component$<RootProps>(
  ({
    mode = 'single',
    value: valueProp = null,
    'bind:value': bound,
    onChange$,
    min,
    max,
    disabledDates,
    disabledWeekdays,
    name,
    autoFocus,
    weekStartsOn = 0,
    fullWeeks = false,
    showWeekNumber = false,
    months = 1,
    locale = 'en',
    labels: labelsProp,
    'aria-label': ariaLabel,
    onKeyDown$,
    ...props
  }) => {
    // signals
    const valueSignal = useSignal<CalendarValue>(valueProp ?? (mode === 'multiple' ? [] : null));
    const selected = (bound ?? valueSignal) as Signal<CalendarValue>;
    // the value of the last choice in the grid: the calendar already shows its month (the end of a range can
    // be chosen in the month after the start's, the calendar must stay there)
    const chosen = useSignal<CalendarValue>(null);
    // the day where the component rendered: with SSR that's the server's, the visible task below switches it
    const today = useSignal(toLocalDateString(new Date()) as LocalDate);
    // the calendar opens on the selected day (the start of a range), or on today without one (on the limit it's
    // past, with min or max)
    const initial = openingDay(selected.value) ?? clampDay(today.value, { min, max });
    const monthToRender = useSignal<Month>(initial.split('-')[1] as Month);
    const yearToRender = useSignal<number>(+initial.split('-')[0]);
    const dateToFocus = useSignal<LocalDate>(initial);
    const focusDayOnMonthChange = useSignal(false);
    const rootRef = useSignal<HTMLDivElement>();
    // the day under the pointer or the focus, for the preview of a range that has no end yet
    const previewDay = useSignal<LocalDate | null>(null);
    const view = useSignal<CalendarView>('days');
    const periodFocus = useSignal<YearMonth>({ year: +initial.split('-')[0], month: initial.split('-')[1] as Month });
    // where the calendar last moved, for animations: none until the first move
    const direction = useSignal<Direction | null>(null);
    const state: State = {
      selected,
      chosen,
      yearToRender,
      monthToRender,
      dateToFocus,
      focusDayOnMonthChange,
      view,
      periodFocus,
      direction,
      rootRef,
    };
    // the grid is named after the month title (`role="grid"` requires a name)
    const titleId = `qwik-date-${useId()}-title`;

    // computed: they read the props, so they follow them. The handlers below read the props too, never a
    // computed: one that isn't computed yet can't be read synchronously
    const datesArray = useComputed$(() =>
      daysArrGenerator({
        month: monthToRender.value,
        year: yearToRender.value.toString(),
        fullWeeks,
        weekStartsOn,
      }),
    );
    const month = useComputed$(() => ({ year: yearToRender.value, month: monthToRender.value }));
    // a single Tab stop for all the grids
    const tabDay = useComputed$(() =>
      tabDayOfMonths(shownMonths(month.value, months), dateToFocus.value, {
        min,
        max,
        disabledDates,
        disabledWeekdays,
      }),
    );
    const preview = useComputed$(() =>
      previewRange(selected.value, previewDay.value, { min, max, disabledDates, disabledWeekdays }),
    );
    const modeSignal = useComputed$(() => mode);
    const grids = useComputed$(
      () =>
        shownMonths(month.value, months).map(({ year, month }) =>
          calendarGrid({
            year,
            month,
            value: selected.value,
            today: today.value,
            tabDay: tabDay.value,
            locale,
            weekStartsOn,
            fullWeeks,
            availability: { min, max, disabledDates, disabledWeekdays },
            preview: preview.value,
          }),
        ),
      // the HTML already shows it, and it would weigh ~16 KB in the state: the client computes it when it renders
      { serializationStrategy: 'never' },
    );
    const labels = useComputed$(() => resolveLabels(locale, labelsProp));
    const weekdays = useComputed$(() => weekdayNames(locale, weekStartsOn));
    const canGoBack = useComputed$(() => canStep(-1, view.value, month.value, periodFocus.value, { min, max }, months));
    const canGoForward = useComputed$(() =>
      canStep(1, view.value, month.value, periodFocus.value, { min, max }, months),
    );
    const title = useComputed$(() => viewTitle(view.value, month.value, periodFocus.value, locale));
    const monthCellsSignal = useComputed$(() =>
      monthCells({
        focus: periodFocus.value,
        value: selected.value,
        today: today.value,
        locale,
        availability: { min, max },
      }),
    );
    const years = useComputed$(() =>
      yearCells({
        focus: periodFocus.value,
        value: selected.value,
        today: today.value,
        locale,
        availability: { min, max },
      }),
    );
    const weekNumbers = useComputed$(() => showWeekNumber);
    const label = useComputed$(() => {
      const selection = selectionLabel(selected.value, locale, labels.value);
      const base = ariaLabel ?? labels.value.calendar;
      return selection ? `${base}, ${selection}` : base;
    });

    if (selected.value !== null && !isValidValue(selected.value))
      throw new Error(
        'Invalid value in Calendar. Please use existing dates in YYYY-MM-DD format (a range ends after it starts).',
      );

    // show the selected day (the start of a range) when the value changes from outside, e.g. a parent writes
    // to `bind:value`
    useTask$(({ track }) => {
      const value = track(() => selected.value);
      const day = openingDay(value);
      if (value === null || day === null || value === chosen.value || !isValidValue(value)) return;

      const first = firstShownFor(day, { year: yearToRender.value, month: monthToRender.value }, months);
      view.value = 'days';
      showMonth(state, first);
      dateToFocus.value = day;
    });

    // "today" is the visitor's day, not the server's (frozen at build time with SSG); without a selected day
    // the calendar opened on today's month, so it moves to the visitor's one too
    useVisibleTask$(() => {
      const visitorToday = toLocalDateString(new Date()) as LocalDate;
      if (today.value === visitorToday) return;

      today.value = visitorToday;
      if (openingDay(selected.value)) return;
      // a day `autoFocus` focused on load follows the move
      const focused = document.activeElement;
      if (focused?.closest('[data-value]') && rootRef.value?.contains(focused)) focusDayOnMonthChange.value = true;
      const opening = clampDay(visitorToday, { min, max });
      const [year, month] = opening.split('-');
      monthToRender.value = month as Month;
      yearToRender.value = +year;
      dateToFocus.value = opening;
    });

    useVisibleTask$(({ track, cleanup }) => {
      track(() => datesArray.value);

      // only move the focus when the month changed through keyboard navigation in the grid: not on
      // the first run (the calendar just became visible, the page would load with a focused day) and
      // not after the month buttons, which keep the focus so they can be pressed repeatedly
      const root = rootRef.value;
      const date = dateToFocus.value;
      const first = { year: yearToRender.value, month: monthToRender.value };
      if (!focusDayOnMonthChange.value || !root || !isShown(date, first, months)) return;

      // the days render apart from this task (GridBody, or rows of your own), maybe after it: focus the day once
      // it's there and enabled (with fullWeeks, the month before showed it as a disabled day of the next one)
      const find = () => root.querySelector<HTMLElement>(`[data-value="${date}"]:not([disabled])`);
      const focus = (day: HTMLElement) => {
        day.focus();
        day.setAttribute('tabindex', '0');
      };
      const day = find();
      const observer = new MutationObserver(() => {
        const day = find();
        if (!day) return;
        observer.disconnect();
        focus(day);
      });
      if (day) focus(day);
      else observer.observe(root, { subtree: true, childList: true, attributeFilter: ['disabled', 'data-value'] });

      cleanup(() => {
        observer.disconnect();
        const day = root.querySelector<HTMLElement>(`[data-value="${date}"]`);
        day?.setAttribute('tabindex', '-1');
        day?.blur();
      });
    });

    // handlers
    const select$ = $((day: LocalDate) =>
      choose(day, mode, { min, max, disabledDates, disabledWeekdays }, state, onChange$),
    );
    // one handler for every day button, so they don't each serialize their own
    const pick$ = $((_: Event, button: HTMLElement) =>
      choose(
        button.getAttribute('data-value') as LocalDate,
        mode,
        { min, max, disabledDates, disabledWeekdays },
        state,
        onChange$,
      ),
    );
    const prev$ = $(() => step(-1, state, { min, max }, months));
    const next$ = $(() => step(1, state, { min, max }, months));
    const setView$ = $((next: CalendarView) => setView(next, state));
    // the title: days, months, years, and back to the days
    const toggleView$ = $(() =>
      setView(view.value === 'days' ? 'months' : view.value === 'months' ? 'years' : 'days', state),
    );
    const chooseMonth$ = $((year: number, month: Month) =>
      chooseMonth(year, month, state, { min, max, disabledDates, disabledWeekdays }, months),
    );
    const chooseYear$ = $((year: number) =>
      chooseYear(year, state, { min, max, disabledDates, disabledWeekdays }, months),
    );
    // one handler for every month and year button
    const pickPeriod$ = $((_: Event, button: HTMLElement) => {
      const availability = { min, max, disabledDates, disabledWeekdays };
      const month = button.getAttribute('data-month');
      if (month) chooseMonth(+month.slice(0, 4), month.slice(5, 7) as Month, state, availability, months);
      else chooseYear(Number(button.getAttribute('data-year')), state, availability, months);
    });
    // the months and years grids: arrows, and Enter or Space to choose
    const periodKeyDown$ = $((e: KeyboardEvent, grid: HTMLElement) => {
      const key = e.key.toLowerCase();
      const current = view.value;
      if (
        current === 'days' ||
        !PERIOD_KEYS.includes(key) ||
        !(e.target as Element).closest('[data-month], [data-year]')
      )
        return;

      const availability = { min, max, disabledDates, disabledWeekdays };
      // as in the days: the focused cell, unless an earlier key moved to a year or a page that isn't rendered
      // yet (the state, set synchronously by each key, doesn't lag behind)
      const focus = periodFocus.value;
      const active = grid.contains(document.activeElement) ? document.activeElement : null;
      const activeMonth = active?.getAttribute('data-month');
      const activeYear = Number(active?.getAttribute('data-year'));
      const from: YearMonth =
        current === 'months' && activeMonth?.startsWith(`${focus.year}-`)
          ? { year: focus.year, month: activeMonth.slice(5, 7) as Month }
          : current === 'years' && activeYear && yearPageStart(activeYear) === yearPageStart(focus.year)
            ? { year: activeYear, month: focus.month }
            : focus;

      if (key === 'enter' || key === ' ') {
        if (current === 'months') chooseMonth(from.year, from.month, state, availability, months);
        else chooseYear(from.year, state, availability, months);
        return;
      }
      // in right-to-left layouts the rows are mirrored, so left/right follow the visual direction
      const mirrored: Record<string, PeriodKey> = { arrowleft: 'arrowright', arrowright: 'arrowleft' };
      const periodKey = (getComputedStyle(grid).direction === 'rtl' ? mirrored[key] ?? key : key) as PeriodKey;
      // stay put past min or max
      const target = periodKeyTarget(current, from, periodKey, availability) ?? from;
      focusPeriod(state, target);
      focusWhenReady(rootRef.value, periodSelector(current, target));
    });
    const setPreview$ = $((day: LocalDate | null) => {
      previewDay.value = day;
    });
    // the grids' pointerover, pointerleave, focusin and focusout: the day to preview is the one under the pointer
    // (for the pointer's events) or the focused one (for the focus's), or else the other, in any grid of the
    // calendar; between two days, the pointer keeps the last one. These handlers load lazily, and an earlier
    // event's (of another grid, maybe) can run after a later one's: the latest event wins, and it reads what's
    // hovered or focused now
    const previewSync$ = $((e: Event) => {
      const root = rootRef.value;
      if (!root || e.timeStamp < (previewTimes.get(root) ?? 0)) return;
      previewTimes.set(root, e.timeStamp);
      const hovered = root.querySelector('[data-value]:not([disabled]):hover')?.getAttribute('data-value');
      const active = document.activeElement;
      const focused =
        active?.matches('[data-value]') && root.contains(active) ? active.getAttribute('data-value') : null;
      const pointer = e.type.startsWith('pointer');
      const day = (pointer ? hovered : focused) ?? (pointer ? focused : hovered) ?? null;
      if (!day && e.type === 'pointerover' && root.querySelector('[role="grid"]:hover')) return;
      previewDay.value = day as LocalDate | null;
    });
    const escape$ = $((e: KeyboardEvent) => {
      if (e.key !== 'Escape' || view.value === 'days') return;
      view.value = 'days';
      // back to the title that opened the view, or else where Tab enters the days
      const toggle = rootRef.value?.querySelector<HTMLElement>('[data-view-toggle]');
      if (toggle) toggle.focus();
      else
        focusWhenReady(
          rootRef.value,
          tabDaySelector({ year: yearToRender.value, month: monthToRender.value }, months, dateToFocus.value, {
            min,
            max,
            disabledDates,
            disabledWeekdays,
          }),
        );
    });
    const keyDown$ = $((e: KeyboardEvent, grid: HTMLElement) => {
      const key = e.key.toLowerCase();
      // only the keys pressed on a day: the grid itself (focused by a click on it) keeps their default action
      if (!ACTION_KEYS.includes(key as (typeof ACTION_KEYS)[number]) || !(e.target as Element).closest('[data-value]'))
        return;

      const availability = { min, max, disabledDates, disabledWeekdays };
      // the day keeping the focus: the focused button, unless an earlier key moved to a month that isn't
      // rendered yet. Keys pressed back to back (or queued while this handler loads) run before Qwik renders
      // again, so the DOM can lag behind: the state, set synchronously by each key, doesn't
      const first = { year: yearToRender.value, month: monthToRender.value };
      const root = rootRef.value ?? grid;
      const active = root.contains(document.activeElement) ? document.activeElement?.getAttribute('data-value') : null;
      const from = (active && isShown(active, first, months) ? active : dateToFocus.value) as LocalDate;

      // Enter and Space choose it here, not through a click on its button: the click handler would load and
      // run after the keys that follow
      if (key === 'enter' || key === ' ') {
        choose(from, mode, availability, state, onChange$);
        return;
      }

      // in right-to-left layouts the rows are mirrored, so left/right follow the visual direction
      const mirrored: Record<string, GridKey> = { arrowleft: 'arrowright', arrowright: 'arrowleft' };
      const isRtl = getComputedStyle(grid).direction === 'rtl';
      const gridKey = (isRtl ? mirrored[key] ?? key : key) as GridKey;
      // skip the days that can't be chosen, and stay put when there's none left that way
      const target =
        nearestAvailable(
          keyTarget(from, gridKey, { weekStartsOn, fullWeeks }),
          KEY_DIRECTIONS[gridKey],
          availability,
        ) ?? from;

      focusDayOnMonthChange.value = true;
      dateToFocus.value = target;
      // as few months away as it takes: a month on show (another grid, maybe) doesn't move the calendar
      const next = firstShownFor(target, first, months);
      if (next.year === first.year && next.month === first.month) {
        // focusVisible isn't in the DOM typings yet
        const options = { preventScroll: true, focusVisible: true } as FocusOptions;
        // enabled: with fullWeeks, the grid next to it shows the day too, disabled
        root.querySelector<HTMLElement>(`[data-value="${target}"]:not([disabled])`)?.focus(options);
        return;
      }
      // another month: the visible task focuses the day once it's rendered
      showMonth(state, next);
    });

    useContextProvider(CalendarContextId, {
      value: selected,
      mode: modeSignal,
      direction,
      preview,
      month,
      view,
      title,
      grids,
      monthCells: monthCellsSignal,
      yearCells: years,
      today,
      tabDay,
      canGoBack,
      canGoForward,
      weekdays,
      labels,
      select$,
      setPreview$,
      prev$,
      next$,
      setView$,
      chooseMonth$,
      chooseYear$,
      titleId,
      toggleView$,
      previewSync$,
      pickPeriod$,
      periodKeyDown$,
      showWeekNumber: weekNumbers,
      pick$,
      keyDown$,
    });

    return (
      <div
        // a generic <div> can't be named (ARIA), the group role lets screen readers read the label
        role='group'
        aria-label={label.value}
        // only with the prop: without it the calendar gets no listener, and never takes the focus on its own
        document:onQinit$={autoFocus ? focusTabDay : undefined}
        document:onToggle$={autoFocus ? focusTabDay : undefined}
        data-view={view.value}
        data-direction={direction.value ?? undefined}
        {...props}
        onKeyDown$={[keepOpen, escape$, onKeyDown$]}
        ref={rootRef}
      >
        <Slot />
        {name && mode === 'range' ? (
          <>
            <input type='hidden' name={`${name}[start]`} value={(selected.value as DateRange | null)?.start ?? ''} />
            <input type='hidden' name={`${name}[end]`} value={(selected.value as DateRange | null)?.end ?? ''} />
          </>
        ) : name && mode === 'multiple' ? (
          // one input per day, as `name[]`: Qwik Router actions read it as an array (a repeated name keeps the last)
          (selected.value as LocalDate[]).map((day) => <input key={day} type='hidden' name={`${name}[]`} value={day} />)
        ) : (
          name && <input type='hidden' name={name} value={(selected.value as LocalDate | null) ?? ''} />
        )}
      </div>
    );
  },
);
