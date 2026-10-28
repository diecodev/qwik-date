import { component$, useSignal } from '@qwik.dev/core';
import { Calendar, DatePicker, type Theme } from '../../../lib';

/** tests/e2e fixture: the `theme` prop, as a value and as a Signal. */
export default component$(() => {
  const theme = useSignal<Theme>('light');

  return (
    <main style={{ display: 'grid', gap: '32px', padding: '32px' }}>
      <section id='default'>
        <Calendar value='2024-08-15' />
      </section>
      <section id='dark' style={{ background: 'black', padding: '16px' }}>
        <Calendar value='2024-08-15' theme='dark' showWeekNumber />
      </section>
      <section id='auto'>
        <Calendar value='2024-08-15' theme='auto' />
      </section>
      <section id='signal'>
        <Calendar value='2024-08-15' theme={theme} />
        <button
          id='toggle-theme'
          type='button'
          onClick$={() => {
            theme.value = theme.value === 'light' ? 'dark' : 'light';
          }}
        >
          toggle theme
        </button>
      </section>
      <section id='picker' style={{ background: 'black', padding: '16px' }}>
        <DatePicker value='2024-08-15' theme='dark' />
      </section>
    </main>
  );
});
