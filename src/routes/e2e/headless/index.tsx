import { $, component$, useSignal } from '@qwik.dev/core';
import { Calendar as Styled } from '../../../lib';
import { Calendar, type LocalDate, useCalendar } from '../../../lib/headless';

const EVENTS = ['2024-08-05', '2024-08-20'];

/** Rows of your own: a dot on the days with events. `Cell` and `Day` keep the state, the choice and the keyboard. */
const EventDays = component$(() => {
  const calendar = useCalendar();

  return (
    <tbody>
      {calendar.grids.value[0].weeks.map((week) => (
        <tr key={week.number}>
          {week.days.map((day, i) => (
            <Calendar.Cell key={day?.date ?? i} day={day?.date}>
              {day && (
                <Calendar.Day day={day.date} class='event-day'>
                  {day.date.slice(8)}
                  {EVENTS.includes(day.date) && <small class='dot'>•</small>}
                </Calendar.Day>
              )}
            </Calendar.Cell>
          ))}
        </tr>
      ))}
    </tbody>
  );
});

/** What `useCalendar()` gives: the state, and its handlers on buttons of the page. */
const Readout = component$(() => {
  const calendar = useCalendar<LocalDate>();
  const { year, month } = calendar.month.value;

  return (
    <div>
      <output id='month'>{`${year}-${month}`}</output>
      <output id='tab-day'>{calendar.tabDay.value ?? 'none'}</output>
      <output id='value'>{calendar.value.value ?? 'null'}</output>
      <output id='limits'>{`${calendar.canGoBack.value}/${calendar.canGoForward.value}`}</output>
      <button id='select-20' type='button' onClick$={() => calendar.select$('2024-08-20')}>
        select$ 2024-08-20
      </button>
      <button id='select-disabled' type='button' onClick$={() => calendar.select$('2024-08-10')}>
        select$ 2024-08-10
      </button>
      <button id='next-month' type='button' onClick$={() => calendar.nextMonth$()}>
        nextMonth$
      </button>
      <button
        id='set-value'
        type='button'
        onClick$={() => {
          calendar.value.value = '2024-12-24';
        }}
      >
        value = 2024-12-24
      </button>
    </div>
  );
});

/** tests/e2e fixture: `qwik-date/headless`, its parts and `useCalendar()`. */
export default component$(() => {
  const changes = useSignal<string[]>([]);
  const stateChanges = useSignal<string[]>([]);

  return (
    <main style={{ display: 'grid', gap: '32px', padding: '32px' }}>
      <section id='parts'>
        <form>
          <Calendar.Root
            value='2024-08-15'
            name='due'
            class='headless'
            onChange$={$((date: LocalDate) => {
              changes.value = [...changes.value, date];
            })}
          >
            <header>
              <Calendar.PrevButton class='prev'>‹</Calendar.PrevButton>
              <Calendar.Title class='title' />
              <Calendar.NextButton class='next'>›</Calendar.NextButton>
            </header>
            <Calendar.Grid>
              <Calendar.GridHead cellProps={{ class: 'weekday' }} />
              <Calendar.GridBody dayProps={{ class: 'day' }} />
            </Calendar.Grid>
          </Calendar.Root>
        </form>
        <output id='changes'>{changes.value.join(',')}</output>
      </section>
      <section id='styled'>
        <Styled value='2024-08-15' />
      </section>
      <section id='limits'>
        <Calendar.Root value='2024-08-15' min='2024-07-10' max='2024-09-20'>
          <Calendar.PrevButton>‹</Calendar.PrevButton>
          <Calendar.Title />
          <Calendar.NextButton>›</Calendar.NextButton>
          <Calendar.Grid>
            <Calendar.GridBody />
          </Calendar.Grid>
        </Calendar.Root>
      </section>
      <section id='custom'>
        <Calendar.Root value='2024-08-15'>
          <Calendar.Title />
          <Calendar.Grid>
            <Calendar.GridHead />
            <EventDays />
          </Calendar.Grid>
        </Calendar.Root>
      </section>
      <section id='state'>
        <Calendar.Root
          value='2024-08-15'
          disabledDates={['2024-08-10']}
          onChange$={$((date: LocalDate) => {
            stateChanges.value = [...stateChanges.value, date];
          })}
        >
          <Calendar.Title />
          <Calendar.Grid>
            <Calendar.GridBody />
          </Calendar.Grid>
          <Readout />
        </Calendar.Root>
        <output id='state-changes'>{stateChanges.value.join(',')}</output>
      </section>
    </main>
  );
});
