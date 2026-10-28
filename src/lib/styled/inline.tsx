import {
  $,
  type Component,
  type PropsOf,
  type QRL,
  type Signal,
  component$,
  isSignal,
  sync$,
  useComputed$,
  useId,
  useSignal,
  useStyles$,
  useTask$,
  useVisibleTask$,
} from '@qwik.dev/core';
import {
  type BuiltInLocale,
  type DateRange,
  type GridKey,
  type Labels,
  type LocalDate,
  type Locale,
  type Month,
  type Theme,
  type WeekDay,
  daysArrGenerator,
  formatMonth,
  getRowWeekNumber,
  isInsideRange,
  isValidLocalDate,
  isValidRange,
  keyTarget,
  nextRange,
  parseLocalDate,
  resolveLabels,
  toLocalDateString,
  weekdayNames,
} from '../core';
import { ChevronLeft, ChevronRight } from './icons';
import styles from './style.css?inline';

/** `en` and `es` have built-in texts (`labels` overrides some of them); any other locale needs all of them. */
type LocaleProps = { locale?: BuiltInLocale; labels?: Partial<Labels> } | { locale: Locale; labels: Labels };

/** `mode="single"` (the default) selects a day, `mode="range"` a start and an end. */
type ModeProps =
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

export type CalendarProps = CalendarBaseProps & ModeProps & LocaleProps;

type Value = LocalDate | DateRange | null;

/** The day the calendar opens on for a value: the selected day, or the start of the range. */
const dayOf = (value: Value) => (value === null || typeof value === 'string' ? value : value.start);

/** The value after choosing `day`: that day, or the range it starts or ends. */
const nextValue = (mode: 'single' | 'range', value: Value, day: LocalDate) =>
  mode === 'range' ? nextRange(value as DateRange | null, day) : day;

const isValidValue = (value: LocalDate | DateRange) =>
  typeof value === 'string' ? isValidLocalDate(value) : isValidRange(value);

interface CalendarBaseProps {
  /** the first column: 0 for Sunday (the default), 1 for Monday... */
  weekStartsOn?: WeekDay;
  showWeekNumber?: boolean;
  fullWeeks?: boolean;
  showDaysOfWeek?: boolean;
  unstyled?: boolean;
  theme?: Theme | Signal<Theme>;
  prevIcon?: Component<PropsOf<'svg'>>;
  nextIcon?: Component<PropsOf<'svg'>>;
  // props to override
  containerProps?: PropsOf<'div'>;
  headerProps?: PropsOf<'header'>;
  /** both month buttons; `prevButtonProps` / `nextButtonProps` win over it */
  navButtonProps?: PropsOf<'button'>;
  prevButtonProps?: PropsOf<'button'>;
  nextButtonProps?: PropsOf<'button'>;
  iconProps?: PropsOf<'svg'>;
  titleProps?: PropsOf<'div'>;
  calendarProps?: PropsOf<'table'>;
  theadProps?: PropsOf<'thead'>;
  tbodyProps?: PropsOf<'tbody'>;
  theadRowProps?: PropsOf<'tr'>;
  tbodyRowProps?: PropsOf<'tr'>;
  headerCellProps?: PropsOf<'th'>;
  cellProps?: PropsOf<'td'>;
  dayButtonProps?: PropsOf<'button'>;
  weekNumberProps?: PropsOf<'td'>;
}

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
const dateFormatter = (locale: Locale) =>
  new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

