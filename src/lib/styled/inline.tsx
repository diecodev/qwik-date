import {
  $,
  type Component,
  type PropsOf,
  type QRL,
  type Signal,
  component$,
  useComputed$,
  useSignal,
  useStyles$,
  useTask$,
} from '@builder.io/qwik';
import { ARIA_LABELS, type Locale, MONTHS_LG, type Month, WEEKDAYS, daysArrGenerator, getWeekNumber } from '../core';
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

const regex = /^\d{4}-(0[1-9]|1[0-2])-\d{2}$/;
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
    ...props
  }) => {
    if (!unStyled) useStyles$(styles);

    // root constants
    const date = new Date().toISOString().split('T')[0] as LocalDate;
    const labelStr = containerProps['aria-label'] ?? ARIA_LABELS[locale].root;

    // signals
    const dateSignal = useSignal<LocalDate>(dateProp ?? date);
    const defaultDate = props['bind:date'] ?? dateSignal;
    const activeDate = useSignal<LocalDate | null>(null);
    const monthToRender = useSignal<Month>(defaultDate.value.split('-')[1] as Month);
    const yearToRender = useSignal<number>(+defaultDate.value.split('-')[0]);
    const dateToFocus = useSignal<LocalDate>(defaultDate.value);

    // refs
    const focusElRef = useSignal<HTMLButtonElement>();

    // computed
    const labelSignal = useComputed$(() => {
      if (!activeDate.value) return labelStr;
      const [year, month] = activeDate.value.split('-');

      return `${labelStr} ${MONTHS_LG[locale][+month - 1]} ${year}`;
    });
    const datesArray = useComputed$(() => {
      const dates = daysArrGenerator({
        month: monthToRender.value,
        year: yearToRender.value.toString(),
        fullWeeks,
      });
      return dates;
    });

    if (!regex.test(defaultDate.value))
      throw new Error('Invalid date format in Calendar. Please use YYYY-MM-DD format.');

    // taks
    useTask$(({ track, cleanup }) => {
      track(() => focusElRef.value);

      if (!focusElRef.value) return;

      const btn = focusElRef.value;
      const date = btn.getAttribute('data-value') as LocalDate;

      if (datesArray.value.flat().includes(date)) {
        focusElRef.value.setAttribute('tabindex', '0');
        // @ts-expect-error focusVisible is not on types
        focusElRef.value.focus({ preventScroll: true, focusVisible: true });
      }

      cleanup(() => {
        focusElRef.value?.setAttribute('tabindex', '-1');
        focusElRef.value?.blur();
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

      if (document.activeElement !== focusElRef.value) return;

      const buttons = Array.from(tbody.getElementsByTagName('button'));

      const getNewIndex = ({ currentIdx, step }: { currentIdx: number; step: number }) => {
        const newIdx = currentIdx + step;

        if (newIdx < 0 || newIdx >= buttons.length) return currentIdx;

        const btn = buttons[newIdx];

        if (btn.hasAttribute('disabled')) return currentIdx;

        return newIdx;
      };

      const idx = buttons.indexOf(focusElRef.value);

      // local helpers
      let localIdx: number = idx;
      let newDate: LocalDate | null = null;

      switch (e.key.toLowerCase()) {
        case 'arrowup': {
          localIdx = getNewIndex({ currentIdx: idx, step: -7 });
          if (idx === localIdx) {
            const d = new Date(focusElRef.value.getAttribute('data-value') as LocalDate);
            newDate = new Date(d.setDate(d.getDate() - 7)).toISOString().split('T')[0] as LocalDate;

            decreaseDate();
          }
          break;
        }
        case 'arrowdown': {
          localIdx = getNewIndex({ currentIdx: idx, step: 7 });
          if (idx === localIdx) {
            const d = new Date(focusElRef.value.getAttribute('data-value') as LocalDate);
            newDate = new Date(d.setDate(d.getDate() + 7)).toISOString().split('T')[0] as LocalDate;

            increaseDate();
          }

          break;
        }
        case 'arrowleft': {
          localIdx = getNewIndex({ currentIdx: idx, step: -1 });
          if (idx === localIdx) {
            const d = new Date(focusElRef.value.getAttribute('data-value') as LocalDate);
            newDate = new Date(d.setDate(d.getDate() - 1)).toISOString().split('T')[0] as LocalDate;

            decreaseDate();
          }
          break;
        }
        case 'arrowright': {
          localIdx = getNewIndex({ currentIdx: idx, step: 1 });
          if (idx === localIdx) {
            const d = new Date(focusElRef.value.getAttribute('data-value') as LocalDate);
            newDate = new Date(d.setDate(d.getDate() + 1)).toISOString().split('T')[0] as LocalDate;

            increaseDate();
          }
          break;
        }
      }

      dateToFocus.value = newDate ?? (buttons[localIdx].getAttribute('data-value') as LocalDate);
    });

    return (
      <div data-qwik-date data-theme='light' aria-label={labelSignal.value} {...containerProps}>
        <header {...headerProps}>
          <button
            type='button'
            onClick$={[
              decreaseDate,
              $(() => {
                dateToFocus.value = `${yearToRender.value}-${monthToRender.value}-01`;
              }),
              actionButtonProps.onClick$,
              actionLeftProps.onClick$,
            ]}
            aria-label={ARIA_LABELS[locale].previous}
          >
            <IconLeft {...iconProps} />
          </button>

          <div aria-live='polite' role='presentation' {...titleProps}>
            {hTitle}
          </div>

          <button
            type='button'
            onClick$={[
              increaseDate,
              $(() => {
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

        <table tabIndex={-1} role='grid' {...calendarProps}>
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
            preventdefault:keydown
            onKeyDown$={[
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
                      <span>{getWeekNumber(week.filter((day) => day !== null)[0]).toString()}</span>
                    </td>
                  )}
                  {week.map((day) => {
                    const label = day ? dateFormatter(locale).format(new Date(`${day}T12:00:00`)) : undefined; // the T12:00:00 is to avoid timezone issues
                    const disabled = day?.split('-')[1] !== monthToRender.value;

                    return (
                      <td key={`${week.toString()}-${day}`} role='presentation' aria-disabled={disabled} {...cellProps}>
                        {day && (
                          <button
                            type='button'
                            data-preselected={day === defaultDate.value}
                            aria-selected={day === activeDate.value ? 'true' : undefined}
                            data-value={day}
                            aria-label={label}
                            disabled={disabled}
                            tabIndex={day === dateToFocus.value ? 0 : -1}
                            ref={day === dateToFocus.value ? focusElRef : undefined}
                            {...dayButtonProps}
                            onClick$={[
                              $(() => {
                                activeDate.value = day as LocalDate;
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
