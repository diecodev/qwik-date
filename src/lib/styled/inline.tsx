import { type Component, type PropsOf, type Signal, component$, isSignal, useStyles$ } from '@qwik.dev/core';
import type { Theme } from '../core';
import {
  Grid,
  GridBody,
  GridHead,
  MonthGrid,
  NextButton,
  PrevButton,
  Root,
  Title,
  YearGrid,
} from '../headless/calendar';
import type { CalendarOptions } from '../headless/root';
import { ChevronLeft, ChevronRight } from './icons';
import styles from './style.css?inline';

export type CalendarProps = CalendarOptions & CalendarStyleProps;

interface CalendarStyleProps {
  showDaysOfWeek?: boolean;
  unstyled?: boolean;
  theme?: Theme | Signal<Theme>;
  prevIcon?: Component<PropsOf<'svg'>>;
  nextIcon?: Component<PropsOf<'svg'>>;
  // props to override
  /** without `onChange$`: the calendar's is the value's (the calendar has no input that fires a DOM change) */
  containerProps?: Omit<PropsOf<'div'>, 'onChange$'>;
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

/** The headless parts (`qwik-date/headless`) with the library's styles. */
export const Calendar = component$<CalendarProps>(
  ({
    showDaysOfWeek = true,
    unstyled,
    theme = 'light',
    prevIcon,
    nextIcon,
    containerProps = {},
    headerProps = {},
    navButtonProps = {},
    prevButtonProps = {},
    nextButtonProps = {},
    iconProps = {},
    titleProps = {},
    calendarProps = {},
    theadProps = {},
    tbodyProps = {},
    theadRowProps = {},
    tbodyRowProps = {},
    headerCellProps = {},
    cellProps = {},
    dayButtonProps = {},
    weekNumberProps = {},
    ...options
  }) => {
    // always called: hooks can't be conditional, `unstyled` instances are excluded by the stylesheet itself
    useStyles$(styles);

    const PrevIcon = prevIcon ?? ChevronLeft;
    const NextIcon = nextIcon ?? ChevronRight;

    return (
      <Root
        {...options}
        // the stylesheet styles [data-qwik-date]: the headless parts don't have it
        data-qwik-date
        data-unstyled={unstyled}
        data-theme={isSignal(theme) ? theme.value : theme}
        {...containerProps}
      >
        <header {...headerProps}>
          <PrevButton
            data-header-action
            {...navButtonProps}
            {...prevButtonProps}
            onClick$={[navButtonProps.onClick$, prevButtonProps.onClick$]}
          >
            <PrevIcon {...iconProps} />
          </PrevButton>

          <Title {...titleProps} />

          <NextButton
            data-header-action
            {...navButtonProps}
            {...nextButtonProps}
            onClick$={[navButtonProps.onClick$, nextButtonProps.onClick$]}
          >
            <NextIcon {...iconProps} />
          </NextButton>
        </header>

        {/* a custom title id still names the grid */}
        <Grid aria-labelledby={titleProps.id} {...calendarProps}>
          {showDaysOfWeek && <GridHead {...theadProps} rowProps={theadRowProps} cellProps={headerCellProps} />}
          <GridBody
            {...tbodyProps}
            rowProps={tbodyRowProps}
            cellProps={cellProps}
            dayProps={dayButtonProps}
            weekNumberProps={weekNumberProps}
          />
        </Grid>
        {/* the title's views: the months of a year and twelve years */}
        <MonthGrid data-period />
        <YearGrid data-period />
      </Root>
    );
  },
);
