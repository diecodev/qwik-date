import { $, component$, useSignal } from '@qwik.dev/core';
import { Calendar } from '../../../lib';

/** tests/e2e fixture: inline calendars in their default and configured shapes. */
export default component$(() => {
  const changes = useSignal<string[]>([]);

  return (
    // the bottom padding makes the page scrollable, to check that the grid keys don't scroll it
    <main style={{ fontFamily: 'Georgia, serif', display: 'grid', gap: '32px', padding: '32px 32px 1200px' }}>
      <section id='basic'>
        <Calendar
          date='2024-08-15'
          onDateChange$={$((date) => {
            changes.value = [...changes.value, date];
          })}
        />
        <output id='changes'>{changes.value.join(',')}</output>
        <button id='after' type='button'>
          after
        </button>
      </section>
      <section id='full-weeks'>
        <Calendar date='2024-08-15' fullWeeks showWeekNumber />
      </section>
      <section id='es'>
        <Calendar date='2024-08-15' locale='es' />
      </section>
      <section id='no-weekdays'>
        <Calendar date='2024-08-15' showDaysOfWeek={false} />
      </section>
      <section id='rtl'>
        <Calendar date='2024-08-15' containerProps={{ dir: 'rtl' }} />
      </section>
    </main>
  );
});
