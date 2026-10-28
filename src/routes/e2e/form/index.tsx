import { component$, useSignal } from '@qwik.dev/core';
import { Calendar, DatePicker } from '../../../lib';

/** tests/e2e fixture: `name` submits the value with the form. */
export default component$(() => {
  const entries = useSignal('');

  return (
    <main style={{ padding: '32px' }}>
      <form
        id='form'
        preventdefault:submit
        onSubmit$={(_, form) => {
          entries.value = [...new FormData(form)].map(([key, value]) => `${key}=${value}`).join('&');
        }}
        style={{ display: 'grid', gap: '32px' }}
      >
        <section id='single'>
          <Calendar name='day' value='2024-08-15' />
        </section>
        <section id='range'>
          <Calendar name='stay' mode='range' value={{ start: '2024-08-05', end: '2024-08-12' }} />
        </section>
        <section id='picker'>
          <DatePicker name='picked' />
        </section>
        <button id='submit' type='submit'>
          submit
        </button>
      </form>
      <output id='entries'>{entries.value}</output>
    </main>
  );
});