export const Calendar = component$<CalendarProps>(
  ({
    mode = 'single',
    value: valueProp = null,
    fullWeeks = false,
    locale = 'en',
    labels: labelsProp,
    weekStartsOn = 0,
    showWeekNumber = false,
    showDaysOfWeek = true,
    prevIcon,
    nextIcon,
    containerProps = {},
    headerProps = {},
    navButtonProps = {},
    prevButtonProps = {},
    nextButtonProps = {},
    calendarProps = {},
    theadProps = {},
    tbodyProps = {},
    theadRowProps = {},
    tbodyRowProps = {},
    headerCellProps = {},
    cellProps = {},
    dayButtonProps = {},
    iconProps = {},
    titleProps = {},
    weekNumberProps = {},
    onChange$,
    unstyled,
    theme = 'light',
    ...props
  }) => {
    // always called: hooks can't be conditional, `unstyled` instances are excluded by the stylesheet itself
    useStyles$(styles);

    // root constants
    const themeValue = isSignal(theme) ? theme.value : theme;
    const labels = resolveLabels(locale, labelsProp);
    const labelStr = containerProps['aria-label'] ?? labels.calendar;

    // signals
    const valueSignal = useSignal<Value>(valueProp);
    const selected = (props['bind:value'] ?? valueSignal) as Signal<Value>;
    // the value of the last choice in the grid: the calendar already shows its month (the end of a range can
    // be chosen in the month after the start's, the calendar must stay there)
    const chosen = useSignal<Value>(null);
    // the day where the component rendered: with SSR that's the server's, the visible task below switches it
    const today = useSignal(toLocalDateString(new Date()) as LocalDate);
    // the calendar opens on the selected day (the start of a range), or on today without one
    const initial = dayOf(selected.value) ?? today.value;
    const monthToRender = useSignal<Month>(initial.split('-')[1] as Month);
    const yearToRender = useSignal<number>(+initial.split('-')[0]);
    const dateToFocus = useSignal<LocalDate>(initial);
    const focusDayOnMonthChange = useSignal(false);
    const rootRef = useSignal<HTMLDivElement>();

    // the grid is named after the month title (`role="grid"` requires a name), keep a custom title id
    const id = useId();
    const titleId = titleProps.id ?? `qwik-date-${id}-title`;

    // computed
    const labelSignal = useComputed$(() => {
      const value = selected.value;
      if (!value) return labelStr;

      const long = (day: LocalDate) => dateFormatter(locale).format(parseLocalDate(day));
      if (typeof value === 'string') return `${labelStr}, ${labels.selectedDate} ${long(value)}`;
      return `${labelStr}, ${labels.selectedRange} ${long(value.start)} – ${value.end ? long(value.end) : '…'}`;
    });
    const datesArray = useComputed$(() => {
      const dates = daysArrGenerator({
        month: monthToRender.value,
        year: yearToRender.value.toString(),
        fullWeeks,
        weekStartsOn,
      });
      return dates;
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

      const day = dayOf(value) as LocalDate;
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
      const [year, month] = visitorToday.split('-');
      monthToRender.value = month as Month;
      yearToRender.value = +year;
      dateToFocus.value = visitorToday;
    });

    // taks
    useVisibleTask$(({ track, cleanup }) => {
      track(() => datesArray.value);

      // only move the focus when the month changed through keyboard navigation in the grid: not on
      // the first run (the calendar just became visible, the page would load with a focused day) and
      // not after the header buttons, which keep the focus so they can be pressed repeatedly
      if (!focusDayOnMonthChange.value) return;

      if (datesArray.value.flat().includes(dateToFocus.value)) {
        const btn = rootRef.value?.querySelector<HTMLButtonElement>(`button[data-value="${dateToFocus.value}"]`);
        btn?.focus();
        btn?.setAttribute('tabindex', '0');
      }

      cleanup(() => {
        const btn = rootRef.value?.querySelector<HTMLButtonElement>(`button[data-value="${dateToFocus.value}"]`);
        btn?.setAttribute('tabindex', '-1');
        btn?.blur();
      });
    });

    // header utils
    const hTitle = formatMonth(yearToRender.value, +monthToRender.value, locale);

    // days of the week
    const daysOfWeek = weekdayNames(locale, weekStartsOn);

    // icons
    const PrevIcon = prevIcon ?? ChevronLeft;
    const NextIcon = nextIcon ?? ChevronRight;

    // events handlers
    const decreaseDate = $(() => {
      if (monthToRender.value === '01') {
        monthToRender.value = '12';
        yearToRender.value -= 1;
        return;
      }

      monthToRender.value = String(+monthToRender.value - 1).padStart(2, '0') as Month;
    });
    const increaseDate = $(() => {
      if (monthToRender.value === '12') {
        monthToRender.value = '01';
        yearToRender.value += 1;
        return;
      }

      monthToRender.value = String(+monthToRender.value + 1).padStart(2, '0') as Month;
    });
    const updateDateFocused = $((e: KeyboardEvent, tbody: HTMLTableSectionElement) => {
      const key = e.key.toLowerCase();
      if (!ACTION_KEYS.includes(key as (typeof ACTION_KEYS)[number])) return;

      // the day keeping the focus: the focused button, unless an earlier key moved to a month that isn't
      // rendered yet. Keys pressed back to back (or queued while this handler loads) run before Qwik renders
      // again, so the DOM can lag behind: the state, set synchronously by each key, doesn't
      const active = tbody.contains(document.activeElement) ? document.activeElement?.getAttribute('data-value') : null;
      const shown = `${yearToRender.value}-${monthToRender.value}`;
      const from = (active?.startsWith(shown) ? active : dateToFocus.value) as LocalDate;

      // Enter and Space choose it here, not through a click on its button: the click handler would load and
      // run after the keys that follow
      if (key === 'enter' || key === ' ') {
        const next = nextValue(mode, selected.value, from);
        chosen.value = next;
        selected.value = next;
        (onChange$ as QRL<(value: LocalDate | DateRange) => void> | undefined)?.(next);
        return;
      }

      // in right-to-left layouts the rows are mirrored, so left/right follow the visual direction
      const mirrored: Record<string, GridKey> = { arrowleft: 'arrowright', arrowright: 'arrowleft' };
      const isRtl = getComputedStyle(tbody).direction === 'rtl';
      const target = keyTarget(from, (isRtl ? mirrored[key] ?? key : key) as GridKey, { weekStartsOn, fullWeeks });

      focusDayOnMonthChange.value = true;
      dateToFocus.value = target;
      const [year, month] = target.split('-');
      if (+year === yearToRender.value && month === monthToRender.value) {
        // focusVisible isn't in the DOM typings yet
        const options = { preventScroll: true, focusVisible: true } as FocusOptions;
        tbody.querySelector<HTMLButtonElement>(`button[data-value="${target}"]`)?.focus(options);
        return;
      }
      // another month: the visible task focuses the day once it's rendered
      yearToRender.value = +year;
      monthToRender.value = month as Month;
    });

    return (
      <div
        data-qwik-date
        data-unstyled={unstyled}
        data-theme={themeValue}
        // a generic <div> can't be named (ARIA), the group role lets screen readers read the label
        role='group'
        aria-label={labelSignal.value}
        {...containerProps}
        ref={rootRef}
      >
        <header {...headerProps}>
          <button
            type='button'
            data-header-action
            aria-label={labels.previousMonth}
            {...navButtonProps}
            {...prevButtonProps}
            onClick$={[
              $(async () => {
                focusDayOnMonthChange.value = false;
                await decreaseDate();
                dateToFocus.value = `${yearToRender.value}-${monthToRender.value}-01`;
              }),
              navButtonProps.onClick$,
              prevButtonProps.onClick$,
            ]}
          >
            <PrevIcon {...iconProps} />
          </button>

          <div id={titleId} aria-live='polite' role='presentation' {...titleProps}>
            {hTitle}
          </div>

          <button
            type='button'
            data-header-action
            aria-label={labels.nextMonth}
            {...navButtonProps}
            {...nextButtonProps}
            onClick$={[
              $(async () => {
                focusDayOnMonthChange.value = false;
                await increaseDate();
                dateToFocus.value = `${yearToRender.value}-${monthToRender.value}-01`;
              }),
              navButtonProps.onClick$,
              nextButtonProps.onClick$,
            ]}
          >
            <NextIcon {...iconProps} />
          </button>
        </header>

        <table tabIndex={-1} role='grid' aria-labelledby={titleId} {...calendarProps}>
          {showDaysOfWeek && (
            <thead {...theadProps}>
              <tr {...theadRowProps}>
                {showWeekNumber && <td />}
                {daysOfWeek.map((day) => (
                  <th key={day.long} scope='col' aria-label={day.long} {...headerCellProps}>
                    {day.short}
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody
            {...tbodyProps}
            onKeyDown$={[
              // only cancel the default action of the keys the grid handles (same list as ACTION_KEYS:
              // sync$ code can't reference outer variables), so Tab still moves the focus out and
              // Escape still closes the DatePicker popover. It must be sync$: a $ handler runs too late.
              sync$((e: KeyboardEvent) => {
                const keys = [
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
                ];
                if (keys.includes(e.key.toLowerCase())) e.preventDefault();
              }),
              // the handler itself, not a wrapper calling it: one less async hop keeps queued keys in order
              updateDateFocused,
              tbodyProps.onKeyDown$,
            ]}
          >
            {datesArray.value.map((week) => {
              return (
                <tr key={week.toString()} {...tbodyRowProps}>
                  {showWeekNumber && (
                    <td {...weekNumberProps}>
                      <span>{getRowWeekNumber(week, weekStartsOn).toString()}</span>
                    </td>
                  )}
                  {week.map((day) => {
                    const label = day ? dateFormatter(locale).format(new Date(`${day}T12:00:00`)) : undefined; // the T12:00:00 is to avoid timezone issues
                    const disabled = day?.split('-')[1] !== monthToRender.value;
                    // the days of the adjacent months (fullWeeks) are never selected nor today: they're disabled
                    const value = selected.value;
                    const range = value !== null && typeof value !== 'string' ? value : null;
                    const isStart = !disabled && day === range?.start;
                    const isEnd = !disabled && day === range?.end;
                    const isInside = !disabled && !!day && !!range && isInsideRange(day, range);
                    // a day, or the ends of a range: the days between them are selected too, but not highlighted
                    const isSelected = !disabled && (range ? isStart || isEnd : day === value);

                    return (
                      <td
                        key={`${week.toString()}-${day}`}
                        aria-selected={isSelected || isInside ? 'true' : undefined}
                        aria-disabled={disabled}
                        {...cellProps}
                      >
                        {day && (
                          <button
                            type='button'
                            data-selected={isSelected}
                            data-range-start={isStart}
                            data-range-end={isEnd}
                            data-in-range={isInside}
                            data-value={day}
                            aria-label={label}
                            aria-current={!disabled && day === today.value ? 'date' : undefined}
                            disabled={disabled}
                            tabIndex={day === dateToFocus.value ? 0 : -1}
                            {...dayButtonProps}
                            onClick$={[
                              $(() => {
                                const next = nextValue(mode, selected.value, day as LocalDate);
                                chosen.value = next;
                                selected.value = next;
                                // the type of the value follows `mode`
                                (onChange$ as QRL<(value: LocalDate | DateRange) => void> | undefined)?.(next);
                              }),
                              dayButtonProps.onClick$,
                            ]}
                          >
                            {day.split('-')[2]}
                          </button>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  },
);
