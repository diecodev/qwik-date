// Type checks of the public props, run by `tsc` (not by Vitest): each `@ts-expect-error` must stay an error.
import { component$, useSignal } from '@qwik.dev/core';
import { Calendar, type DateRange, type Labels, type LocalDate, formatDate, formatDateRange } from '../../src/lib';
import type * as QwikDate from '../../src/lib';

// @ts-expect-error: the DatePicker is gone, a popover around the Calendar replaces it (README recipes)
export type RemovedDatePicker = typeof QwikDate.DatePicker;

const fr: Labels = {
  calendar: 'Calendrier',
  previousMonth: 'Mois précédent',
  nextMonth: 'Mois suivant',
  selectedDate: 'date sélectionnée :',
  selectedRange: 'période sélectionnée :',
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
