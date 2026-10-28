import { $, type PropsOf, component$, useSignal } from '@qwik.dev/core';
import { Calendar, type Labels } from '../../../lib';

const FR: Labels = {
  calendar: 'Calendrier',
  previousMonth: 'Mois précédent',
  nextMonth: 'Mois suivant',
  previousYear: 'Année précédente',
  nextYear: 'Année suivante',
  previousYears: 'Années précédentes',
  nextYears: 'Années suivantes',
  selectedDate: 'date sélectionnée :',
  selectedRange: 'période sélectionnée :',
};

const ArrowIcon = component$((props: PropsOf<'svg'>) => (
  <svg viewBox='0 0 24 24' width='16' height='16' aria-hidden='true' data-icon='arrow' {...props}>
    <path d='M4 12h16m-6-6 6 6-6 6' stroke='currentColor' fill='none' />
  </svg>
));

/** tests/e2e fixture: inline calendars in their default and configured shapes. */
export default component$(() => {
  const changes = useSignal<string[]>([]);
  const navClicks = useSignal<string[]>([]);

  return (
    // the bottom padding makes the page scrollable, to check that the grid keys don't scroll it
    <main style={{ fontFamily: 'Georgia, serif', display: 'grid', gap: '32px', padding: '32px 32px 1200px' }}>
      <section id='basic'>
        <Calendar
          value='2024-08-15'
          onChange$={$((date) => {
            changes.value = [...changes.value, date];
          })}
        />
        <output id='changes'>{changes.value.join(',')}</output>
        <button id='after' type='button'>
          after
        </button>
      </section>
      <section id='full-weeks'>
        <Calendar value='2024-08-15' fullWeeks showWeekNumber />
      </section>
      <section id='es'>
        <Calendar value='2024-08-15' locale='es' />
      </section>
      <section id='no-weekdays'>
        <Calendar value='2024-08-15' showDaysOfWeek={false} />
      </section>
      <section id='fr'>
        <Calendar value='2024-08-15' locale='fr-FR' labels={FR} />
      </section>
      <section id='es-labels'>
        <Calendar value='2024-08-15' locale='es' labels={{ calendar: 'Fecha de entrega' }} />
      </section>
      <section id='monday'>
        <Calendar value='2024-08-15' weekStartsOn={1} showWeekNumber />
      </section>
      <section id='rtl'>
        <Calendar value='2024-08-15' containerProps={{ dir: 'rtl' }} />
      </section>
      <section id='custom-nav'>
        <Calendar
          value='2024-08-15'
          nextIcon={ArrowIcon}
          navButtonProps={{ class: 'nav' }}
          prevButtonProps={{
            title: 'Previous',
            onClick$: $(() => {
              navClicks.value = [...navClicks.value, 'prev'];
            }),
          }}
          nextButtonProps={{ title: 'Next', class: 'next' }}
        />
        <output id='nav-clicks'>{navClicks.value.join(',')}</output>
      </section>
    </main>
  );
});
