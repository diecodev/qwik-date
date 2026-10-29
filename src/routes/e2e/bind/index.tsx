import { component$, useSignal } from '@qwik.dev/core';
import { Calendar, type LocalDate } from '../../../lib';

/** tests/e2e fixture: `bind:value` in both directions. */
export default component$(() => {
  const value = useSignal<LocalDate | null>('2024-08-01');

  return (
    <main style={{ padding: '32px' }}>
      <section id='bound'>
        <Calendar bind:value={value} />
        <output id='value'>{String(value.value)}</output>
        <button
          id='set-external'
          type='button'
          onClick$={() => {
            value.value = '2024-12-25';
          }}
        >
          set 2024-12-25
        </button>
        <button
          id='clear'
          type='button'
          onClick$={() => {
            value.value = null;
          }}
        >
          clear
        </button>
      </section>
    </main>
  );
});
