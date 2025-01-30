import { $, component$, isSignal, useComputed$, useSignal, useStyles$, useVisibleTask$ } from '@builder.io/qwik';
import {
  ARIA_LABELS,
  DATE_REGEX,
  type LocalDate,
  MONTHS_LG,
  type Month,
  WEEKDAYS,
  createKeyDownHandler,
  generateCalendarDays,
  getISOWeekNumber,
} from '../core';
import { ChevronLeft, ChevronRight } from './icons';
import styles from './style.css?inline';
import type { CalendarInlineProps, Locale } from './types';

const dateFormatter = (locale: Locale) =>
  new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

/**
 * A responsive and accessible calendar component with keyboard navigation
 * and localization support.
 */
export const CalendarInline = component$<CalendarInlineProps>(
  ({
    locale = 'en',
    showWeekNumber = false,
    fullWeeks = false,
    date: dateProp,
    'bind:date': bindDate,
    showDaysOfWeek = true,
    iconLeft: IconLeftProp,
    iconRight: IconRightProp,
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
  }) => {
    if (!unStyled) useStyles$(styles);

    // Signals
    const defaultDate = isSignal(bindDate)
      ? bindDate
      : useSignal<LocalDate>(dateProp || (new Date().toISOString().split('T')[0] as LocalDate));
    const activeDate = useSignal<LocalDate | null>(null);
    const monthToRender = useSignal<Month>((defaultDate.value.split('-')[1] || '01') as Month);
    const yearToRender = useSignal<number>(Number.parseInt(defaultDate.value.split('-')[0], 10));
    const dateToFocus = useSignal<LocalDate>(defaultDate.value);

    // Validate date format
    if (!DATE_REGEX.test(defaultDate.value)) {
      throw new Error('Invalid date format in Calendar. Please use YYYY-MM-DD format.');
    }

    // Computed values
    const calendarDays = useComputed$(() =>
      generateCalendarDays({
        month: monthToRender.value,
        year: yearToRender.value.toString(),
        fullWeeks,
      }),
    );

    const hMonth = MONTHS_LG[locale][Number.parseInt(monthToRender.value, 10) - 1];
    const headerTitle = `${hMonth} ${yearToRender.value}`;

    // Month navigation
    const navigateMonth = $((direction: 'prev' | 'next', newDate?: LocalDate) => {
      const currentMonth = Number.parseInt(monthToRender.value, 10);
      const day = (newDate ? newDate.split('-')[2] : '01') as `${number}`;

      if (direction === 'prev') {
        if (currentMonth === 1) {
          monthToRender.value = '12';
          yearToRender.value -= 1;
        } else {
          monthToRender.value = String(currentMonth - 1).padStart(2, '0') as Month;
        }
      } else {
        if (currentMonth === 12) {
          monthToRender.value = '01';
          yearToRender.value += 1;
        } else {
          monthToRender.value = String(currentMonth + 1).padStart(2, '0') as Month;
        }
      }

      // Update focused date to first day of new month
      dateToFocus.value = `${yearToRender.value}-${monthToRender.value}-${day}`;
    });

    // Keyboard navigation handler
    const keyDownHandler = createKeyDownHandler({
      currentMonth: monthToRender,
      navigateMonth: navigateMonth,
      updateFocusDate: dateToFocus,
    });

    // Focus management
    useVisibleTask$(({ track, cleanup }) => {
      track(() => calendarDays.value);

      if (calendarDays.value.flat().includes(dateToFocus.value)) {
        const button = document.querySelector<HTMLButtonElement>(`button[data-value="${dateToFocus.value}"]`);
        button?.focus();
        button?.setAttribute('tabindex', '0');
      }

      cleanup(() => {
        const button = document.querySelector<HTMLButtonElement>(`button[data-value="${dateToFocus.value}"]`);
        button?.setAttribute('tabindex', '-1');
        button?.blur();
      });
    });

    // Icons
    const IconLeft = IconLeftProp || ChevronLeft;
    const IconRight = IconRightProp || ChevronRight;

    return (
      <div data-qwik-date data-theme='light' aria-label={ARIA_LABELS[locale].root} {...containerProps}>
        {/* Header with navigation controls */}
        <header {...headerProps} class='calendar-header'>
          <button
            type='button'
            onClick$={[$(() => navigateMonth('prev')), actionButtonProps.onClick$, actionLeftProps.onClick$]}
            aria-label={ARIA_LABELS[locale].previous}
            {...actionLeftProps}
          >
            <IconLeft {...iconProps} class='nav-icon' />
          </button>

          <div aria-live='polite' role='heading' aria-level={2} {...titleProps} class='calendar-title'>
            {headerTitle}
          </div>

          <button
            type='button'
            onClick$={[$(() => navigateMonth('next')), actionButtonProps.onClick$, actionRightProps.onClick$]}
            aria-label={ARIA_LABELS[locale].next}
            {...actionRightProps}
          >
            <IconRight {...iconProps} class='nav-icon' />
          </button>
        </header>

        {/* Calendar grid */}
        <table role='grid' aria-labelledby='calendar-title' {...calendarProps} class='calendar-grid'>
          {/* Weekday headers */}
          {showDaysOfWeek && (
            <thead {...theadProps}>
              <tr {...theadRowProps} class='weekdays-row'>
                {showWeekNumber && <th scope='col' aria-label='Week number' {...headerCellProps} />}
                {WEEKDAYS[locale].map((day) => (
                  <th key={day} scope='col' aria-label={day} {...headerCellProps} class='weekday-header'>
                    {day.slice(0, 2)}
                  </th>
                ))}
              </tr>
            </thead>
          )}

          {/* Calendar body */}
          <tbody
            {...tbodyProps}
            onKeyDown$={[keyDownHandler, tbodyProps.onKeyDown$]}
            class='calendar-body'
            preventdefault:keydown
          >
            {calendarDays.value.map((week, weekIndex) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
              <tr key={`week-${weekIndex}`} {...tbodyRowProps} class='calendar-week'>
                {/* Week number column */}
                {showWeekNumber && (
                  <td {...weekNumberProps} class='week-number' aria-label={`Week ${getISOWeekNumber(week[0]!)}`}>
                    {getISOWeekNumber(week[0]!)}
                  </td>
                )}

                {/* Calendar days */}
                {week.map((day) => {
                  const isDisabled = day?.split('-')[1] !== monthToRender.value;
                  const isSelected = day === activeDate.value;
                  const isToday = day === defaultDate.value;

                  return (
                    <td
                      key={day || `empty-${weekIndex}`}
                      role='presentation'
                      aria-disabled={isDisabled}
                      {...cellProps}
                      class={`calendar-day ${isDisabled ? 'disabled' : ''}`}
                    >
                      {day && (
                        <button
                          type='button'
                          data-value={day}
                          data-selected={isSelected}
                          data-today={isToday}
                          disabled={isDisabled}
                          aria-label={dateFormatter(locale).format(new Date(day))}
                          tabIndex={day === dateToFocus.value ? 0 : -1}
                          {...dayButtonProps}
                          onClick$={[
                            $(() => {
                              activeDate.value = day;
                              onDateChange$?.(day);
                            }),
                            dayButtonProps.onClick$,
                          ]}
                          class='day-button'
                        >
                          {day.split('-')[2]}
                        </button>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  },
);
