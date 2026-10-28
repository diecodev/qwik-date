import { $, component$, useSignal, useVisibleTask$ } from '@qwik.dev/core';
import { Calendar, type LocalDate } from '../lib';
import { toLocalDateString } from '../lib/core';
import { Case, Changes, Demo, Focus, Probe, Steps, day, selectedCell, todayMarked } from './ui';

const today = () => `${toLocalDateString(new Date())} (${Intl.DateTimeFormat().resolvedOptions().timeZone})`;

/** Today on the server, which renders the calendars first, and in the browser. */
const Today = component$(() => {
  const server = useSignal(today());
  const browser = useSignal('');

  useVisibleTask$(() => {
    browser.value = today();
  });

  return (
    <div>
      <p class='pg-probe'>
        server: <output>{server.value}</output>
      </p>
      <p class='pg-probe'>
        browser: <output>{browser.value}</output>
      </p>
    </div>
  );
});

export const SelectionCases = component$(() => {
  const clicked = useSignal<string[]>([]);
  const keyed = useSignal<string[]>([]);
  const bound = useSignal<LocalDate | null>('2024-08-01');
  // a day of this month other than today, for the calendar that shows both (computed once, on the server)
  const otherDay = useSignal(() => {
    const date = toLocalDateString(new Date());
    return `${date.slice(0, 8)}${date.endsWith('-01') ? '02' : '01'}` as LocalDate;
  });

  return (
    <>
      <Case
        id='selection-click'
        title='Choosing a day with the mouse'
        tests={['calls onChange$ once and moves the selection to the day']}
      >
        <Steps>
          <li>
            <p>Look at the calendar, rendered with value="2024-08-15".</p>
            <p>The 15 is selected (black) from the start.</p>
          </li>
          <li>
            <p>
              Click <b>20</b>.
            </p>
            <p>
              onChange$ is called once, with <b>2024-08-20</b>. The 20 turns black and its cell is the selected
              gridcell; the 15 isn't selected anymore: one selected day at a time.
            </p>
          </li>
        </Steps>
        <Demo>
          <Calendar
            value='2024-08-15'
            onChange$={$((date) => {
              clicked.value = [...clicked.value, date];
            })}
          />
          <Changes values={clicked.value} />
          <Probe label='selected cell (aria-selected)' read$={selectedCell} />
        </Demo>
      </Case>

      <Case
        id='selection-keys'
        title='Choosing a day with Enter and Space'
        tests={['Enter and Space choose the focused day once each']}
      >
        <Steps>
          <li>
            <p>
              Click <b>Focus Aug 20</b>, press <kbd>Enter</kbd>.
            </p>
            <p>
              onChange$ calls (1): <b>2024-08-20</b>. The 20 is selected.
            </p>
          </li>
          <li>
            <p>
              Click <b>Focus Aug 21</b>, press <kbd>Space</kbd>.
            </p>
            <p>
              onChange$ calls (2): <b>2024-08-20, 2024-08-21</b>: one call per key press, never two.
            </p>
          </li>
        </Steps>
        <Demo>
          <p class='pg-row'>
            <Focus on={day('2024-08-20')}>Focus Aug 20</Focus>
            <Focus on={day('2024-08-21')}>Focus Aug 21</Focus>
          </p>
          <Calendar
            value='2024-08-15'
            onChange$={$((date) => {
              keyed.value = [...keyed.value, date];
            })}
          />
          <Changes values={keyed.value} />
        </Demo>
      </Case>

      <Case
        id='selection-bind'
        title='bind:value'
        tests={[
          'selects the bound value from the start',
          'writes the chosen day to the bound signal',
          'follows the bound signal when it changes from outside',
          'clears the selection when the bound signal is set to null, staying on its month',
        ]}
      >
        <Steps>
          <li>
            <p>Look at the calendar, bound to a signal that starts at 2024-08-01.</p>
            <p>The 1st of August 2024 is selected.</p>
          </li>
          <li>
            <p>
              Click <b>20</b>.
            </p>
            <p>
              The bound signal becomes <b>2024-08-20</b>.
            </p>
          </li>
          <li>
            <p>
              Click <b>Set the signal to 2024-12-25</b>.
            </p>
            <p>
              The calendar moves to <b>December 2024</b> with the 25 selected.
            </p>
          </li>
          <li>
            <p>
              Click <b>Clear the signal</b>.
            </p>
            <p>
              The signal is <b>null</b> and no day is selected; the calendar stays on December 2024.
            </p>
          </li>
        </Steps>
        <Demo>
          <Calendar bind:value={bound} />
          <p class='pg-probe'>
            bound signal: <output>{String(bound.value)}</output>
          </p>
          <Probe label='selected cell (aria-selected)' read$={selectedCell} />
          <p class='pg-row'>
            <button
              type='button'
              class='pg-button'
              onClick$={() => {
                bound.value = '2024-12-25';
              }}
            >
              Set the signal to 2024-12-25
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

      <Case
        id='selection-today'
        title='Today, and the month a calendar opens on'
        tests={[
          "without a value, opens on the visitor's today with nothing selected",
          'marks today apart from the selected day',
        ]}
      >
        <Steps>
          <li>
            <p>Look at the first calendar, rendered without value.</p>
            <p>
              It opens on the month of today's day of the <b>browser</b> (the "browser" readout), with today grey
              (aria-current="date") and nothing selected.
            </p>
          </li>
          <li>
            <p>Look at the other two: value="2024-08-15", and another day of this month.</p>
            <p>
              The second opens on <b>August 2024</b>. The third shows today grey and its value black, two different
              days.
            </p>
          </li>
          <li>
            <p>
              To see the server and the browser disagree, give the browser a timezone where it's another day. In Chrome:
              DevTools › ⋮ › More tools › <b>Sensors</b> › Location › Other…, Timezone ID{' '}
              <code>Pacific/Kiritimati</code> (UTC+14). Keep DevTools open and reload. If "browser" still shows the same
              day as "server", use <code>Pacific/Pago_Pago</code> (UTC−11) instead.
            </p>
            <p>
              "Browser" now shows another day than "server", and the first calendar marks the <b>browser's</b> day as
              today (and opens on its month, if it changed). The second one still shows August 2024.
            </p>
          </li>
        </Steps>
        <Demo>
          {/* the readouts first: the three calendars make a tall column */}
          <Today />
          <Probe label='today in the first calendar' read$={todayMarked} />
          <Probe label='selected in the first calendar' read$={selectedCell} />
          <Probe
            label='today / selected in the third calendar'
            read$={(root) => {
              const third = root.querySelectorAll('[data-qwik-date]')[2];
              const today = third?.querySelector('[aria-current="date"]')?.getAttribute('data-value') ?? 'none';
              const selected = third?.querySelector('[data-selected]')?.getAttribute('data-value') ?? 'none';
              return `${today} / ${selected}`;
            }}
          />
          <Calendar />
          <Calendar value='2024-08-15' />
          <Calendar value={otherDay.value} />
        </Demo>
        <p class='pg-note'>
          Safari has no timezone override: change the macOS time zone (System Settings › General › Date &amp; Time) and
          restart Safari. The automated test fakes the browser's clock instead (January 15, 2030).
        </p>
      </Case>
    </>
  );
});
