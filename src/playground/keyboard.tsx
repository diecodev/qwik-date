import { $, component$, useSignal } from '@qwik.dev/core';
import { Calendar } from '../lib';
import { Case, Changes, Demo, Focus, Steps, day } from './ui';

export const KeyboardCases = component$(() => {
  const changes = useSignal<string[]>([]);

  return (
    <>
      <Case
        id='keyboard-arrows'
        title='Arrow keys inside the month'
        tests={[
          'ArrowRight from 2024-08-15 goes to 2024-08-16',
          'ArrowLeft from 2024-08-15 goes to 2024-08-14',
          'ArrowDown from 2024-08-15 goes to 2024-08-22',
          'ArrowUp from 2024-08-15 goes to 2024-08-08',
        ]}
      >
        <Steps>
          <li>
            <p>
              Click <b>Focus Aug 15</b>, press <kbd>→</kbd>.
            </p>
            <p>
              The focus moves to <b>Aug 16</b>.
            </p>
          </li>
          <li>
            <p>
              Click <b>Focus Aug 15</b>, press <kbd>←</kbd>.
            </p>
            <p>
              <b>Aug 14</b>.
            </p>
          </li>
          <li>
            <p>
              Click <b>Focus Aug 15</b>, press <kbd>↓</kbd>.
            </p>
            <p>
              <b>Aug 22</b>, a week later.
            </p>
          </li>
          <li>
            <p>
              Click <b>Focus Aug 15</b>, press <kbd>↑</kbd>.
            </p>
            <p>
              <b>Aug 8</b>, a week earlier. The title reads August 2024 all along.
            </p>
          </li>
        </Steps>
        <Demo>
          <Focus on={day('2024-08-15')}>Focus Aug 15</Focus>
          <Calendar value='2024-08-15' />
        </Demo>
      </Case>

      <Case
        id='keyboard-arrows-months'
        title='Arrow keys across months'
        tests={[
          'ArrowRight from 2024-08-31 goes to 2024-09-01',
          'ArrowLeft from 2024-08-01 goes to 2024-07-31',
          'ArrowDown from 2024-08-29 goes to 2024-09-05',
          'ArrowUp from 2024-08-02 goes to 2024-07-26',
        ]}
      >
        <Steps>
          <li>
            <p>
              Click <b>Focus Aug 31</b>, press <kbd>→</kbd>.
            </p>
            <p>
              <b>September 2024</b>, focus on <b>Sep 1</b>. Press <kbd>←</kbd> to come back to Aug 31.
            </p>
          </li>
          <li>
            <p>
              Click <b>Focus Aug 1</b>, press <kbd>←</kbd>.
            </p>
            <p>
              <b>July 2024</b>, focus on <b>Jul 31</b>. Press <kbd>→</kbd> to come back.
            </p>
          </li>
          <li>
            <p>
              Click <b>Focus Aug 29</b>, press <kbd>↓</kbd>.
            </p>
            <p>
              <b>September 2024</b>, focus on <b>Sep 5</b>. Press <kbd>↑</kbd> to come back.
            </p>
          </li>
          <li>
            <p>
              Click <b>Focus Aug 2</b>, press <kbd>↑</kbd>.
            </p>
            <p>
              <b>July 2024</b>, focus on <b>Jul 26</b>. Press <kbd>↓</kbd> to come back.
            </p>
          </li>
        </Steps>
        <Demo>
          <p class='pg-row'>
            <Focus on={day('2024-08-31')}>Focus Aug 31</Focus>
            <Focus on={day('2024-08-01')}>Focus Aug 1</Focus>
            <Focus on={day('2024-08-29')}>Focus Aug 29</Focus>
            <Focus on={day('2024-08-02')}>Focus Aug 2</Focus>
          </p>
          <Calendar value='2024-08-15' />
        </Demo>
      </Case>

      <Case
        id='keyboard-rtl'
        title='Arrow keys in a right-to-left layout'
        tests={['are mirrored in right-to-left layouts']}
      >
        <Steps>
          <li>
            <p>
              Click <b>Focus Aug 15</b>, press <kbd>→</kbd>.
            </p>
            <p>
              <b>Aug 14</b>: the rows run from right to left, so → goes back in time.
            </p>
          </li>
          <li>
            <p>
              Press <kbd>←</kbd> twice.
            </p>
            <p>
              <b>Aug 15</b>, then <b>Aug 16</b>.
            </p>
          </li>
          <li>
            <p>
              Click <b>Focus Aug 1</b>, press <kbd>→</kbd>.
            </p>
            <p>
              <b>July 2024</b>, focus on <b>Jul 31</b>.
            </p>
          </li>
        </Steps>
        <Demo>
          <p class='pg-row'>
            <Focus on={day('2024-08-15')}>Focus Aug 15</Focus>
            <Focus on={day('2024-08-01')}>Focus Aug 1</Focus>
          </p>
          <Calendar value='2024-08-15' containerProps={{ dir: 'rtl' }} />
        </Demo>
      </Case>

      <Case
        id='keyboard-home-end'
        title='Home and End'
        tests={[
          'Home from 2024-08-06 (basic) goes to 2024-08-04',
          'End from 2024-08-06 (basic) goes to 2024-08-10',
          'Home from 2024-08-02 (basic) goes to 2024-08-01',
        ]}
      >
        <Steps>
          <li>
            <p>
              Click <b>Focus Aug 6</b>, press <kbd>Home</kbd>.
            </p>
            <p>
              <b>Aug 4</b>, the start of the row (Sunday).
            </p>
          </li>
          <li>
            <p>
              Click <b>Focus Aug 6</b>, press <kbd>End</kbd>.
            </p>
            <p>
              <b>Aug 10</b>, the end of the row (Saturday).
            </p>
          </li>
          <li>
            <p>
              Click <b>Focus Aug 2</b>, press <kbd>Home</kbd>.
            </p>
            <p>
              <b>Aug 1</b>: the first row starts on Thursday, its empty cells are skipped. The title stays August 2024.
            </p>
          </li>
        </Steps>
        <Demo>
          <p class='pg-row'>
            <Focus on={day('2024-08-06')}>Focus Aug 6</Focus>
            <Focus on={day('2024-08-02')}>Focus Aug 2</Focus>
          </p>
          <Calendar value='2024-08-15' />
        </Demo>
      </Case>

      <Case
        id='keyboard-home-end-full-weeks'
        title='Home and End with fullWeeks'
        tests={[
          'Home from 2024-08-15 (full-weeks) goes to 2024-08-11',
          'End from 2024-08-15 (full-weeks) goes to 2024-08-17',
        ]}
      >
        <Steps>
          <li>
            <p>
              Click <b>Focus Aug 15</b>, press <kbd>Home</kbd>.
            </p>
            <p>
              <b>Aug 11</b>.
            </p>
          </li>
          <li>
            <p>
              Click <b>Focus Aug 15</b>, press <kbd>End</kbd>.
            </p>
            <p>
              <b>Aug 17</b>.
            </p>
          </li>
        </Steps>
        <Demo>
          <Focus on={day('2024-08-15')}>Focus Aug 15</Focus>
          <Calendar value='2024-08-15' fullWeeks showWeekNumber />
        </Demo>
      </Case>

      <Case
        id='keyboard-home-end-monday'
        title='Home and End with weekStartsOn={1}'
        tests={['Home from 2024-08-15 (monday) goes to 2024-08-12', 'End from 2024-08-15 (monday) goes to 2024-08-18']}
      >
        <Steps>
          <li>
            <p>
              Click <b>Focus Aug 15</b>, press <kbd>Home</kbd>.
            </p>
            <p>
              <b>Aug 12</b>, the Monday that starts the row.
            </p>
          </li>
          <li>
            <p>
              Click <b>Focus Aug 15</b>, press <kbd>End</kbd>.
            </p>
            <p>
              <b>Aug 18</b>, the Sunday that ends it.
            </p>
          </li>
        </Steps>
        <Demo>
          <Focus on={day('2024-08-15')}>Focus Aug 15</Focus>
          <Calendar value='2024-08-15' weekStartsOn={1} />
        </Demo>
      </Case>

      <Case
        id='keyboard-page'
        title='PageUp and PageDown'
        tests={[
          'PageDown from 2024-08-15 goes to 2024-09-15',
          'PageUp from 2024-08-15 goes to 2024-07-15',
          'PageDown from 2024-08-31 goes to 2024-09-30',
        ]}
      >
        <Steps>
          <li>
            <p>
              Click <b>Focus Aug 15</b>, press <kbd>PageDown</kbd>.
            </p>
            <p>
              <b>September 2024</b>, focus on <b>Sep 15</b>. Press <kbd>PageUp</kbd> to come back to Aug 15.
            </p>
          </li>
          <li>
            <p>
              Click <b>Focus Aug 15</b>, press <kbd>PageUp</kbd>.
            </p>
            <p>
              <b>July 2024</b>, focus on <b>Jul 15</b>. Press <kbd>PageDown</kbd> to come back.
            </p>
          </li>
          <li>
            <p>
              Click <b>Focus Aug 31</b>, press <kbd>PageDown</kbd>.
            </p>
            <p>
              <b>Sep 30</b>: September has no 31st, so the day is clamped to the last one.
            </p>
          </li>
        </Steps>
        <Demo>
          <p class='pg-row'>
            <Focus on={day('2024-08-15')}>Focus Aug 15</Focus>
            <Focus on={day('2024-08-31')}>Focus Aug 31</Focus>
          </p>
          <Calendar value='2024-08-15' />
        </Demo>
      </Case>

      <Case
        id='keyboard-page-leap'
        title='PageUp and PageDown around February 2024'
        tests={['PageDown from 2024-01-31 goes to 2024-02-29', 'PageUp from 2024-03-31 goes to 2024-02-29']}
      >
        <Steps>
          <li>
            <p>
              Click <b>Focus Jan 31</b>, press <kbd>PageDown</kbd>.
            </p>
            <p>
              <b>February 2024</b>, focus on <b>Feb 29</b> (2024 is a leap year), not on March 2.
            </p>
          </li>
          <li>
            <p>
              Click <b>›</b> (March 2024), then <b>Focus Mar 31</b>, press <kbd>PageUp</kbd>.
            </p>
            <p>
              <b>February 2024</b>, focus on <b>Feb 29</b>.
            </p>
          </li>
        </Steps>
        <Demo>
          <p class='pg-row'>
            <Focus on={day('2024-01-31')}>Focus Jan 31</Focus>
            <Focus on={day('2024-03-31')}>Focus Mar 31</Focus>
          </p>
          <Calendar value='2024-01-31' />
        </Demo>
      </Case>

      <Case
        id='keyboard-tab'
        title='Tab and Shift+Tab leave the grid'
        tests={['Tab and Shift+Tab move the focus out of the grid']}
      >
        <Steps>
          <li>
            <p>
              Click <b>Focus Aug 15</b>, press <kbd>Tab</kbd>.
            </p>
            <p>
              The focus leaves the grid, to the <b>after the calendar</b> button: Tab doesn't move between days.
            </p>
          </li>
          <li>
            <p>
              Click <b>Focus Aug 15</b>, press <kbd>Shift</kbd>+<kbd>Tab</kbd>.
            </p>
            <p>
              The focus leaves the grid: to <b>›</b> ("go to next month") in Chromium, to <b>Focus Aug 15</b> in
              WebKit/Safari, which skips the header buttons (no explicit tabindex).
            </p>
          </li>
        </Steps>
        <Demo>
          <Focus on={day('2024-08-15')}>Focus Aug 15</Focus>
          <Calendar value='2024-08-15' />
          <button type='button' class='pg-button' tabIndex={0}>
            after the calendar
          </button>
        </Demo>
      </Case>

      <Case
        id='keyboard-no-scroll'
        title="The grid keys don't scroll the page, even pressed back to back"
        tests={['the grid keys do not scroll the page', 'a key right after choosing a day still lands where it should']}
      >
        <Steps>
          <li>
            <p>
              Scroll so the whole calendar is visible. Click <b>Focus Aug 15</b>, then press <kbd>↓</kbd>,{' '}
              <kbd>Space</kbd>, <kbd>PageDown</kbd>, <kbd>End</kbd>.
            </p>
            <p>
              The focus goes to Aug 22, Space chooses it (onChange$: <b>2024-08-22</b>), then Sep 22 and <b>Sep 28</b>.
              "Page scroll" in the focus bar doesn't change: the page never scrolls.
            </p>
          </li>
          <li>
            <p>
              Reload, click <b>Focus Aug 15</b> and press the same four keys as fast as you can: the first one waits for
              its handler to load, so they run back to back.
            </p>
            <p>
              Same result: onChange$ gets <b>2024-08-22</b>, the calendar shows <b>September 2024</b> and the focus ends
              on <b>Sep 28</b>.
            </p>
          </li>
        </Steps>
        <Demo>
          <Focus on={day('2024-08-15')}>Focus Aug 15</Focus>
          <Calendar
            value='2024-08-15'
            onChange$={$((date) => {
              changes.value = [...changes.value, date];
            })}
          />
          <Changes values={changes.value} />
        </Demo>
      </Case>

      <Case
        id='keyboard-header-click'
        title='A header click after keyboard navigation'
        tests={['a header click after keyboard navigation keeps the focus off the grid']}
      >
        <Steps>
          <li>
            <p>
              Click <b>Focus Aug 31</b>, press <kbd>→</kbd>.
            </p>
            <p>
              <b>September 2024</b>, focus on <b>Sep 1</b>.
            </p>
          </li>
          <li>
            <p>
              Click <b>›</b>.
            </p>
            <p>
              <b>October 2024</b>. The focus isn't on a day: it's on › in Chromium, on nothing in WebKit/Safari (clicks
              don't focus buttons there).
            </p>
          </li>
          <li>
            <p>
              Press <kbd>Tab</kbd>.
            </p>
            <p>
              The focus enters the grid on <b>Oct 1</b>.
            </p>
          </li>
        </Steps>
        <Demo>
          <Focus on={day('2024-08-31')}>Focus Aug 31</Focus>
          <Calendar value='2024-08-15' />
        </Demo>
      </Case>
    </>
  );
});
