import { type PropsOf, Slot, component$, sync$, useContext } from '@qwik.dev/core';
import type { CalendarDay, CalendarGrid, LocalDate } from '../core';
import { CalendarContextId } from './context';

/** The previous month button: its label, `aria-disabled` at `min`, and the change of month. The icon goes inside. */
export const PrevButton = component$<PropsOf<'button'>>(({ onClick$, ...props }) => {
  const context = useContext(CalendarContextId);

  return (
    <button
      type='button'
      aria-label={context.labels.value.previousMonth}
      // aria-disabled, not disabled: a disabled button would drop the focus when it reaches the limit
      aria-disabled={context.canGoBack.value ? undefined : 'true'}
      {...props}
      onClick$={[context.prevMonth$, onClick$]}
    >
      <Slot />
    </button>
  );
});

/** The next month button, as `PrevButton`: `aria-disabled` at `max`. */
export const NextButton = component$<PropsOf<'button'>>(({ onClick$, ...props }) => {
  const context = useContext(CalendarContextId);

  return (
    <button
      type='button'
      aria-label={context.labels.value.nextMonth}
      aria-disabled={context.canGoForward.value ? undefined : 'true'}
      {...props}
      onClick$={[context.nextMonth$, onClick$]}
    >
      <Slot />
    </button>
  );
});

/** The month on show, "August 2024": it names the grid, and screen readers announce it when it changes. */
export const Title = component$<PropsOf<'div'>>(({ id, ...props }) => {
  const context = useContext(CalendarContextId);

  return (
    <div id={id ?? context.titleId} aria-live='polite' role='presentation' {...props}>
      {context.grids.value[0].title}
    </div>
  );
});

/**
 * Only cancels the default action of the keys the grid handles, pressed on a day (the same list as the root's
 * ACTION_KEYS: sync$ code can't reference outer variables), so Tab still moves the focus out and Escape still
 * closes a popover around the calendar. It must be sync$: a $ handler runs too late.
 */
const preventGridKeys = sync$((e: KeyboardEvent) => {
  const keys = ['enter', ' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'home', 'end', 'pageup', 'pagedown'];
  if (keys.includes(e.key.toLowerCase()) && (e.target as Element).closest('[data-value]')) e.preventDefault();
});

/**
 * The `<table role="grid">`, named after the title, with the keyboard: arrows, Home/End, PageUp/PageDown, and
 * Enter/Space to choose. Its body can be `GridBody` or rows of your own, with `Cell` and `Day`.
 */
export const Grid = component$<PropsOf<'table'>>(({ 'aria-labelledby': labelledBy, onKeyDown$, ...props }) => {
  const context = useContext(CalendarContextId);

  return (
    <table
      tabIndex={-1}
      role='grid'
      aria-labelledby={labelledBy ?? context.titleId}
      {...props}
      // the handler itself, not a wrapper calling it: one less async hop keeps queued keys in order
      onKeyDown$={[preventGridKeys, context.keyDown$, onKeyDown$]}
    >
      <Slot />
    </table>
  );
});

/** The `<thead>` with the weekday names. */
export const GridHead = component$<PropsOf<'thead'> & { rowProps?: PropsOf<'tr'>; cellProps?: PropsOf<'th'> }>(
  ({ rowProps, cellProps, ...props }) => {
    const context = useContext(CalendarContextId);

    return (
      <thead {...props}>
        <tr {...rowProps}>
          {context.showWeekNumber.value && <td />}
          {context.weekdays.value.map((day) => (
            <th key={day.long} scope='col' aria-label={day.long} {...cellProps}>
              {day.short}
            </th>
          ))}
        </tr>
      </thead>
    );
  },
);

/** The attributes of a day's cell: a selected gridcell when it's selected or in the range. */
const cellAttributes = (day: CalendarDay | null | undefined) => ({
  'aria-selected': day?.selected || day?.inRange ? ('true' as const) : undefined,
  // the empty cells and the days of the adjacent months too
  'aria-disabled': !day || day.disabled,
});

/** The attributes of a day button: its state in `data-*`, to style it. */
const dayAttributes = (day: CalendarDay) => ({
  type: 'button' as const,
  'data-selected': day.selected,
  'data-range-start': day.rangeStart,
  'data-range-end': day.rangeEnd,
  'data-in-range': day.inRange,
  'data-value': day.date,
  'aria-label': day.label,
  'aria-current': day.today ? ('date' as const) : undefined,
  'data-unavailable': day.unavailable,
  disabled: day.disabled,
  tabIndex: day.tabbable ? 0 : -1,
});

/** The state of a day on show: in its own month, when a grid also shows it as a day of an adjacent month. */
const findDay = (grids: CalendarGrid[], date: LocalDate) => {
  const days = grids.flatMap((grid) => grid.weeks.flatMap((week) => week.days)).filter((day) => day?.date === date);
  return days.find((day) => !day?.outside) ?? days[0] ?? null;
};

export interface GridBodyProps extends PropsOf<'tbody'> {
  rowProps?: PropsOf<'tr'>;
  cellProps?: PropsOf<'td'>;
  /** the props of every day button */
  dayProps?: PropsOf<'button'>;
  weekNumberProps?: PropsOf<'td'>;
}

/** The `<tbody>` with the weeks of the month on show: a row per week, a cell per day, a button per day. */
export const GridBody = component$<GridBodyProps>(
  ({ rowProps, cellProps, dayProps = {}, weekNumberProps, ...props }) => {
    const context = useContext(CalendarContextId);

    return (
      <tbody {...props}>
        {context.grids.value[0].weeks.map((week) => {
          const key = week.days.map((day) => day?.date ?? '').join();
          return (
            <tr key={key} {...rowProps}>
              {context.showWeekNumber.value && (
                <td {...weekNumberProps}>
                  <span>{week.number.toString()}</span>
                </td>
              )}
              {week.days.map((day) => (
                <td key={`${key}-${day?.date ?? null}`} {...cellAttributes(day)} {...cellProps}>
                  {day && (
                    <button {...dayAttributes(day)} {...dayProps} onClick$={[context.pick$, dayProps.onClick$]}>
                      {day.date.slice(8)}
                    </button>
                  )}
                </td>
              ))}
            </tr>
          );
        })}
      </tbody>
    );
  },
);

/** A cell of rows of your own: a selected gridcell when its day is. Without a day, an empty cell. */
export const Cell = component$<PropsOf<'td'> & { day?: LocalDate | null }>(({ day, ...props }) => {
  const context = useContext(CalendarContextId);

  return (
    <td {...cellAttributes(day ? findDay(context.grids.value, day) : null)} {...props}>
      <Slot />
    </td>
  );
});

/** A day button of rows of your own: its state, where Tab enters, and choosing it. Its content goes inside. */
export const Day = component$<PropsOf<'button'> & { day: LocalDate }>(({ day, onClick$, ...props }) => {
  const context = useContext(CalendarContextId);
  const state = findDay(context.grids.value, day);
  if (!state) return null;

  return (
    <button {...dayAttributes(state)} {...props} onClick$={[context.pick$, onClick$]}>
      <Slot />
    </button>
  );
});
