import { component$, useSignal } from '@qwik.dev/core';
import { Calendar } from '../../../lib';

/** tests/e2e fixture: the page font, calendars that are popovers, and `unstyled` changing at runtime. */
export default component$(() => {
  const unstyled = useSignal(true);

  return (
    <main style={{ display: 'grid', gap: '32px', padding: '32px' }}>
      <section id='font' style={{ fontFamily: 'Georgia, serif' }}>
        <Calendar value='2024-08-06' />
      </section>
      <section id='popover'>
        <button id='open-styled' type='button' popovertarget='styled-popover'>
          open
        </button>
        <Calendar value='2024-08-15' containerProps={{ id: 'styled-popover', popover: 'auto' }} />
        <button id='open-unstyled' type='button' popovertarget='unstyled-popover'>
          open unstyled
        </button>
        <Calendar value='2024-08-15' unstyled containerProps={{ id: 'unstyled-popover', popover: 'auto' }} />
      </section>
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
