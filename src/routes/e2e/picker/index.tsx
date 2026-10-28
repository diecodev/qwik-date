import { $, component$, useSignal } from '@qwik.dev/core';
import { Calendar, DatePicker, type Labels } from '../../../lib';

const FR: Labels = {
  calendar: 'Calendrier',
  previousMonth: 'Mois précédent',
  nextMonth: 'Mois suivant',
  selectedDate: 'date sélectionnée :',
  selectedRange: 'période sélectionnée :',
  placeholder: 'Choisir une date',
};

/** tests/e2e fixture: DatePicker variants, next to an inline calendar showing the same month. */
export default component$(() => {
  const picked = useSignal('');
  const showLate = useSignal(false);

  return (
    <main style={{ fontFamily: 'Georgia, serif', display: 'grid', gap: '32px', padding: '32px' }}>
      <section id='inline'>
        <Calendar value='2024-08-06' />
      </section>
      <section id='picker'>
        <DatePicker
          value='2024-08-06'
          onChange$={$((date) => {
            picked.value = date;
          })}
        />
        <output id='picked'>{picked.value}</output>
      </section>
      <section id='empty'>
        <DatePicker />
      </section>
      <section id='placeholder'>
        <DatePicker placeholder='Pick a date' />
      </section>
      <section id='es'>
        <DatePicker value='2024-08-01' locale='es' />
      </section>
      <section id='fr'>
        <DatePicker locale='fr-FR' labels={FR} />
      </section>
      <section id='keep-open'>
        <DatePicker value='2024-08-15' closeOnSelect={false} />
      </section>
      <section id='custom-id'>
        <DatePicker value='2024-08-15' containerProps={{ id: 'my-picker' }} />
      </section>
      <section id='unstyled'>
        <DatePicker value='2024-08-15' unstyled />
      </section>
      <section id='late'>
        <button
          id='toggle-late'
          type='button'
          onClick$={() => {
            showLate.value = !showLate.value;
          }}
        >
          toggle picker
        </button>
        {showLate.value && <DatePicker value='2024-08-15' />}
      </section>
    </main>
  );
});
