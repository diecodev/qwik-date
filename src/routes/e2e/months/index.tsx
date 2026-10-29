import { component$, useSignal } from '@qwik.dev/core';
import { Calendar, type LocalDate } from '../../../lib';
import { Calendar as Headless, useCalendar } from '../../../lib/headless';

/** `useCalendar()` with two months: the titles of its grids. */
const GridTitles = component$(() => {
  const calendar = useCalendar();
  return <output id='grids'>{calendar.grids.value.map((grid) => grid.title).join(' | ')}</output>;
});

/** Two months bound to a signal, and buttons that write it from outside. */
const Outside = component$(() => {
  const date = useSignal<LocalDate | null>('2024-08-15');
  return (
    <>
      <Calendar months={2} bind:value={date} />
      <button
        type='button'
        id='outside-later'
        onClick$={() => {
          date.value = '2025-03-10';
        }}
      >
        2025-03-10
      </button>
      <button
        type='button'
        id='outside-shown'
        onClick$={() => {
          date.value = '2024-09-10';
        }}
      >
        2024-09-10
      </button>
      <button
        type='button'
        id='outside-earlier'
        onClick$={() => {
          date.value = '2024-05-10';
        }}
      >
        2024-05-10
      </button>
    </>
  );
});

/** tests/e2e fixture: `months`, several months side by side. */
export default component$(() => (
  <main style={{ display: 'grid', gap: '32px', padding: '32px' }}>
    <section id='two'>
      <Calendar months={2} value='2024-08-15' />
    </section>
    <section id='range'>
      <Calendar months={2} mode='range' value={{ start: '2024-08-28', end: '2024-09-03' }} />
    </section>
    <section id='limits'>
      <Calendar months={2} value='2024-08-15' max='2024-09-20' />
    </section>
    <section id='full-weeks'>
      <Calendar months={2} value='2024-08-15' fullWeeks />
    </section>
    <section id='outside'>
      <Outside />
    </section>
    <section id='headless'>
      <Headless.Root months={2} value='2024-08-15'>
        <Headless.Title />
        <Headless.Grid>
          <Headless.GridBody />
        </Headless.Grid>
        <Headless.Title offset={1} />
        <Headless.Grid offset={1}>
          <Headless.GridBody />
        </Headless.Grid>
        <GridTitles />
      </Headless.Root>
    </section>
  </main>
));
