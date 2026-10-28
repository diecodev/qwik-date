import { $, component$, useSignal } from '@qwik.dev/core';
import { Calendar } from '../../../lib';

/** tests/e2e fixture: `min`, `max`, `disabledDates` and `disabledWeekdays`. */
export default component$(() => {
  const changes = useSignal<string[]>([]);
  const ranges = useSignal<string[]>([]);

  return (
    <main style={{ display: 'grid', gap: '32px', padding: '32px' }}>
      <section id='limits'>
        <Calendar value='2024-08-15' min='2024-08-05' max='2024-08-25' />
      </section>
      <section id='weekdays'>
        <Calendar
          value='2024-08-14'
          disabledWeekdays={[0, 6]}
          disabledDates={['2024-08-15']}
          onChange$={$((date) => {
            changes.value = [...changes.value, date];
          })}
        />
        <output id='changes'>{changes.value.join(',')}</output>
      </section>
      <section id='range'>
        <Calendar
          mode='range'
          value={{ start: '2024-08-10', end: null }}
          disabledDates={['2024-08-14']}
          onChange$={$((range) => {
            ranges.value = [...ranges.value, `${range.start}/${range.end}`];
          })}
        />
        <output id='ranges'>{ranges.value.join(',')}</output>
      </section>
      <section id='future'>
        <Calendar min='2099-03-10' />
      </section>
      <section id='past'>
        <Calendar max='2000-01-20' />
      </section>
    </main>
  );
});
