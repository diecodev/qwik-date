import { component$ } from '@qwik.dev/core';
import { Calendar } from '../../../lib';
import { Calendar as Headless, useCalendar } from '../../../lib/headless';

/** `useCalendar()` with two months: the titles of its grids. */
const GridTitles = component$(() => {
  const calendar = useCalendar();
  return <output id='grids'>{calendar.grids.value.map((grid) => grid.title).join(' | ')}</output>;
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
