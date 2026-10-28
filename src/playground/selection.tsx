import { $, component$, useSignal, useVisibleTask$ } from '@qwik.dev/core';
import { Calendar, type LocalDate } from '../lib';
import { toLocalDateString } from '../lib/core';
import { Case, Changes, Demo, Focus, Probe, Steps, day, preselected, selectedCell } from './ui';

const today = () => `${toLocalDateString(new Date())} (${Intl.DateTimeFormat().resolvedOptions().timeZone})`;

/** Today on the server, which renders the calendar without `date` first, and in the browser. */
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
  const bound = useSignal<LocalDate>('2024-08-01');

  return (
    <>
      <Case
        id='selection-click'
        title='Choosing a day with the mouse'
        tests={['calls onDateChange$ once and marks the day as selected']}
      >
        <Steps>
          <li>
            <p>
              Click <b>20</b>.
            </p>
            <p>
              onDateChange$ is called once, with <b>2024-08-20</b>. The 20 turns black (selected) and its cell is the
              selected gridcell; the 15 loses its grey background: the preselected day follows the selection.
            </p>
          </li>
        </Steps>
        <Demo>
          <Calendar
            date='2024-08-15'
            onDateChange$={$((date) => {
              clicked.value = [...clicked.value, date];
            })}
          />
          <Changes values={clicked.value} />
          <Probe label='selected cell (aria-selected)' read$={selectedCell} />
          <Probe label='preselected' read$={preselected} />
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
              onDateChange$ calls (1): <b>2024-08-20</b>. The 20 is selected.
            </p>
          </li>
          <li>
            <p>
              Click <b>Focus Aug 21</b>, press <kbd>Space</kbd>.
            </p>
            <p>
              onDateChange$ calls (2): <b>2024-08-20, 2024-08-21</b>: one call per key press, never two.
            </p>
          </li>
        </Steps>
        <Demo>
          <p class='pg-row'>
            <Focus on={day('2024-08-20')}>Focus Aug 20</Focus>
            <Focus on={day('2024-08-21')}>Focus Aug 21</Focus>
          </p>
          <Calendar
            date='2024-08-15'
            onDateChange$={$((date) => {
              keyed.value = [...keyed.value, date];
            })}
          />
          <Changes values={keyed.value} />
        </Demo>
      </Case>

      <Case
        id='selection-bind'
        title='bind:date'
        tests={['writes the chosen day to the bound signal', 'follows the bound signal when it changes from outside']}
      >
        <Steps>
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
              The calendar moves to <b>December 2024</b> with the 25 preselected (grey). No day is selected (black): the
              selection of the 20 no longer matches the date.
            </p>
          </li>
        </Steps>
        <Demo>
          <Calendar bind:date={bound} />
          <p class='pg-probe'>
            bound signal: <output>{bound.value}</output>
          </p>
          <Probe label='selected cell (aria-selected)' read$={selectedCell} />
          <button
            type='button'
            class='pg-button'
            onClick$={() => {
              bound.value = '2024-12-25';
            }}
          >
            Set the signal to 2024-12-25
          </button>
        </Demo>
      </Case>

      <Case
        id='selection-today'
        title="The visitor's day by default"
        tests={["uses the visitor's day when no date is given, and keeps an explicit one"]}
      >
        <Steps>
          <li>
            <p>Look at the two calendars.</p>
            <p>
              The first one, without date, preselects today's day of the <b>browser</b> (below). The second one,
              rendered with date="2024-08-15", shows August 2024.
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
              "Browser" now shows another day than "server", and the first calendar preselects the <b>browser's</b> day
              (its month too, if it changed). The second one still shows August 2024.
            </p>
          </li>
        </Steps>
        <Demo>
          <Calendar />
          <Calendar date='2024-08-15' />
          <Today />
          <Probe label='first calendar preselects' read$={preselected} />
        </Demo>
        <p class='pg-note'>
          Safari has no timezone override: change the macOS time zone (System Settings › General › Date &amp; Time) and
          restart Safari. The automated test fakes the browser's clock instead (January 15, 2030).
        </p>
      </Case>
    </>
  );
});
