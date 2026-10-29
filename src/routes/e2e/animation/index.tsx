import { component$, useStyles$ } from '@qwik.dev/core';
import { Calendar } from '../../../lib';
import { Calendar as Headless, useCalendar } from '../../../lib/headless';

// the animations of the docs, for the calendars inside .animated
export const ANIMATIONS = `
@media (prefers-reduced-motion: no-preference) {
  .animated [data-qwik-date] table:not([data-period]) > tbody > tr[data-direction='next'] { animation: month-next 200ms ease-out; }
  .animated [data-qwik-date] table:not([data-period]) > tbody > tr[data-direction='prev'] { animation: month-prev 200ms ease-out; }
  .animated [data-qwik-date] table[data-period] { animation: view-in 150ms ease-out; }
}
@keyframes month-next { from { opacity: 0; translate: 1rem 0; } }
@keyframes month-prev { from { opacity: 0; translate: -1rem 0; } }
@keyframes view-in { from { opacity: 0; scale: 0.96; } }
`;

/** `useCalendar().direction`. */
const DirectionReadout = component$(() => {
  const calendar = useCalendar();
  return <output id='direction'>{calendar.direction.value ?? 'null'}</output>;
});

/** tests/e2e fixture: the moments a calendar exposes to animate. */
export default component$(() => {
  useStyles$(ANIMATIONS);

  return (
    <main style={{ display: 'grid', gap: '32px', padding: '32px' }}>
      <section id='basic' class='animated'>
        <Calendar value='2024-08-15' />
      </section>
      <section id='months' class='animated'>
        <Calendar value='2024-08-15' months={2} />
      </section>
      <section id='plain'>
        <Calendar value='2024-08-15' />
      </section>
      <section id='headless'>
        <Headless.Root value='2024-08-15'>
          <Headless.PrevButton>‹</Headless.PrevButton>
          <Headless.Title />
          <Headless.NextButton>›</Headless.NextButton>
          <Headless.Grid>
            <Headless.GridBody />
          </Headless.Grid>
          <DirectionReadout />
        </Headless.Root>
      </section>
    </main>
  );
});
