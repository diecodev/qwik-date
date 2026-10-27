import { component$ } from '@qwik.dev/core';
import { Calendar } from '../../../lib';

/** tests/e2e fixture: the default date with and without an explicit `date`. */
export default component$(() => (
  <main style={{ padding: '32px' }}>
    <section id='today'>
      <Calendar />
    </section>
    <section id='dated'>
      <Calendar date='2024-08-15' />
    </section>
  </main>
));
