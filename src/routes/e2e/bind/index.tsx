import { component$, useSignal } from '@qwik.dev/core';
import { Calendar } from '../../../lib';

/** tests/e2e fixture: `bind:date` in both directions. */
export default component$(() => {
  const date = useSignal<`${number}-${number}-${number}`>('2024-08-01');

  return (
    <main style={{ padding: '32px' }}>
      <section id='bound'>
        <Calendar bind:date={date} />
        <output id='value'>{date.value}</output>
        <button
          id='set-external'
          type='button'
          onClick$={() => {
            date.value = '2024-12-25';
          }}
        >
          set 2024-12-25
        </button>
      </section>
    </main>
  );
});
