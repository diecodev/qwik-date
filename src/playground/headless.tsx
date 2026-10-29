import { $, type QRL, component$, useSignal } from '@qwik.dev/core';
import { Calendar as Styled } from '../lib';
import { Calendar, type LocalDate, useCalendar } from '../lib/headless';
import { Case, Changes, Demo, Focus, Probe, Steps } from './ui';

/** The headless calendar of a case (its root is the group). */
const rootOf = (root: HTMLElement) => root.querySelector<HTMLElement>('.pg-headless');

const selectedCells = $(
  (root: HTMLElement) =>
    [...(rootOf(root)?.querySelectorAll('td[aria-selected="true"]') ?? [])]
      .map((cell) => cell.textContent)
      .join(', ') || 'none',
);

const calendarName = $((root: HTMLElement) => rootOf(root)?.getAttribute('aria-label') ?? 'none');

const gridName = $((root: HTMLElement) => {
  const id = rootOf(root)?.querySelector('[role="grid"]')?.getAttribute('aria-labelledby');
  return (id && document.getElementById(id)?.textContent) || 'none';
});

/** The parts with no styles of the library: `.pg-headless` styles them by their data attributes, as an app would. */
const Parts = component$<{
  min?: LocalDate;
  max?: LocalDate;
  name?: string;
  onChange$?: QRL<(date: LocalDate) => void>;
}>(({ min, max, name, onChange$ }) => (
  <Calendar.Root value='2024-08-15' min={min} max={max} name={name} onChange$={onChange$} class='pg-headless'>
    <header>
      <Calendar.PrevButton>‹</Calendar.PrevButton>
      <Calendar.Title />
      <Calendar.NextButton>›</Calendar.NextButton>
    </header>
    <Calendar.Grid>
      <Calendar.GridHead />
      <Calendar.GridBody />
    </Calendar.Grid>
  </Calendar.Root>
));

const EVENTS = ['2024-08-05', '2024-08-20'];

/** Rows of their own, as in tests/e2e: a dot on the days with events. */
const EventDays = component$(() => {
  const calendar = useCalendar();

  return (
    <tbody>
      {calendar.grids.value[0].weeks.map((week) => (
        <tr key={week.number}>
          {week.days.map((day, i) => (
            <Calendar.Cell key={day?.date ?? i} day={day?.date}>
              {day && (
                <Calendar.Day day={day.date}>
                  {day.date.slice(8)}
                  {EVENTS.includes(day.date) && <small>•</small>}
                </Calendar.Day>
              )}
            </Calendar.Cell>
          ))}
        </tr>
      ))}
    </tbody>
  );
});

/** `useCalendar()` from a component inside the root: its state, and buttons calling its handlers. */
const Readout = component$(() => {
  const calendar = useCalendar<LocalDate>();
  const { year, month } = calendar.month.value;

  return (
    <div class='pg-demo'>
      <p class='pg-probe'>
        month: <output>{`${year}-${month}`}</output> · tabDay: <output>{calendar.tabDay.value ?? 'none'}</output> ·
        value: <output>{calendar.value.value ?? 'null'}</output> · canGoBack/canGoForward:{' '}
        <output>{`${calendar.canGoBack.value}/${calendar.canGoForward.value}`}</output>
      </p>
      <p class='pg-row'>
        <button type='button' class='pg-button' onClick$={() => calendar.select$('2024-08-20')}>
          select$('2024-08-20')
        </button>
        <button type='button' class='pg-button' onClick$={() => calendar.select$('2024-08-10')}>
          select$('2024-08-10')
        </button>
        <button type='button' class='pg-button' onClick$={() => calendar.next$()}>
          next$()
        </button>
        <button
          type='button'
          class='pg-button'
          onClick$={() => {
            calendar.value.value = '2024-12-24';
          }}
        >
          value.value = '2024-12-24'
        </button>
      </p>
    </div>
  );
});

