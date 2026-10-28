import { $, component$, useSignal } from '@qwik.dev/core';
import { Calendar, type DateRange } from '../lib';
import { Case, Demo, Focus, Probe, Steps, calendarOf, day } from './ui';

const show = (range: DateRange | null) => (range ? `${range.start} → ${range.end ?? 'null'}` : 'null');

/** The values a range calendar handed to `onChange$`, in order. */
const RangeChanges = component$<{ values: string[] }>(({ values }) => (
  <p class='pg-probe'>
    onChange$ calls ({values.length}): <output>{values.length ? values.join(', ') : 'none'}</output>
  </p>
));

const rangeDays = $((root: HTMLElement) => {
  const calendar = calendarOf(root);
  const texts = (selector: string) =>
    [...(calendar?.querySelectorAll(selector) ?? [])].map((el) => el.textContent).join(', ') || 'none';
  return `selected ${texts('button[data-selected]')} · in range ${texts('button[data-in-range]')}`;
});

export const RangeCases = component$(() => {
  const chosen = useSignal<string[]>([]);
  const swapped = useSignal<string[]>([]);
  const later = useSignal<string[]>([]);
  const keyed = useSignal<string[]>([]);
  const bound = useSignal<DateRange | null>({ start: '2024-08-15', end: null });

  return (
    <>
      <Case
        id='range-value'
        title='A range value'
        tests={['shows the value: the start and the end selected, the days between in range']}
      >
        <Steps>
          <li>
            <p>Look at the calendar, rendered with mode="range" and value from Aug 5 to Aug 12, 2024.</p>
            <p>
              The <b>05</b> and the <b>12</b> are black; the days between, <b>06 to 11</b>, have a darker grey than
              today's. All eight cells are selected gridcells, and the calendar is named{' '}
              <b>Calendar, selected range: Monday, August 5, 2024 – Monday, August 12, 2024</b>.
            </p>
          </li>
        </Steps>
        <Demo>
          <Calendar mode='range' value={{ start: '2024-08-05', end: '2024-08-12' }} />
          <Probe label='days' read$={rangeDays} />
          <Probe
            label='selected cells (aria-selected)'
            read$={(root) => `${calendarOf(root)?.querySelectorAll('td[aria-selected="true"]').length}`}
          />
          <Probe label='calendar name' read$={(root) => calendarOf(root)?.getAttribute('aria-label') ?? 'none'} />
        </Demo>
      </Case>

      <Case
        id='range-choose'
        title='Choosing a range'
        tests={['the first choice starts a range, the second ends it, the next starts a new one']}
      >
        <Steps>
          <li>
            <p>
              Click <b>20</b>.
            </p>
            <p>
              onChange$ receives <b>2024-08-20 → null</b>: a range with a start and no end yet. Only the 20 is selected;
              the name ends in "Tuesday, August 20, 2024 – …".
            </p>
          </li>
          <li>
            <p>
              Click <b>25</b>.
            </p>
            <p>
              <b>2024-08-20 → 2024-08-25</b>: the 20 and the 25 black, 21 to 24 in range.
            </p>
          </li>
          <li>
            <p>
              Click <b>10</b>.
            </p>
            <p>
              <b>2024-08-10 → null</b>: a new range starts, nothing is in range.
            </p>
          </li>
        </Steps>
        <Demo>
          <Calendar
            mode='range'
            value={{ start: '2024-08-05', end: '2024-08-12' }}
            onChange$={$((range) => {
              chosen.value = [...chosen.value, show(range)];
            })}
          />
          <RangeChanges values={chosen.value} />
          <Probe label='days' read$={rangeDays} />
          <Probe label='calendar name' read$={(root) => calendarOf(root)?.getAttribute('aria-label') ?? 'none'} />
        </Demo>
      </Case>

      <Case
        id='range-swap'
        title='An end before the start, and a one-day range'
        tests={['an end before the start swaps them, the same day twice is a one-day range']}
      >
        <Steps>
          <li>
            <p>
              Click <b>20</b>, then <b>10</b>.
            </p>
            <p>
              <b>2024-08-10 → 2024-08-20</b>: an end before the start swaps them.
            </p>
          </li>
          <li>
            <p>
              Click <b>15</b> twice.
            </p>
            <p>
              <b>2024-08-15 → null</b>, then <b>2024-08-15 → 2024-08-15</b>: a one-day range, only the 15 selected.
            </p>
          </li>
        </Steps>
        <Demo>
          <Calendar
            mode='range'
            value={{ start: '2024-08-05', end: '2024-08-12' }}
            onChange$={$((range) => {
              swapped.value = [...swapped.value, show(range)];
            })}
          />
          <RangeChanges values={swapped.value} />
          <Probe label='days' read$={rangeDays} />
        </Demo>
      </Case>

      <Case
        id='range-next-month'
        title='An end in a later month'
        tests={['the end can be in a later month, and the calendar stays on it']}
      >
        <Steps>
          <li>
            <p>
              Click <b>28</b>, then <b>›</b> and <b>03</b> of September.
            </p>
            <p>
              <b>2024-08-28 → 2024-09-03</b>. The calendar stays on <b>September 2024</b>, with 01 and 02 in range.
            </p>
          </li>
          <li>
            <p>
              Click <b>‹</b>.
            </p>
            <p>August: 28 black, 29 to 31 in range.</p>
          </li>
        </Steps>
        <Demo>
          <Calendar
            mode='range'
            value={{ start: '2024-08-05', end: '2024-08-12' }}
            onChange$={$((range) => {
              later.value = [...later.value, show(range)];
            })}
          />
          <RangeChanges values={later.value} />
          <Probe label='days' read$={rangeDays} />
        </Demo>
      </Case>

      <Case
        id='range-keys'
        title='Choosing a range with the keyboard'
        tests={['Enter and Space choose the start and the end']}
      >
        <Steps>
          <li>
            <p>
              Click <b>Focus Aug 20</b>, press <kbd>Enter</kbd>.
            </p>
            <p>
              <b>2024-08-20 → null</b>.
            </p>
          </li>
          <li>
            <p>
              Press <kbd>→</kbd> twice (Aug 22), then <kbd>Space</kbd>.
            </p>
            <p>
              <b>2024-08-20 → 2024-08-22</b>, with the 21 in range.
            </p>
          </li>
        </Steps>
        <Demo>
          <Focus on={day('2024-08-20')}>Focus Aug 20</Focus>
          <Calendar
            mode='range'
            value={{ start: '2024-08-05', end: '2024-08-12' }}
            onChange$={$((range) => {
              keyed.value = [...keyed.value, show(range)];
            })}
          />
          <RangeChanges values={keyed.value} />
          <Probe label='days' read$={rangeDays} />
        </Demo>
      </Case>

      <Case
        id='range-bind'
        title='bind:value with a range'
        tests={[
          'starts with the bound range and writes the choices to it',
          'follows the bound signal when it changes from outside, and clears with null',
        ]}
      >
        <Steps>
          <li>
            <p>Look at the calendar, bound to a signal that starts at Aug 15 with no end.</p>
            <p>Only the 15 is selected.</p>
          </li>
          <li>
            <p>
              Click <b>18</b>.
            </p>
            <p>
              The signal becomes <b>2024-08-15 → 2024-08-18</b>.
            </p>
          </li>
          <li>
            <p>
              Click <b>Set the signal to Dec 24–26</b>.
            </p>
            <p>
              <b>December 2024</b>, with 24 and 26 black and the 25 in range.
            </p>
          </li>
          <li>
            <p>
              Click <b>Clear the signal</b>.
            </p>
            <p>
              The signal is <b>null</b> and nothing is selected.
            </p>
          </li>
        </Steps>
        <Demo>
          <Calendar mode='range' bind:value={bound} />
          <p class='pg-probe'>
            bound signal: <output>{show(bound.value)}</output>
          </p>
          <Probe label='days' read$={rangeDays} />
          <p class='pg-row'>
            <button
              type='button'
              class='pg-button'
              onClick$={() => {
                bound.value = { start: '2024-12-24', end: '2024-12-26' };
              }}
            >
              Set the signal to Dec 24–26
            </button>
            <button
              type='button'
              class='pg-button'
              onClick$={() => {
                bound.value = null;
              }}
            >
              Clear the signal
            </button>
          </p>
        </Demo>
      </Case>
    </>
  );
});
