// Type checks of the public props, run by `tsc` (not by Vitest): each `@ts-expect-error` must stay an error.
import { component$ } from '@qwik.dev/core';
import { Calendar, DatePicker, type Labels } from '../../src/lib';

const fr: Labels = {
  calendar: 'Calendrier',
  previousMonth: 'Mois précédent',
  nextMonth: 'Mois suivant',
  selectedDate: 'date sélectionnée :',
  placeholder: 'Choisir une date',
};

export const Locales = component$(() => (
  <>
    <Calendar />
    <Calendar locale='es' />
    <Calendar locale='en' labels={{ calendar: 'Due date' }} />
    <Calendar locale='fr-FR' labels={fr} weekStartsOn={1} />
    <DatePicker locale='fr-FR' labels={fr} />
    {/* @ts-expect-error: a locale without built-in texts needs labels */}
    <Calendar locale='fr-FR' />
    {/* @ts-expect-error: a locale without built-in texts needs labels */}
    <DatePicker locale='fr-FR' />
    {/* @ts-expect-error: ...all of them */}
    <Calendar locale='fr-FR' labels={{ calendar: 'Calendrier' }} />
    {/* @ts-expect-error: weekdays go from 0 (Sunday) to 6 */}
    <Calendar weekStartsOn={7} />
  </>
));