export const HeadlessCases = component$(() => {
  const chosen = useSignal<string[]>([]);
  const fromState = useSignal<string[]>([]);
  const submitted = useSignal('');

  return (
    <>
      <p class='pg-note'>
        The calendars of this area come from <code>qwik-date/headless</code>: no library styles. The playground styles
        them by their attributes, as an app would: black for <code>data-selected</code>, grey for{' '}
        <code>aria-current="date"</code> (today), faded for the disabled days.
      </p>

      <Case
        id='headless-parts'
        title='The parts, without the library styles'
        tests={['the parts make an accessible calendar, without the library styles']}
      >
        <Steps>
          <li>
            <p>
              Look at the first calendar, made of Calendar.Root, PrevButton, Title, NextButton, Grid, GridHead and
              GridBody, with value 2024-08-15, next to a styled Calendar.
            </p>
            <p>
              The first one has no card, no shadow and no rounded days: only the playground's colors. It's a group named{' '}
              <b>Calendar, selected date: Thursday, August 15, 2024</b>, without data-qwik-date; its grid is named{' '}
              <b>August 2024</b>, and the 15 is its selected cell. The styled one keeps its card.
            </p>
          </li>
          <li>
            <p>Hover ‹ and ›, or read their names in the accessibility tree.</p>
            <p>
              <b>go to previous month</b> and <b>go to next month</b>.
            </p>
          </li>
        </Steps>
        <Demo>
          <div class='pg-row'>
            <Parts />
            <Styled value='2024-08-15' />
          </div>
          <Probe label='calendar name' read$={calendarName} />
          <Probe
            label='data-qwik-date / box-shadow'
            read$={(root) => {
              const calendar = root.querySelector('.pg-headless');
              if (!calendar) return 'none';
              return `${calendar.hasAttribute('data-qwik-date') ? 'present' : 'absent'} / ${getComputedStyle(calendar).boxShadow}`;
            }}
          />
          <Probe label='grid name' read$={gridName} />
          <Probe label='selected cells' read$={selectedCells} />
        </Demo>
      </Case>

      <Case
        id='headless-choose'
        title='Choosing with the parts'
        tests={['the parts choose a day with a click and with the keyboard, and submit it']}
      >
        <Steps>
          <li>
            <p>
              Click <b>20</b>, then <b>Submit</b>. The calendar is rendered with name="due" inside the form.
            </p>
            <p>
              onChange$ receives <b>2024-08-20</b>, and the form sends <b>due=2024-08-20</b>.
            </p>
          </li>
          <li>
            <p>
              Click <b>Focus Aug 20</b>, press <kbd>→</kbd>, then <kbd>Enter</kbd>.
            </p>
            <p>
              The focus moves to the <b>21</b>, and Enter chooses it: onChange$ receives <b>2024-08-21</b>.
            </p>
          </li>
          <li>
            <p>
              Press <kbd>PageDown</kbd>.
            </p>
            <p>
              <b>September 2024</b>, with the focus on the <b>21</b>.
            </p>
          </li>
        </Steps>
        <Demo>
          <Focus on='.pg-headless [data-value="2024-08-20"]'>Focus Aug 20</Focus>
          <form
            preventdefault:submit
            onSubmit$={(_, form) => {
              submitted.value = [...new FormData(form)].map(([key, value]) => `${key}=${value}`).join('&');
            }}
            class='pg-row'
          >
            <Parts
              name='due'
              onChange$={$((date: LocalDate) => {
                chosen.value = [...chosen.value, date];
              })}
            />
            <button type='submit' class='pg-button'>
              Submit
            </button>
          </form>
          <Changes values={chosen.value} />
          <p class='pg-probe'>
            submitted: <output>{submitted.value || 'nothing yet'}</output>
          </p>
        </Demo>
      </Case>

      <Case
        id='headless-limits'
        title='The month buttons at min and max'
        tests={['the month buttons change the month and stop at min and max']}
      >
        <Steps>
          <li>
            <p>
              Click <b>›</b>. The calendar is rendered with min="2024-07-10" and max="2024-09-20".
            </p>
            <p>
              <b>September 2024</b>, and › is faded (aria-disabled).
            </p>
          </li>
          <li>
            <p>
              Click <b>›</b> again.
            </p>
            <p>
              Still <b>September 2024</b>.
            </p>
          </li>
          <li>
            <p>
              Click <b>‹</b> twice.
            </p>
            <p>
              <b>July 2024</b>, with ‹ faded. <b>01–09</b> are faded and can't be clicked; the <b>10</b> can.
            </p>
          </li>
        </Steps>
        <Demo>
          <Parts min='2024-07-10' max='2024-09-20' />
          <Probe label='grid name' read$={gridName} />
          <Probe
            label='month buttons'
            read$={(root) =>
              [...(rootOf(root)?.querySelectorAll('header > button') ?? [])]
                .map((button) => `${button.textContent}: ${button.getAttribute('aria-disabled') ?? 'enabled'}`)
                .join(' / ')
            }
          />
        </Demo>
      </Case>

      <Case
        id='headless-custom'
        title='Rows of your own: useCalendar(), Cell and Day'
        tests={['rows of your own, with useCalendar(), Cell and Day, keep the state, the choice and the keyboard']}
      >
        <Steps>
          <li>
            <p>
              Look at the calendar: its body is a component of the case that reads useCalendar() and renders
              Calendar.Cell and Calendar.Day, with a dot on the days with events.
            </p>
            <p>
              A dot under the <b>05</b> and the <b>20</b>; the <b>15</b> is selected.
            </p>
          </li>
          <li>
            <p>
              Click <b>20</b>.
            </p>
            <p>
              The 20 is the selected cell, and the calendar is named{' '}
              <b>Calendar, selected date: Tuesday, August 20, 2024</b>.
            </p>
          </li>
          <li>
            <p>
              Click <b>Focus Aug 20</b>, press <kbd>↓</kbd>, then <kbd>End</kbd>.
            </p>
            <p>
              The focus moves to the <b>27</b>, then to the <b>31</b>.
            </p>
          </li>
          <li>
            <p>
              Press <kbd>→</kbd>, then <kbd>Space</kbd>.
            </p>
            <p>
              <b>September 2024</b> with the focus on the <b>01</b>; Space chooses it and the focus stays on it.
            </p>
          </li>
        </Steps>
        <Demo>
          <Focus on='.pg-headless [data-value="2024-08-20"]'>Focus Aug 20</Focus>
          <Calendar.Root value='2024-08-15' class='pg-headless'>
            <Calendar.Title />
            <Calendar.Grid>
              <Calendar.GridHead />
              <EventDays />
            </Calendar.Grid>
          </Calendar.Root>
          <Probe label='calendar name' read$={calendarName} />
          <Probe label='selected cells' read$={selectedCells} />
        </Demo>
      </Case>

      <Case
        id='headless-state'
        title='useCalendar(): the state and the handlers'
        tests={['useCalendar() gives the state and the handlers']}
      >
        <Steps>
          <li>
            <p>Look at the readout, from a component inside the root that calls useCalendar().</p>
            <p>
              month <b>2024-08</b>, tabDay <b>2024-08-15</b>, value <b>2024-08-15</b>, canGoBack/canGoForward{' '}
              <b>true/true</b>.
            </p>
          </li>
          <li>
            <p>
              Click <b>select$('2024-08-20')</b>.
            </p>
            <p>
              value and tabDay <b>2024-08-20</b>, and onChange$ receives <b>2024-08-20</b>, as with a click on the 20.
            </p>
          </li>
          <li>
            <p>
              Click <b>select$('2024-08-10')</b>. The calendar is rendered with
              disabledDates=&#123;['2024-08-10']&#125;.
            </p>
            <p>Nothing changes: a day that can't be chosen is ignored.</p>
          </li>
          <li>
            <p>
              Click <b>next$()</b>.
            </p>
            <p>
              month <b>2024-09</b> and tabDay <b>2024-09-01</b>; the value stays <b>2024-08-20</b>.
            </p>
          </li>
          <li>
            <p>
              Click <b>value.value = '2024-12-24'</b>.
            </p>
            <p>
              Written from outside the grid, the value shows its month: <b>December 2024</b>, with the 24 selected.
            </p>
          </li>
        </Steps>
        <Demo>
          <Calendar.Root
            value='2024-08-15'
            disabledDates={['2024-08-10']}
            class='pg-headless'
            onChange$={$((date: LocalDate) => {
              fromState.value = [...fromState.value, date];
            })}
          >
            <Calendar.Title />
            <Calendar.Grid>
              <Calendar.GridBody />
            </Calendar.Grid>
            <Readout />
          </Calendar.Root>
          <Changes values={fromState.value} />
        </Demo>
      </Case>
    </>
  );
});
