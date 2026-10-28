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
  type DateRange,
  type GridKey,
  type Labels,
  type LocalDate,
  type Locale,
  type Mode,
  type Month,
  type WeekDay,
  calendarGrid,
  clampDay,
  daysArrGenerator,
  isMonthInLimits,
  isUnavailable,
  isValidLocalDate,
  isValidValue,
  keyTarget,
  nearestAvailable,
  nextValue,
  openingDay,
  resolveLabels,
  selectionLabel,
  shiftMonth,
  tabDayOf,
  toLocalDateString,
  weekdayNames,
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
    root.querySelector<HTMLElement>('[data-value][tabindex="0"]')?.focus();
});

interface View {
  yearToRender: Signal<number>;
  monthToRender: Signal<Month>;
  dateToFocus: Signal<LocalDate>;
  focusDayOnMonthChange: Signal<boolean>;
}

/** Shows the month `delta` months away, unless `min` or `max` rule it out: Tab enters on its first day. */
const moveMonth = (delta: number, view: View, limits: Availability) => {
  const { year, month } = shiftMonth(view.yearToRender.value, view.monthToRender.value, delta);
  if (!isMonthInLimits(year, month, limits)) return;
  // the month buttons keep the focus, so they can be pressed repeatedly
  view.focusDayOnMonthChange.value = false;
  view.yearToRender.value = year;
  view.monthToRender.value = month as Month;
  view.dateToFocus.value = `${year}-${month}-01` as LocalDate;
};

interface Choice {
  selected: Signal<CalendarValue>;
  chosen: Signal<CalendarValue>;
  dateToFocus: Signal<LocalDate>;
}

