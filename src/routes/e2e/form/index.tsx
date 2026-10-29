import { component$, useSignal } from '@qwik.dev/core';
import { Form, routeAction$ } from '@qwik.dev/router';
import { Calendar } from '../../../lib';

/** What a Qwik Router action gets from the form. */
export const useEcho = routeAction$((data) => ({ json: JSON.stringify(data) }));

/** tests/e2e fixture: `name` submits the value with the form. */
export default component$(() => {
  const entries = useSignal('');
  const echo = useEcho();

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
        <section id='empty'>
          <Calendar name='none' />
        </section>
        <button id='submit' type='submit'>
          submit
        </button>
      </form>
      <output id='entries'>{entries.value}</output>
      <Form action={echo} id='action' style={{ display: 'grid', gap: '16px', marginTop: '32px' }}>
        <Calendar name='trip' mode='range' value={{ start: '2024-08-05', end: '2024-08-12' }} />
        <button id='action-submit' type='submit'>
          submit to the action
        </button>
      </Form>
      <output id='action-json'>{echo.value?.json}</output>
    </main>
  );
});
