import { $, component$, useSignal } from '@qwik.dev/core';
import { Calendar, DatePicker } from '../../../lib';

/** tests/e2e fixture: DatePicker variants, next to an inline calendar showing the same month. */
export default component$(() => {
  const picked = useSignal('');
  const showLate = useSignal(false);

  return (
    <main style={{ fontFamily: 'Georgia, serif', display: 'grid', gap: '32px', padding: '32px' }}>
      <section id='inline'>
        <Calendar date='2024-08-06' />
      </section>
      <section id='picker'>
        <DatePicker
          date='2024-08-06'
          onDateChange$={$((date) => {
            picked.value = date;
          })}
        />
        <output id='picked'>{picked.value}</output>
      </section>
      <section id='custom-id'>
        <DatePicker date='2024-08-15' containerProps={{ id: 'my-picker' }} />
      </section>
      <section id='unstyled'>
        <DatePicker date='2024-08-15' unstyled />
      </section>
      <section id='late'>
        <button
          id='toggle-late'
          type='button'
          onClick$={() => {
            showLate.value = !showLate.value;
          }}
        >
          toggle picker
        </button>
        {showLate.value && <DatePicker date='2024-08-15' />}
      </section>
    </main>
  );
});
