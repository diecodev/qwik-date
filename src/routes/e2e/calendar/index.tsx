import { $, type PropsOf, component$, useSignal } from '@qwik.dev/core';
import { Calendar } from '../../../lib';

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
      <section id='custom-nav'>
        <Calendar
          date='2024-08-15'
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
