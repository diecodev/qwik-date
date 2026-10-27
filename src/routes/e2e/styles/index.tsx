import { component$, useSignal } from '@qwik.dev/core';
import { Calendar } from '../../../lib';

/** tests/e2e fixture: `unStyled` changing at runtime. */
export default component$(() => {
  const unStyled = useSignal(true);

  return (
    <main style={{ padding: '32px' }}>
      <section id='toggle'>
        <Calendar date='2024-08-15' unStyled={unStyled.value} />
        <button
          id='toggle-unstyled'
          type='button'
          onClick$={() => {
            unStyled.value = !unStyled.value;
          }}
        >
          toggle unStyled
        </button>
      </section>
    </main>
  );
});
