import { $, component$, useSignal } from '@qwik.dev/core';
import { Calendar, type Labels, type LocalDate } from '../../../lib';
import { Calendar as Headless, useCalendar } from '../../../lib/headless';
import { DatePicker } from '../../../recipes/popover';

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
  selectedDates: 'dates sélectionnées :',
};

/** `useCalendar()` with the views: what it shows, and its handlers on buttons of the page. */
const ViewReadout = component$(() => {
  const calendar = useCalendar();

  return (
    <div>
      <output id='view'>{`${calendar.view.value} / ${calendar.title.value}`}</output>
      <button id='show-years' type='button' onClick$={() => calendar.setView$('years')}>
        setView$('years')
      </button>
      <button id='choose-month' type='button' onClick$={() => calendar.chooseMonth$(2025, '02')}>
        chooseMonth$(2025, '02')
      </button>
    </div>
  );
});

/** tests/e2e fixture: the months and years views of the title. */
export default component$(() => {
  const changes = useSignal<string[]>([]);
  const picked = useSignal<LocalDate | null>('2024-08-15');

  return (
    <main style={{ display: 'grid', gap: '32px', padding: '32px' }}>
      <section id='basic'>
        <Calendar
          value='2024-08-15'
          onChange$={$((date: LocalDate) => {
            changes.value = [...changes.value, date];
          })}
        />
        <output id='changes'>{changes.value.join(',')}</output>
      </section>
      <section id='limits'>
        <Calendar value='2024-08-15' min='2024-03-10' max='2025-10-05' />
      </section>
      <section id='es'>
        <Calendar value='2024-08-15' locale='es' />
      </section>
      <section id='fr'>
        <Calendar value='2024-08-15' locale='fr-FR' labels={FR} />
      </section>
      <section id='popover'>
        <DatePicker bind:value={picked} />
      </section>
      <section id='headless'>
        <Headless.Root value='2024-08-15'>
          <Headless.Title />
          <Headless.Grid>
            <Headless.GridBody />
          </Headless.Grid>
          <Headless.MonthGrid class='months' />
          <Headless.YearGrid class='years' />
          <ViewReadout />
        </Headless.Root>
      </section>
    </main>
  );
});
