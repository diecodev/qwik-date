import { component$, useSignal } from '@qwik.dev/core';
import { Calendar, type DateRange, type LocalDate } from '../../../lib';
import { DatePicker, DateRangePicker } from '../../../recipes/popover';

/** tests/e2e fixture: the native popover recipe of the docs, next to an inline calendar showing the same month. */
export default component$(() => {
  const day = useSignal<LocalDate | null>('2024-08-06');
  const range = useSignal<DateRange | null>({ start: '2024-08-05', end: '2024-08-12' });
  const picked = useSignal<LocalDate | null>('2024-08-15');
  const entries = useSignal('');

  return (
    <main style={{ display: 'grid', gap: '32px', padding: '32px' }}>
      <section id='inline'>
        <Calendar value='2024-08-06' />
      </section>
      <section id='picker'>
        <DatePicker bind:value={day} />
        <output id='day'>{day.value}</output>
      </section>
      <section id='range'>
        <DateRangePicker bind:value={range} />
      </section>
      <section id='form'>
        <form
          preventdefault:submit
          onSubmit$={(_, form) => {
            entries.value = [...new FormData(form)].map(([key, value]) => `${key}=${value}`).join('&');
          }}
        >
          <DatePicker bind:value={picked} name='picked' />
          <button id='submit' type='submit'>
            submit
          </button>
        </form>
        <output id='entries'>{entries.value}</output>
      </section>
      {/* far down the page: scrolled to the bottom of the window, it has no room below */}
      <section id='bottom' style={{ marginTop: '150vh', marginBottom: '50vh' }}>
        <DatePicker bind:value={day} />
      </section>
    </main>
  );
});
