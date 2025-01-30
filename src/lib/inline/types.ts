import type { Component, PropsOf, QRL, Signal } from '@builder.io/qwik';
import type { LocalDate } from '../core';

export interface CalendarInlineProps {
  locale?: Locale;
  showWeekNumber?: boolean;
  fullWeeks?: boolean;
  date?: LocalDate;
  'bind:date'?: Signal<LocalDate>;
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
  theme?: Theme;
  onDateChange$?: QRL<(date: LocalDate) => void>;
}

/** Supported locale codes */
export type Locale = 'en' | 'es'; // Extend with more locales as needed
/** Supported themes */
export type Theme = 'dark' | 'light' | 'auto';