/** Chooses `day` (the new value, where Tab enters, `onChange$`), unless it can't be chosen. */
const choose = (
  day: LocalDate,
  mode: Mode,
  availability: Availability,
  { selected, chosen, dateToFocus }: Choice,
  onChange$: ModeOptions['onChange$'],
) => {
  if (!isValidLocalDate(day) || isUnavailable(day, availability)) return;

  const next = nextValue(mode, selected.value, day, availability);
  chosen.value = next;
  selected.value = next;
  // Tab (and autoFocus) enters on the day chosen last
  dateToFocus.value = day;
  // the type of the value follows `mode`
  (onChange$ as QRL<(value: LocalDate | DateRange) => void> | undefined)?.(next);
};

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
    locale = 'en',
    labels: labelsProp,
    'aria-label': ariaLabel,
    ...props
  }) => {
    // signals
    const valueSignal = useSignal<CalendarValue>(valueProp);
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
    const tabDay = useComputed$(() =>
      tabDayOf(yearToRender.value, monthToRender.value, dateToFocus.value, {
        min,
        max,
        disabledDates,
        disabledWeekdays,
      }),
    );
    const month = useComputed$(() => ({ year: yearToRender.value, month: monthToRender.value }));
    const grids = useComputed$(
      () => [
        calendarGrid({
          year: yearToRender.value,
          month: monthToRender.value,
          value: selected.value,
          today: today.value,
          tabDay: tabDay.value,
          locale,
          weekStartsOn,
          fullWeeks,
          availability: { min, max, disabledDates, disabledWeekdays },
        }),
      ],
      // the HTML already shows it, and it would weigh ~16 KB in the state: the client computes it when it renders
      { serializationStrategy: 'never' },
    );
    const labels = useComputed$(() => resolveLabels(locale, labelsProp));
    const weekdays = useComputed$(() => weekdayNames(locale, weekStartsOn));
    const canGoBack = useComputed$(() => {
      const before = shiftMonth(yearToRender.value, monthToRender.value, -1);
      return isMonthInLimits(before.year, before.month, { min, max });
    });
    const canGoForward = useComputed$(() => {
      const after = shiftMonth(yearToRender.value, monthToRender.value, 1);
      return isMonthInLimits(after.year, after.month, { min, max });
    });
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
      if (value === null || value === chosen.value || !isValidValue(value)) return;

      const day = openingDay(value) as LocalDate;
      const [year, month] = day.split('-');
      monthToRender.value = month as Month;
      yearToRender.value = +year;
      dateToFocus.value = day;
    });

    // "today" is the visitor's day, not the server's (frozen at build time with SSG); without a selected day
    // the calendar opened on today's month, so it moves to the visitor's one too
    useVisibleTask$(() => {
      const visitorToday = toLocalDateString(new Date()) as LocalDate;
      if (today.value === visitorToday) return;

      today.value = visitorToday;
      if (selected.value) return;
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
      if (!focusDayOnMonthChange.value || !root || !datesArray.value.flat().includes(date)) return;

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
      choose(day, mode, { min, max, disabledDates, disabledWeekdays }, { selected, chosen, dateToFocus }, onChange$),
    );
    // one handler for every day button, so they don't each serialize their own
    const pick$ = $((_: Event, button: HTMLElement) =>
      choose(
        button.getAttribute('data-value') as LocalDate,
        mode,
        { min, max, disabledDates, disabledWeekdays },
        { selected, chosen, dateToFocus },
        onChange$,
      ),
    );
    const view = { yearToRender, monthToRender, dateToFocus, focusDayOnMonthChange };
    const prevMonth$ = $(() => moveMonth(-1, view, { min, max }));
    const nextMonth$ = $(() => moveMonth(1, view, { min, max }));
    const keyDown$ = $((e: KeyboardEvent, grid: HTMLElement) => {
      const key = e.key.toLowerCase();
      // only the keys pressed on a day: the grid itself (focused by a click on it) keeps their default action
      if (!ACTION_KEYS.includes(key as (typeof ACTION_KEYS)[number]) || !(e.target as Element).closest('[data-value]'))
        return;

      const availability = { min, max, disabledDates, disabledWeekdays };
      // the day keeping the focus: the focused button, unless an earlier key moved to a month that isn't
      // rendered yet. Keys pressed back to back (or queued while this handler loads) run before Qwik renders
      // again, so the DOM can lag behind: the state, set synchronously by each key, doesn't
      const active = grid.contains(document.activeElement) ? document.activeElement?.getAttribute('data-value') : null;
      const shown = `${yearToRender.value}-${monthToRender.value}`;
      const from = (active?.startsWith(shown) ? active : dateToFocus.value) as LocalDate;

      // Enter and Space choose it here, not through a click on its button: the click handler would load and
      // run after the keys that follow
      if (key === 'enter' || key === ' ') {
        choose(from, mode, availability, { selected, chosen, dateToFocus }, onChange$);
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
      const [year, month] = target.split('-');
      if (+year === yearToRender.value && month === monthToRender.value) {
        // focusVisible isn't in the DOM typings yet
        const options = { preventScroll: true, focusVisible: true } as FocusOptions;
        grid.querySelector<HTMLElement>(`[data-value="${target}"]`)?.focus(options);
        return;
      }
      // another month: the visible task focuses the day once it's rendered
      yearToRender.value = +year;
      monthToRender.value = month as Month;
    });

    useContextProvider(CalendarContextId, {
      value: selected,
      month,
      grids,
      today,
      tabDay,
      canGoBack,
      canGoForward,
      weekdays,
      labels,
      select$,
      prevMonth$,
      nextMonth$,
      titleId,
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
        {...props}
        ref={rootRef}
      >
        <Slot />
        {name && mode === 'range' ? (
          <>
            <input type='hidden' name={`${name}[start]`} value={(selected.value as DateRange | null)?.start ?? ''} />
            <input type='hidden' name={`${name}[end]`} value={(selected.value as DateRange | null)?.end ?? ''} />
          </>
        ) : (
          name && <input type='hidden' name={name} value={(selected.value as LocalDate | null) ?? ''} />
        )}
      </div>
    );
  },
);
