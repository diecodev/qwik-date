import { $, component$, useSignal } from '@qwik.dev/core';
import { Calendar, type DateRange } from '../../../lib';

const show = (range: DateRange | null) => (range ? `${range.start}/${range.end}` : 'null');

/** tests/e2e fixture: `mode="range"`. */
export default component$(() => {
  const changes = useSignal<string[]>([]);
  const bound = useSignal<DateRange | null>({ start: '2024-08-15', end: null });

  return (
    <main style={{ display: 'grid', gap: '32px', padding: '32px' }}>
      <section id='range'>
        <Calendar
          mode='range'
          value={{ start: '2024-08-05', end: '2024-08-12' }}
          onChange$={$((range) => {
            changes.value = [...changes.value, show(range)];
          })}
        />
        <output id='changes'>{changes.value.join(',')}</output>
      </section>
      <section id='bound'>
        <Calendar mode='range' bind:value={bound} />
        <output id='value'>{show(bound.value)}</output>
        <button
          id='set-external'
          type='button'
          onClick$={() => {
            bound.value = { start: '2024-12-24', end: '2024-12-26' };
          }}
        >
          set 2024-12-24/2024-12-26
        </button>
        <button
          id='clear'
          type='button'
          onClick$={() => {
            bound.value = null;
          }}
        >
          clear
        </button>
      </section>
    </main>
  );
});
