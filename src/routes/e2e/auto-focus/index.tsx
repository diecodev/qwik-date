import { component$, useSignal } from '@qwik.dev/core';
import { useLocation } from '@qwik.dev/router';
import { Calendar } from '../../../lib';

/**
 * tests/e2e fixture: `autoFocus` in native popovers. With `?load`, also a calendar that's visible on load (only
 * then: it takes the focus).
 */
export default component$(() => {
  const location = useLocation();
  const mounted = useSignal(false);

  return (
    <main style={{ display: 'grid', gap: '32px', padding: '32px' }}>
      <section id='selected'>
        <button type='button' popovertarget='selected-popover'>
          open
        </button>
        <Calendar autoFocus value='2024-08-15' containerProps={{ id: 'selected-popover', popover: 'auto' }} />
      </section>
      <section id='empty'>
        <button type='button' popovertarget='empty-popover'>
          open
        </button>
        <Calendar
          autoFocus
          min='2099-03-10'
          disabledDates={['2099-03-10']}
          containerProps={{ id: 'empty-popover', popover: 'auto' }}
        />
      </section>
      <section id='without'>
        <button type='button' popovertarget='without-popover'>
          open
        </button>
        <Calendar value='2024-08-15' containerProps={{ id: 'without-popover', popover: 'auto' }} />
      </section>
      <section id='mount'>
        <button
          id='toggle-mount'
          type='button'
          onClick$={() => {
            mounted.value = !mounted.value;
          }}
        >
          mount
        </button>
        {mounted.value && <Calendar autoFocus value='2024-08-15' />}
      </section>
      {location.url.searchParams.has('load') && (
        <section id='load'>
          <Calendar autoFocus value='2024-08-15' />
        </section>
      )}
    </main>
  );
});
