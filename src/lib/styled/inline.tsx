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
  type Labels,
  type LocalDate,
  type Locale,
  type Month,
  type Theme,
  type WeekDay,
  addMonths,
  daysArrGenerator,
  formatMonth,
  getRowWeekNumber,
  isValidLocalDate,
  parseLocalDate,
  resolveLabels,
  toLocalDateString,
  weekdayNames,
} from '../core';
import { ChevronLeft, ChevronRight } from './icons';
import styles from './style.css?inline';

/** `en` and `es` have built-in texts (`labels` overrides some of them); any other locale needs all of them. */
type LocaleProps = { locale?: BuiltInLocale; labels?: Partial<Labels> } | { locale: Locale; labels: Labels };

export type CalendarProps = CalendarBaseProps & LocaleProps;

interface CalendarBaseProps {
  /** the first column: 0 for Sunday (the default), 1 for Monday... */
  weekStartsOn?: WeekDay;
  showWeekNumber?: boolean;
  fullWeeks?: boolean;
  /** the selected day, `null` (the default) for none */
  value?: LocalDate | null;
  'bind:value'?: Signal<LocalDate | null>;
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
  onChange$?: QRL<(value: LocalDate) => void>;
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
    const valueSignal = useSignal<LocalDate | null>(valueProp);
    const selected = props['bind:value'] ?? valueSignal;
    // the day where the component rendered: with SSR that's the server's, the visible task below switches it
    const today = useSignal(toLocalDateString(new Date()) as LocalDate);
    // the calendar opens on the selected day, or on today without one
    const initial = selected.value ?? today.value;
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
      if (!selected.value) return labelStr;

      const date = dateFormatter(locale).format(parseLocalDate(selected.value));
      return `${labelStr}, ${labels.selectedDate} ${date}`;
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

    if (selected.value !== null && !isValidLocalDate(selected.value))
      throw new Error('Invalid date in Calendar. Please use an existing date in YYYY-MM-DD format.');

