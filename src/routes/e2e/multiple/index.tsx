import { $, component$, useSignal } from '@qwik.dev/core';
import { Form, routeAction$ } from '@qwik.dev/router';
import { Calendar, type LocalDate } from '../../../lib';

/** What a Qwik Router action receives from the form, as JSON. */
export const useEcho = routeAction$((data) => ({ json: JSON.stringify(data) }));

const show = (days: LocalDate[]) => days.join(' ') || 'none';

/** tests/e2e fixture: `mode="multiple"`. */
export default component$(() => {
  const changes = useSignal<string[]>([]);
  const disabledChanges = useSignal<string[]>([]);
  const bound = useSignal<LocalDate[]>([]);
  const echo = useEcho();

  return (
    <main style={{ display: 'grid', gap: '32px', padding: '32px' }}>
      <section id='multiple'>
        <Calendar
          mode='multiple'
          value={['2024-08-05', '2024-08-20']}
          onChange$={$((days: LocalDate[]) => {
            changes.value = [...changes.value, show(days)];
          })}
        />
        <output id='changes'>{changes.value.join(' | ')}</output>
      </section>
      <section id='bound'>
        <Calendar mode='multiple' bind:value={bound} />
        <output id='value'>{show(bound.value)}</output>
        <button
          id='set-external'
          type='button'
          onClick$={() => {
            bound.value = ['2024-12-24', '2024-12-26'];
          }}
        >
          set 2024-12-24 2024-12-26
        </button>
        <button
          id='clear'
          type='button'
          onClick$={() => {
            bound.value = [];
          }}
        >
          clear
        </button>
      </section>
      <section id='disabled'>
        <Calendar
          mode='multiple'
          value={['2024-08-15']}
          disabledWeekdays={[0, 6]}
          onChange$={$((days: LocalDate[]) => {
            disabledChanges.value = [...disabledChanges.value, show(days)];
          })}
        />
        <output id='disabled-changes'>{disabledChanges.value.join(' | ')}</output>
      </section>
      <section id='action'>
        <Form action={echo}>
          <Calendar mode='multiple' name='days' value={['2024-08-05', '2024-08-20']} />
          <Calendar mode='multiple' name='none' />
          <button id='submit' type='submit'>
            submit
          </button>
        </Form>
        <output id='received'>{echo.value?.json ?? 'nothing yet'}</output>
      </section>
    </main>
  );
});
