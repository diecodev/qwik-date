import { $, component$, useSignal } from '@qwik.dev/core';
import { Form, routeAction$ } from '@qwik.dev/router';
import { Calendar, type LocalDate } from '../lib';
import { Case, Demo, Focus, Probe, Steps, calendarOf, day } from './ui';

/** What a Qwik Router action receives from the form, as JSON. */
export const usePlaygroundEcho = routeAction$((data) => ({ json: JSON.stringify(data) }));

const show = (days: LocalDate[]) => days.join(' ') || 'none';

const MultipleChanges = component$<{ values: string[] }>(({ values }) => (
  <p class='pg-probe'>
    onChange$ calls ({values.length}): <output>{values.length ? values.join(' | ') : 'none'}</output>
  </p>
));

const selectedCells = $(
  (root: HTMLElement) =>
    [...(calendarOf(root)?.querySelectorAll('td[aria-selected="true"]') ?? [])]
      .map((cell) => cell.textContent)
      .join(', ') || 'none',
);

export const MultipleCases = component$(() => {
  const clicked = useSignal<string[]>([]);
  const keyed = useSignal<string[]>([]);
  const disabled = useSignal<string[]>([]);
  const bound = useSignal<LocalDate[]>([]);
  const echo = usePlaygroundEcho();

  return (
    <>
      <Case
        id='multiple-value'
        title='Several days'
        tests={['shows the value: every day selected, and named in the calendar']}
      >
        <Steps>
          <li>
            <p>Look at the calendar, rendered with mode="multiple" and value Aug 5 and Aug 20, 2024.</p>
            <p>
              The <b>05</b> and the <b>20</b> are black and are selected cells, nothing is "in range", and the calendar
              is named <b>Calendar, selected dates: Monday, August 5, 2024; Tuesday, August 20, 2024</b>.
            </p>
          </li>
        </Steps>
        <Demo>
          <Calendar mode='multiple' value={['2024-08-05', '2024-08-20']} />
          <Probe label='selected cells' read$={selectedCells} />
          <Probe label='calendar name' read$={(root) => calendarOf(root)?.getAttribute('aria-label') ?? 'none'} />
        </Demo>
      </Case>

      <Case
        id='multiple-click'
        title='A click marks and unmarks'
        tests={['a click marks a day and unmarks it, with no maximum, and onChange$ gets the days each time']}
      >
        <Steps>
          <li>
            <p>
              Click <b>10</b>.
            </p>
            <p>
              onChange$ receives <b>2024-08-05 2024-08-10 2024-08-20</b>: the days, in order.
            </p>
          </li>
          <li>
            <p>
              Click <b>05</b>.
            </p>
            <p>
              It's unmarked: <b>2024-08-10 2024-08-20</b>.
            </p>
          </li>
          <li>
            <p>
              Click <b>11</b>, <b>12</b> and <b>13</b>.
            </p>
            <p>
              All of them stay marked, there's no maximum: <b>five selected cells</b>.
            </p>
          </li>
        </Steps>
        <Demo>
          <Calendar
            mode='multiple'
            value={['2024-08-05', '2024-08-20']}
            onChange$={$((days: LocalDate[]) => {
              clicked.value = [...clicked.value, show(days)];
            })}
          />
          <MultipleChanges values={clicked.value} />
          <Probe label='selected cells' read$={selectedCells} />
        </Demo>
      </Case>

      <Case id='multiple-keys' title='Enter and Space' tests={['Enter and Space mark and unmark the focused day']}>
        <Steps>
          <li>
            <p>
              Click <b>Focus Aug 20</b>, press <kbd>Space</kbd>.
            </p>
            <p>
              The 20 is unmarked: <b>2024-08-05</b>.
            </p>
          </li>
          <li>
            <p>
              Press <kbd>→</kbd>, then <kbd>Enter</kbd>.
            </p>
            <p>
              The <b>21</b> is marked and keeps the focus: <b>2024-08-05 2024-08-21</b>.
            </p>
          </li>
        </Steps>
        <Demo>
          <Focus on={day('2024-08-20')}>Focus Aug 20</Focus>
          <Calendar
            mode='multiple'
            value={['2024-08-05', '2024-08-20']}
            onChange$={$((days: LocalDate[]) => {
              keyed.value = [...keyed.value, show(days)];
            })}
          />
          <MultipleChanges values={keyed.value} />
          <Probe label='selected cells' read$={selectedCells} />
        </Demo>
      </Case>

      <Case
        id='multiple-bind'
        title='bind:value with days'
        tests={['bind:value starts empty, gets the choices, and follows the signal from outside']}
      >
        <Steps>
          <li>
            <p>Look at the calendar, bound to a signal that starts as [].</p>
            <p>
              Nothing is selected, and the calendar is named <b>Calendar</b>.
            </p>
          </li>
          <li>
            <p>
              Click <b>Set the signal to Dec 24 and 26</b>.
            </p>
            <p>
              <b>December 2024</b>, with the 24 and the 26 selected.
            </p>
          </li>
          <li>
            <p>
              Click <b>25</b>, then <b>24</b>.
            </p>
            <p>
              The signal becomes <b>2024-12-24 2024-12-25 2024-12-26</b>, then <b>2024-12-25 2024-12-26</b>.
            </p>
          </li>
          <li>
            <p>
              Click <b>Clear the signal</b>.
            </p>
            <p>
              The signal is <b>[]</b> and nothing is selected.
            </p>
          </li>
        </Steps>
        <Demo>
          <Calendar mode='multiple' bind:value={bound} />
          <p class='pg-probe'>
            bound signal: <output>{bound.value.length ? show(bound.value) : '[]'}</output>
          </p>
          <Probe label='selected cells' read$={selectedCells} />
          <p class='pg-row'>
            <button
              type='button'
              class='pg-button'
              onClick$={() => {
                bound.value = ['2024-12-24', '2024-12-26'];
              }}
            >
              Set the signal to Dec 24 and 26
            </button>
            <button
              type='button'
              class='pg-button'
              onClick$={() => {
                bound.value = [];
              }}
            >
              Clear the signal
            </button>
          </p>
        </Demo>
      </Case>

      <Case
        id='multiple-disabled'
        title="Days that can't be chosen"
        tests={["the days that can't be chosen stay unmarked"]}
      >
        <Steps>
          <li>
            <p>Click the 17. The calendar is rendered with disabledWeekdays=&#123;[0, 6]&#125; and value Aug 15.</p>
            <p>Nothing happens: the weekends are struck through and can't be clicked.</p>
          </li>
          <li>
            <p>
              Click <b>Focus Aug 16</b>, press <kbd>→</kbd>, then <kbd>Enter</kbd>.
            </p>
            <p>
              The focus skips the weekend to the <b>19</b>, and onChange$ receives <b>2024-08-15 2024-08-19</b>.
            </p>
          </li>
        </Steps>
        <Demo>
          <Focus on={day('2024-08-16')}>Focus Aug 16</Focus>
          <Calendar
            mode='multiple'
            value={['2024-08-15']}
            disabledWeekdays={[0, 6]}
            onChange$={$((days: LocalDate[]) => {
              disabled.value = [...disabled.value, show(days)];
            })}
          />
          <MultipleChanges values={disabled.value} />
        </Demo>
      </Case>

      <Case
        id='multiple-action'
        title='name: an array for a Qwik Router action'
        tests={['name submits a name[] input per day: a Qwik Router action gets an array']}
      >
        <Steps>
          <li>
            <p>
              Click <b>Submit</b>. The form is a Qwik Router &lt;Form&gt; with a routeAction$ that returns what it
              received; the calendars have name="days" (Aug 5 and Aug 20) and name="none" (no days).
            </p>
            <p>
              The action receives <b>&#123;"days":["2024-08-05","2024-08-20"]&#125;</b>: a days[] input per day make an
              array, and no days send nothing.
            </p>
          </li>
          <li>
            <p>
              Click <b>10</b> in the first calendar, then <b>Submit</b>.
            </p>
            <p>
              <b>&#123;"days":["2024-08-05","2024-08-10","2024-08-20"]&#125;</b>.
            </p>
          </li>
        </Steps>
        <Demo>
          <Form action={echo} class='pg-row'>
            <Calendar mode='multiple' name='days' value={['2024-08-05', '2024-08-20']} />
            <Calendar mode='multiple' name='none' />
            <button type='submit' class='pg-button'>
              Submit
            </button>
          </Form>
          <p class='pg-probe'>
            the action received: <output>{echo.value?.json ?? 'nothing yet'}</output>
          </p>
        </Demo>
      </Case>
    </>
  );
});
