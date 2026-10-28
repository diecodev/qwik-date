import { component$, useSignal } from '@qwik.dev/core';
import { Calendar } from '../../../lib';

/** tests/e2e fixture: `unstyled` changing at runtime. */
export default component$(() => {
  const unstyled = useSignal(true);

  return (
    <main style={{ padding: '32px' }}>
      <section id='toggle'>
        <Calendar value='2024-08-15' unstyled={unstyled.value} />
        <button
          id='toggle-unstyled'
          type='button'
          onClick$={() => {
            unstyled.value = !unstyled.value;
          }}
        >
          toggle unstyled
        </button>
      </section>
    </main>
  );
});
