import { component$ } from '@qwik.dev/core';
import { Calendar } from '../../../lib';

/** tests/e2e fixture: "today" and the opening month, with and without a `value`. */
export default component$(() => (
  <main style={{ padding: '32px' }}>
    <section id='today'>
      <Calendar />
    </section>
    <section id='dated'>
      <Calendar value='2024-08-15' />
    </section>
    {/* the month of the specs' fake "today" (2030-01-15), with another day selected */}
    <section id='today-and-value'>
      <Calendar value='2030-01-20' />
    </section>
  </main>
));
