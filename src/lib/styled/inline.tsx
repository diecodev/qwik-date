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
  ARIA_LABELS,
  type Locale,
  MONTHS_LG,
  type Month,
  type Theme,
  WEEKDAYS,
  addMonths,
  daysArrGenerator,
  getRowWeekNumber,
  isValidLocalDate,
  parseLocalDate,
  toLocalDateString,
} from '../core';
import { ChevronLeft, ChevronRight } from './icons';
import styles from './style.css?inline';

type LocalDate = `${number}-${number}-${number}`;

export interface CalendarInlineProps {
  locale?: Locale;
  showWeekNumber?: boolean;
  fullWeeks?: boolean;
  date?: LocalDate;
  'bind:date'?: Signal<LocalDate>; // TODO: validate user is passing a signal
  showDaysOfWeek?: boolean;
  unStyled?: boolean;
  theme?: Theme | Signal<Theme>;
  iconLeft?: Component<PropsOf<'svg'>>;
  iconRight?: Component<PropsOf<'svg'>>;
  // props to override
  containerProps?: PropsOf<'div'>;
  headerProps?: PropsOf<'header'>;
  actionButtonProps?: PropsOf<'button'>;
  actionLeftProps?: PropsOf<'button'>;
  actionRightProps?: PropsOf<'button'>;
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
  onDateChange$?: QRL<(date: LocalDate) => void>;
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

export const CalendarInline = component$<CalendarInlineProps>(
  ({
    date: dateProp,
    fullWeeks = false,
    locale = 'en',
    showWeekNumber = false,
    showDaysOfWeek = true,
    iconLeft,
    iconRight,
    containerProps = {},
    headerProps = {},
    actionButtonProps = {},
    actionLeftProps = {},
    actionRightProps = {},
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
    onDateChange$,
    unStyled,
    theme = 'light',
    ...props
  }) => {
    // always called: hooks can't be conditional, `unStyled` instances are excluded by the stylesheet itself
    useStyles$(styles);

    // root constants
    const date = toLocalDateString(new Date()) as LocalDate;
    const themeValue = isSignal(theme) ? theme.value : theme;
    const labelStr = containerProps['aria-label'] ?? ARIA_LABELS[locale].root;

    // signals
    const dateSignal = useSignal<LocalDate>(dateProp ?? date);
    const defaultDate = props['bind:date'] ?? dateSignal;
    const activeDate = useSignal<LocalDate | null>(null);
    const monthToRender = useSignal<Month>(defaultDate.value.split('-')[1] as Month);
    const yearToRender = useSignal<number>(+defaultDate.value.split('-')[0]);
    const dateToFocus = useSignal<LocalDate>(defaultDate.value);
    const focusDayOnMonthChange = useSignal(false);
    const rootRef = useSignal<HTMLDivElement>();

    // the grid is named after the month title (`role="grid"` requires a name), keep a custom title id
    const id = useId();
    const titleId = titleProps.id ?? `qwik-date-${id}-title`;

    // computed
    const labelSignal = useComputed$(() => {
      if (!activeDate.value) return labelStr;

      const selected = dateFormatter(locale).format(parseLocalDate(activeDate.value));
      return `${labelStr}, ${ARIA_LABELS[locale].selected} ${selected}`;
    });
    const datesArray = useComputed$(() => {
      const dates = daysArrGenerator({
        month: monthToRender.value,
        year: yearToRender.value.toString(),
        fullWeeks,
      });
      return dates;
    });

    if (!isValidLocalDate(defaultDate.value))
      throw new Error('Invalid date in Calendar. Please use an existing date in YYYY-MM-DD format.');

    // follow the date when it changes from outside (e.g. a parent writes to `bind:date`)
    useTask$(({ track }) => {
      const value = track(() => defaultDate.value);
      if (!isValidLocalDate(value)) return;

      const [year, month] = value.split('-');
      monthToRender.value = month as Month;
      yearToRender.value = +year;
      dateToFocus.value = value;
      // a selection made before the external change no longer matches the date
      if (activeDate.value && activeDate.value !== value) activeDate.value = null;
    });

    // without `date` / `bind:date` the default is "today" where the component rendered: with SSR that is
    // the server's day (frozen at build time with SSG), so switch to the visitor's day on the client
    useVisibleTask$(() => {
      if (dateProp || props['bind:date']) return;

      const today = toLocalDateString(new Date()) as LocalDate;
      if (dateSignal.value !== today) dateSignal.value = today;
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
    const hMonth = MONTHS_LG[locale][+monthToRender.value - 1];
    const hTitle = `${hMonth} ${yearToRender.value}`;

    // days of the week
    const daysOfWeek = WEEKDAYS[locale];

    // icons
    const IconLeft = iconLeft ?? ChevronLeft;
    const IconRight = iconRight ?? ChevronRight;

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
        data-unstyled={unStyled}
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
            onClick$={[
              $(async () => {
                focusDayOnMonthChange.value = false;
                await decreaseDate();
                dateToFocus.value = `${yearToRender.value}-${monthToRender.value}-01`;
              }),
              actionButtonProps.onClick$,
              actionLeftProps.onClick$,
            ]}
            aria-label={ARIA_LABELS[locale].previous}
          >
            <IconLeft {...iconProps} />
          </button>

          <div id={titleId} aria-live='polite' role='presentation' {...titleProps}>
            {hTitle}
          </div>

          <button
            type='button'
            data-header-action
            onClick$={[
              $(async () => {
                focusDayOnMonthChange.value = false;
                await increaseDate();
                dateToFocus.value = `${yearToRender.value}-${monthToRender.value}-01`;
              }),
              actionButtonProps.onClick$,
              actionRightProps.onClick$,
            ]}
            aria-label={ARIA_LABELS[locale].next}
          >
            <IconRight {...iconProps} />
          </button>
        </header>

        <table tabIndex={-1} role='grid' aria-labelledby={titleId} {...calendarProps}>
          {showDaysOfWeek && (
            <thead {...theadProps}>
              <tr {...theadRowProps}>
                {showWeekNumber && <td />}
                {daysOfWeek.map((day) => (
                  <th key={day} scope='col' aria-label={day} {...headerCellProps}>
                    {
                      day
                        .slice(0, 2)
                        .normalize('NFD')
                        .replace(/\p{M}/gu, '') // remove accents, special things on letters, etc.
                    }
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
                      <span>{getRowWeekNumber(week).toString()}</span>
                    </td>
                  )}
                  {week.map((day) => {
                    const label = day ? dateFormatter(locale).format(new Date(`${day}T12:00:00`)) : undefined; // the T12:00:00 is to avoid timezone issues
                    const disabled = day?.split('-')[1] !== monthToRender.value;

                    return (
                      <td
                        key={`${week.toString()}-${day}`}
                        aria-selected={day && day === activeDate.value ? 'true' : undefined}
                        aria-disabled={disabled}
                        {...cellProps}
                      >
                        {day && (
                          <button
                            type='button'
                            data-preselected={day === defaultDate.value}
                            data-selected={day === activeDate.value}
                            data-value={day}
                            aria-label={label}
                            disabled={disabled}
                            tabIndex={day === dateToFocus.value ? 0 : -1}
                            {...dayButtonProps}
                            onClick$={[
                              $(() => {
                                activeDate.value = day as LocalDate;
                                defaultDate.value = day as LocalDate;
                                onDateChange$?.(day as LocalDate);
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