    // show the selected day when it changes from outside (e.g. a parent writes to `bind:value`)
    useTask$(({ track }) => {
      const value = track(() => selected.value);
      if (!value || !isValidLocalDate(value)) return;

      const [year, month] = value.split('-');
      monthToRender.value = month as Month;
      yearToRender.value = +year;
      dateToFocus.value = value;
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
      if (!ACTION_KEYS.includes(e.key.toLowerCase() as (typeof ACTION_KEYS)[number])) return;

      focusDayOnMonthChange.value = true;

      const elFocus = document.activeElement;

      if (elFocus?.tagName.toLowerCase() !== 'button') return;

      const buttons = Array.from(tbody.getElementsByTagName('button'));

      const getNewIndex = ({ currentIdx, step }: { currentIdx: number; step: number }) => {
        const newIdx = currentIdx + step;

        if (newIdx < 0 || newIdx >= buttons.length) return currentIdx;

        const btn = buttons[newIdx];

        if (btn.hasAttribute('disabled')) return currentIdx;

        return newIdx;
      };

      const idx = buttons.indexOf(elFocus as HTMLButtonElement);

      // local helpers
      let localIdx: number = idx;
      let newDate: LocalDate | null = null;

      // in right-to-left layouts the rows are mirrored, so left/right follow the visual direction
      const key = e.key.toLowerCase();
      const mirrored: Record<string, string> = { arrowleft: 'arrowright', arrowright: 'arrowleft' };
      const isRtl = getComputedStyle(tbody).direction === 'rtl';

      switch (isRtl ? mirrored[key] ?? key : key) {
        case 'arrowup': {
          localIdx = getNewIndex({ currentIdx: idx, step: -7 });
          if (idx === localIdx) {
            const d = parseLocalDate(elFocus.getAttribute('data-value') as LocalDate);
            newDate = toLocalDateString(new Date(d.setDate(d.getDate() - 7))) as LocalDate;

            decreaseDate();
          }
          break;
        }
        case 'arrowdown': {
          localIdx = getNewIndex({ currentIdx: idx, step: 7 });
          if (idx === localIdx) {
            const d = parseLocalDate(elFocus.getAttribute('data-value') as LocalDate);
            newDate = toLocalDateString(new Date(d.setDate(d.getDate() + 7))) as LocalDate;

            increaseDate();
          }

          break;
        }
        case 'arrowleft': {
          localIdx = getNewIndex({ currentIdx: idx, step: -1 });
          if (idx === localIdx) {
            const d = parseLocalDate(elFocus.getAttribute('data-value') as LocalDate);
            newDate = toLocalDateString(new Date(d.setDate(d.getDate() - 1))) as LocalDate;

            decreaseDate();
          }
          break;
        }
        case 'arrowright': {
          localIdx = getNewIndex({ currentIdx: idx, step: 1 });
          if (idx === localIdx) {
            const d = parseLocalDate(elFocus.getAttribute('data-value') as LocalDate);
            newDate = toLocalDateString(new Date(d.setDate(d.getDate() + 1))) as LocalDate;

            increaseDate();
          }
          break;
        }
        case ' ':
        case 'enter': {
          (elFocus as HTMLButtonElement).click();
          break;
        }
        case 'pageup': {
          const localDate = elFocus.getAttribute('data-value') as LocalDate;
          newDate = toLocalDateString(addMonths(parseLocalDate(localDate), -1)) as LocalDate;

          decreaseDate();
          break;
        }
        case 'pagedown': {
          const localDate = elFocus.getAttribute('data-value') as LocalDate;
          newDate = toLocalDateString(addMonths(parseLocalDate(localDate), 1)) as LocalDate;

          increaseDate();
          break;
        }
        case 'home': {
          // Find the start of the current row (a row has fewer than 7 buttons when fullWeeks is false)
          const rowButtons = Array.from(elFocus.closest('tr')?.getElementsByTagName('button') ?? []);
          const startButton = rowButtons[0];
          const rowStartIndex = buttons.indexOf(startButton);
          newDate = startButton.getAttribute('data-value') as LocalDate;

          // Check if the start of the row is in the previous month
          if (newDate.split('-')[1] !== monthToRender.value) {
            decreaseDate();
          }

          localIdx = rowStartIndex;
          break;
        }
        case 'end': {
          // Find the end of the current row (a row has fewer than 7 buttons when fullWeeks is false)
          const rowButtons = Array.from(elFocus.closest('tr')?.getElementsByTagName('button') ?? []);
          const endButton = rowButtons[rowButtons.length - 1];
          const rowEndIndex = buttons.indexOf(endButton);
          newDate = endButton.getAttribute('data-value') as LocalDate;

          // Check if the end of the row is in the next month
          if (newDate.split('-')[1] !== monthToRender.value) {
            increaseDate();
          }

          localIdx = rowEndIndex;
          break;
        }
      }

      dateToFocus.value = newDate ?? (buttons[localIdx].getAttribute('data-value') as LocalDate);
      elFocus.setAttribute('tabindex', '-1');
      buttons[localIdx].setAttribute('tabindex', '0');
      // @ts-expect-error
      buttons[localIdx].focus({ preventScroll: true, focusVisible: true });
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
              $((e: KeyboardEvent, target: HTMLTableSectionElement) => {
                updateDateFocused(e, target);
              }),
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
                    const isSelected = !disabled && day === selected.value;

                    return (
                      <td
                        key={`${week.toString()}-${day}`}
                        aria-selected={isSelected ? 'true' : undefined}
                        aria-disabled={disabled}
                        {...cellProps}
                      >
                        {day && (
                          <button
                            type='button'
                            data-selected={isSelected}
                            data-value={day}
                            aria-label={label}
                            aria-current={!disabled && day === today.value ? 'date' : undefined}
                            disabled={disabled}
                            tabIndex={day === dateToFocus.value ? 0 : -1}
                            {...dayButtonProps}
                            onClick$={[
                              $(() => {
                                selected.value = day as LocalDate;
                                onChange$?.(day as LocalDate);
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
