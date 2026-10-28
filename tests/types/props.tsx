// Type checks of the public props, run by `tsc` (not by Vitest): each `@ts-expect-error` must stay an error.
import { component$, useSignal } from '@qwik.dev/core';
import { Calendar, type DateRange, type Labels, type LocalDate, formatDate, formatDateRange } from '../../src/lib';
import type * as QwikDate from '../../src/lib';
import { Calendar as Headless, useCalendar } from '../../src/lib/headless';

// @ts-expect-error: the DatePicker is gone, a popover around the Calendar replaces it (README recipes)
export type RemovedDatePicker = typeof QwikDate.DatePicker;

const fr: Labels = {
  calendar: 'Calendrier',
  previousMonth: 'Mois précédent',
  nextMonth: 'Mois suivant',
  previousYear: 'Année précédente',
  nextYear: 'Année suivante',
  previousYears: 'Années précédentes',
  nextYears: 'Années suivantes',
  selectedDate: 'date sélectionnée :',
  selectedRange: 'période sélectionnée :',
  selectedDates: 'dates sélectionnées :',
};

export const Locales = component$(() => (
  <>
    <Calendar />
    <Calendar locale='es' />
    <Calendar locale='en' labels={{ calendar: 'Due date' }} />
    <Calendar locale='fr-FR' labels={fr} weekStartsOn={1} />
    {/* @ts-expect-error: a locale without built-in texts needs labels */}
    <Calendar locale='fr-FR' />
    {/* @ts-expect-error: ...all of them */}
    <Calendar locale='fr-FR' labels={{ calendar: 'Calendrier' }} />
    {/* @ts-expect-error: the trigger is yours now, there's no placeholder text */}
    <Calendar labels={{ placeholder: 'Pick a date' }} />
    {/* @ts-expect-error: weekdays go from 0 (Sunday) to 6 */}
    <Calendar weekStartsOn={7} />
  </>
));

export const Modes = component$(() => {
  const day = useSignal<LocalDate | null>(null);
  const range = useSignal<DateRange | null>(null);

  return (
    <>
      <Calendar value='2024-08-15' onChange$={(value) => value.length} />
      <Calendar bind:value={day} />
      <Calendar mode='range' value={{ start: '2024-08-05', end: null }} onChange$={(value) => value.end} />
      <Calendar mode='range' bind:value={range} />
      {/* @ts-expect-error: a range is a { start, end } */}
      <Calendar mode='range' value='2024-08-15' />
      {/* @ts-expect-error: ...in a signal too */}
      <Calendar mode='range' bind:value={day} />
      {/* @ts-expect-error: and a single day is not a range */}
      <Calendar bind:value={range} />
    </>
  );
});

// the formatters come from the entry point too: a trigger is one line
export const Triggers = component$(() => {
  const day = useSignal<LocalDate | null>(null);
  const range = useSignal<DateRange | null>(null);

  return (
    <>
      <button type='button'>{day.value ? formatDate(day.value) : 'Pick a date'}</button>
      <button type='button'>{range.value ? formatDateRange(range.value, 'es') : 'Elegir fechas'}</button>
      {/* @ts-expect-error: a day is a LocalDate, YYYY-MM-DD */}
      <span>{formatDate('15/08/2024')}</span>
    </>
  );
});

// qwik-date/headless: the parts take the same options as Calendar, and useCalendar() gives the state
export const HeadlessParts = component$(() => {
  const day = useSignal<LocalDate | null>(null);
  const range = useSignal<DateRange | null>(null);

  return (
    <>
      <Headless.Root bind:value={day} name='due' class='calendar'>
        <Headless.PrevButton>‹</Headless.PrevButton>
        <Headless.Title />
        <Headless.NextButton>›</Headless.NextButton>
        <Headless.Grid>
          <Headless.GridHead cellProps={{ class: 'weekday' }} />
          <Headless.GridBody dayProps={{ class: 'day' }} />
        </Headless.Grid>
      </Headless.Root>
      <Headless.Root mode='range' bind:value={range} onChange$={(value) => value.end} />
      <Headless.Root locale='fr-FR' labels={fr} />
      {/* @ts-expect-error: the same modes as Calendar: a range is a { start, end } */}
      <Headless.Root mode='range' bind:value={day} />
      {/* @ts-expect-error: a locale without built-in texts needs labels */}
      <Headless.Root locale='fr-FR' />
      {/* @ts-expect-error: the day of a cell of your own is a LocalDate */}
      <Headless.Day day='15/08/2024'>15</Headless.Day>
    </>
  );
});

export const HeadlessState = component$(() => {
  const calendar = useCalendar<DateRange>();
  const end: LocalDate | null | undefined = calendar.value.value?.end;
  // @ts-expect-error: the state is read-only, except the value
  calendar.month.value = { year: 2024, month: '09' };

  return (
    <button type='button' onClick$={() => calendar.select$('2024-08-15')}>
      {end}
    </button>
  );
});

// the months and years views: the title's button, their grids and handlers
export const HeadlessViews = component$(() => {
  const calendar = useCalendar();

  return (
    <Headless.Root>
      <Headless.Title button={false} />
      <Headless.Title buttonProps={{ class: 'title' }} />
      <Headless.MonthGrid buttonProps={{ class: 'month' }} />
      <Headless.YearGrid cellProps={{ class: 'year' }} />
      <button type='button' onClick$={() => calendar.setView$('months')}>
        {calendar.title.value}
      </button>
      {/* @ts-expect-error: the views are days, months and years */}
      <button type='button' onClick$={() => calendar.setView$('weeks')} />
      <button type='button' onClick$={() => calendar.chooseMonth$(2025, '02')} />
      {/* @ts-expect-error: a month is '01' to '12' */}
      <button type='button' onClick$={() => calendar.chooseMonth$(2025, '13')} />
    </Headless.Root>
  );
});

// mode="multiple": an array of days, [] for none
export const Multiple = component$(() => {
  const days = useSignal<LocalDate[]>([]);
  const day = useSignal<LocalDate | null>(null);

  return (
    <>
      <Calendar mode='multiple' value={['2024-08-05', '2024-08-20']} onChange$={(value) => value.length} />
      <Calendar mode='multiple' bind:value={days} name='days' />
      <Headless.Root mode='multiple' bind:value={days} />
      {/* @ts-expect-error: the value of mode="multiple" is an array */}
      <Calendar mode='multiple' value='2024-08-15' />
      {/* @ts-expect-error: ...in a signal too */}
      <Calendar mode='multiple' bind:value={day} />
      {/* @ts-expect-error: and an array isn't a single day */}
      <Calendar bind:value={days} />
    </>
  );
});
