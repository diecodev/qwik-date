import { type PropsOf, Slot, component$, createContextId, sync$, useContext, useContextProvider } from '@qwik.dev/core';
import type { CalendarDay, CalendarGrid, CalendarPeriod, LocalDate } from '../core';
import { type CalendarContext, CalendarContextId } from './context';

/**
 * The previous button: a month back, or a year or twelve years in the months and years views. Its label,
 * `aria-disabled` at `min`, and the change. The icon goes inside.
 */
export const PrevButton = component$<PropsOf<'button'>>(({ onClick$, ...props }) => {
  const context = useContext(CalendarContextId);
  const { previousMonth, previousYear, previousYears } = context.labels.value;
  const view = context.view.value;

  return (
    <button
      type='button'
      aria-label={view === 'days' ? previousMonth : view === 'months' ? previousYear : previousYears}
      // aria-disabled, not disabled: a disabled button would drop the focus when it reaches the limit
      aria-disabled={context.canGoBack.value ? undefined : 'true'}
      {...props}
      onClick$={[context.prev$, onClick$]}
    >
      <Slot />
    </button>
  );
});

/** The next button, as `PrevButton`: `aria-disabled` at `max`. */
export const NextButton = component$<PropsOf<'button'>>(({ onClick$, ...props }) => {
  const context = useContext(CalendarContextId);
  const { nextMonth, nextYear, nextYears } = context.labels.value;
  const view = context.view.value;

  return (
    <button
      type='button'
      aria-label={view === 'days' ? nextMonth : view === 'months' ? nextYear : nextYears}
      aria-disabled={context.canGoForward.value ? undefined : 'true'}
      {...props}
      onClick$={[context.next$, onClick$]}
    >
      <Slot />
    </button>
  );
});

/** The index of the month of a `Grid`, for the `GridBody` inside it. */
const OffsetContextId = createContextId<number>('qwik-date.offset');

/** The id of the title of a month: it names its grid. */
const titleIdOf = (context: CalendarContext, offset: number) =>
  offset ? `${context.titleId}-${offset}` : context.titleId;

export interface TitleProps extends PropsOf<'div'> {
  /** with `months`, the index of the month: 0 for the first one (the default) */
  offset?: number;
  /** `false` for a title that's only text, without the months and years views */
  button?: boolean;
  buttonProps?: PropsOf<'button'>;
}

/**
 * The title of the view, "August 2024", "2024" or "2016 – 2027": it names the grid, and screen readers announce it
 * when it changes. Its button shows the months of the year, then the years, then the days again.
 */
export const Title = component$<TitleProps>(({ id, offset = 0, button = true, buttonProps = {}, ...props }) => {
  const context = useContext(CalendarContextId);
  // the months and years views show one grid, under the first title
  if (offset && context.view.value !== 'days') return null;

  return (
    <div id={id ?? titleIdOf(context, offset)} aria-live='polite' role='presentation' {...props}>
      {offset ? (
        context.grids.value[offset]?.title
      ) : button ? (
        // its name is its text, without an aria-label: the grid takes its name from the title
        <button type='button' data-view-toggle {...buttonProps} onClick$={[context.toggleView$, buttonProps.onClick$]}>
          {context.title.value}
        </button>
      ) : (
        context.title.value
      )}
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
export const Grid = component$<PropsOf<'table'> & { offset?: number }>(
  ({
    offset = 0,
    'aria-labelledby': labelledBy,
    onKeyDown$,
    onPointerOver$,
    onPointerLeave$,
    onFocusIn$,
    onFocusOut$,
    ...props
  }) => {
    const context = useContext(CalendarContextId);
    useContextProvider(OffsetContextId, offset);
    // only the days view: the months and years have their own grids
    if (context.view.value !== 'days') return null;
    // the preview of a range: only `mode="range"` listens to the pointer
    const range = context.mode.value === 'range';

    return (
      <table
        tabIndex={-1}
        role='grid'
        aria-labelledby={labelledBy ?? titleIdOf(context, offset)}
        {...props}
        // the handler itself, not a wrapper calling it: one less async hop keeps queued keys in order
        onKeyDown$={[preventGridKeys, context.keyDown$, onKeyDown$]}
        onPointerOver$={[range ? context.previewSync$ : undefined, onPointerOver$]}
        onFocusIn$={[range ? context.previewSync$ : undefined, onFocusIn$]}
        onPointerLeave$={[range ? context.previewSync$ : undefined, onPointerLeave$]}
        onFocusOut$={[range ? context.previewSync$ : undefined, onFocusOut$]}
      >
        <Slot />
      </table>
    );
  },
);

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
  'data-preview': day.preview,
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
    const grid = context.grids.value[useContext(OffsetContextId, 0)];
    if (!grid) return null;

    return (
      <tbody {...props}>
        {grid.weeks.map((week) => {
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

/**
 * Only cancels the default action of the keys the months and years grids handle, pressed on a cell (Escape is the
 * root's), as the days grid does.
 */
const preventPeriodKeys = sync$((e: KeyboardEvent) => {
  const keys = ['enter', ' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'];
  if (keys.includes(e.key.toLowerCase()) && (e.target as Element).closest('[data-month], [data-year]'))
    e.preventDefault();
});

export interface PeriodGridProps extends PropsOf<'table'> {
  rowProps?: PropsOf<'tr'>;
  cellProps?: PropsOf<'td'>;
  /** the props of every month or year button */
  buttonProps?: PropsOf<'button'>;
}

/** A grid of twelve months or years, in rows of three. */
const periodGrid = (
  context: CalendarContext,
  cells: CalendarPeriod[],
  { 'aria-labelledby': labelledBy, onKeyDown$, rowProps, cellProps, buttonProps = {}, ...props }: PeriodGridProps,
) => (
  <table
    tabIndex={-1}
    role='grid'
    aria-labelledby={labelledBy ?? context.titleId}
    {...props}
    onKeyDown$={[preventPeriodKeys, context.periodKeyDown$, onKeyDown$]}
  >
    <tbody>
      {[0, 3, 6, 9].map((start) => (
        <tr key={start} {...rowProps}>
          {cells.slice(start, start + 3).map((cell) => (
            <td
              key={cell.label}
              aria-selected={cell.selected ? 'true' : undefined}
              aria-disabled={cell.disabled}
              {...cellProps}
            >
              <button
                type='button'
                data-month={cell.month ? `${cell.year}-${cell.month}` : undefined}
                data-year={cell.month ? undefined : cell.year}
                data-selected={cell.selected}
                aria-current={cell.today ? 'date' : undefined}
                aria-label={cell.label}
                disabled={cell.disabled}
                tabIndex={cell.tabbable ? 0 : -1}
                {...buttonProps}
                onClick$={[context.pickPeriod$, buttonProps.onClick$]}
              >
                {cell.text}
              </button>
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>
);

/**
 * The months of a year, when the title is clicked: arrows, Enter or Space to show a month's days, Escape to go back.
 * Named after the title, like the days grid.
 */
export const MonthGrid = component$<PeriodGridProps>((props) => {
  const context = useContext(CalendarContextId);
  if (context.view.value !== 'months') return null;
  return periodGrid(context, context.monthCells.value, props);
});

/** Twelve years, when the title is clicked twice: a year shows the days of the same month in it. */
export const YearGrid = component$<PeriodGridProps>((props) => {
  const context = useContext(CalendarContextId);
  if (context.view.value !== 'years') return null;
  return periodGrid(context, context.yearCells.value, props);
});
