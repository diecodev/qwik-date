import { $, component$, useSignal } from '@qwik.dev/core';
import { Calendar, DatePicker } from '../lib';
import { Case, Changes, Demo, Focus, Probe, Steps, calendarOf, day } from './ui';

const unavailableDays = $(
  (root: HTMLElement) =>
    [...(calendarOf(root)?.querySelectorAll('button[data-unavailable]') ?? [])].map((b) => b.textContent).join(', ') ||
    'none',
);

const monthButtons = $((root: HTMLElement) =>
  [...(calendarOf(root)?.querySelectorAll('header button') ?? [])]
    .map((button) => `${button.getAttribute('aria-label')}: ${button.getAttribute('aria-disabled') ?? 'enabled'}`)
    .join(' / '),
);

export const AvailabilityCases = component$(() => {
  const changes = useSignal<string[]>([]);
  const ranges = useSignal<string[]>([]);

  return (
    <>
      <Case
        id='availability-limits'
        title='min and max'
        tests={['min and max disable the days past them, and the month buttons at the limits']}
      >
        <Steps>
          <li>
            <p>Look at the calendar, rendered with min="2024-08-05" and max="2024-08-25".</p>
            <p>
              <b>01–04</b> and <b>26–31</b> are greyed out and struck through, and can't be clicked. Both month buttons
              are faded (aria-disabled).
            </p>
          </li>
          <li>
            <p>
              Click <b>Focus ‹</b>, press <kbd>Enter</kbd>.
            </p>
            <p>
              The calendar stays on <b>August 2024</b> and the focus stays on ‹ (a disabled button would have dropped
              it).
            </p>
          </li>
          <li>
            <p>
              Click <b>›</b>.
            </p>
            <p>
              Still <b>August 2024</b>.
            </p>
          </li>
        </Steps>
        <Demo>
          <Focus on='[data-qwik-date] header button:first-of-type'>Focus ‹</Focus>
          <Calendar value='2024-08-15' min='2024-08-05' max='2024-08-25' />
          <Probe label="days that can't be chosen" read$={unavailableDays} />
          <Probe label='month buttons' read$={monthButtons} />
        </Demo>
      </Case>

      <Case
        id='availability-disabled'
        title='disabledDates and disabledWeekdays'
        tests={['disabledDates and disabledWeekdays disable those days']}
      >
        <Steps>
          <li>
            <p>
              Look at the calendar, rendered with disabledWeekdays=&#123;[0, 6]&#125; and
              disabledDates=&#123;['2024-08-15']&#125;.
            </p>
            <p>
              The weekends and the <b>15</b> are struck through: 10 days in all.
            </p>
          </li>
          <li>
            <p>
              Click <b>15</b>, then <b>16</b>.
            </p>
            <p>
              The 15 does nothing; onChange$ only gets <b>2024-08-16</b>.
            </p>
          </li>
        </Steps>
        <Demo>
          <Calendar
            value='2024-08-14'
            disabledWeekdays={[0, 6]}
            disabledDates={['2024-08-15']}
            onChange$={$((date) => {
              changes.value = [...changes.value, date];
            })}
          />
          <Changes values={changes.value} />
          <Probe label="days that can't be chosen" read$={unavailableDays} />
        </Demo>
      </Case>

      <Case
        id='availability-keyboard'
        title="The keyboard skips the days that can't be chosen"
        tests={[
          'ArrowRight from 2024-08-14 goes to 2024-08-16',
          'ArrowRight from 2024-08-16 goes to 2024-08-19',
          'ArrowLeft from 2024-08-19 goes to 2024-08-16',
          'Home from 2024-08-14 goes to 2024-08-12',
          'End from 2024-08-14 goes to 2024-08-16',
          'ArrowDown from 2024-08-08 goes to 2024-08-16',
        ]}
      >
        <Steps>
          <li>
            <p>
              Click <b>Focus Aug 14</b>, press <kbd>→</kbd>, then <kbd>→</kbd> again, then <kbd>←</kbd>.
            </p>
            <p>
              <b>Aug 16</b> (the 15 is skipped), <b>Aug 19</b> (the weekend too), back to <b>Aug 16</b>.
            </p>
          </li>
          <li>
            <p>
              Click <b>Focus Aug 14</b>, press <kbd>Home</kbd>; again, and press <kbd>End</kbd>.
            </p>
            <p>
              <b>Aug 12</b> and <b>Aug 16</b>: the row's first and last weekdays, not its Sunday and Saturday.
            </p>
          </li>
          <li>
            <p>
              Click <b>Focus Aug 8</b>, press <kbd>↓</kbd>.
            </p>
            <p>
              <b>Aug 16</b>: a week later is the 15, which can't be chosen, so the next day that can.
            </p>
          </li>
        </Steps>
        <Demo>
          <p class='pg-row'>
            <Focus on={day('2024-08-14')}>Focus Aug 14</Focus>
            <Focus on={day('2024-08-08')}>Focus Aug 8</Focus>
          </p>
          <Calendar value='2024-08-14' disabledWeekdays={[0, 6]} disabledDates={['2024-08-15']} />
        </Demo>
      </Case>

      <Case
        id='availability-keyboard-limits'
        title='The keyboard stops at min and max'
        tests={[
          'ArrowRight from 2024-08-25 goes to 2024-08-25',
          'ArrowDown from 2024-08-20 goes to 2024-08-25',
          'PageDown from 2024-08-20 goes to 2024-08-25',
          'ArrowLeft from 2024-08-05 goes to 2024-08-05',
          'PageUp from 2024-08-10 goes to 2024-08-05',
        ]}
      >
        <Steps>
          <li>
            <p>
              Click <b>Focus Aug 25</b> (max), press <kbd>→</kbd>.
            </p>
            <p>The focus stays on Aug 25.</p>
          </li>
          <li>
            <p>
              Click <b>Focus Aug 20</b>, press <kbd>↓</kbd>; again, and press <kbd>PageDown</kbd>.
            </p>
            <p>
              Both go to <b>Aug 25</b>, as far as max allows. The calendar stays on August.
            </p>
          </li>
          <li>
            <p>
              Click <b>Focus Aug 5</b> (min), press <kbd>←</kbd>; then <b>Focus Aug 10</b> and <kbd>PageUp</kbd>.
            </p>
            <p>Aug 5 both times.</p>
          </li>
        </Steps>
        <Demo>
          <p class='pg-row'>
            <Focus on={day('2024-08-25')}>Focus Aug 25</Focus>
            <Focus on={day('2024-08-20')}>Focus Aug 20</Focus>
            <Focus on={day('2024-08-05')}>Focus Aug 5</Focus>
            <Focus on={day('2024-08-10')}>Focus Aug 10</Focus>
          </p>
          <Calendar value='2024-08-15' min='2024-08-05' max='2024-08-25' />
        </Demo>
      </Case>

      <Case
        id='availability-range'
        title="A range can't cross a day that can't be chosen"
        tests={['a range ends right before the first day that cannot be chosen']}
      >
        <Steps>
          <li>
            <p>
              The range starts on the 10 and the 14 can't be chosen. Click <b>20</b>.
            </p>
            <p>
              onChange$ gets <b>2024-08-10/2024-08-13</b>: the range stops right before the 14, with 11 and 12 in range.
            </p>
          </li>
        </Steps>
        <Demo>
          <Calendar
            mode='range'
            value={{ start: '2024-08-10', end: null }}
            disabledDates={['2024-08-14']}
            onChange$={$((range) => {
              ranges.value = [...ranges.value, `${range.start}/${range.end}`];
            })}
          />
          <Changes values={ranges.value} />
        </Demo>
      </Case>

      <Case
        id='availability-opening'
        title='Without a value, past the limits'
        tests={['without a value it opens on the limit today is past, and Tab enters on a day that can be chosen']}
      >
        <Steps>
          <li>
            <p>Look at the two calendars: min="2099-03-10" and max="2000-01-20", without value.</p>
            <p>
              They open on <b>March 2099</b> and <b>January 2000</b>, the limit today is past, with ‹ faded in the first
              one.
            </p>
          </li>
          <li>
            <p>Tab into the first calendar's days.</p>
            <p>
              The focus lands on <b>Mar 10</b>, the first day that can be chosen, not on Mar 1.
            </p>
          </li>
        </Steps>
        <Demo>
          <Calendar min='2099-03-10' />
          <Calendar max='2000-01-20' />
          <Probe
            label='Tab enters on'
            read$={(root) =>
              calendarOf(root)?.querySelector('button[data-value][tabindex="0"]')?.getAttribute('data-value') ?? 'none'
            }
          />
        </Demo>
      </Case>

      <Case id='availability-picker' title='In a DatePicker' tests={['the DatePicker takes them too']}>
        <Steps>
          <li>
            <p>
              Click the trigger, <b>Aug 15, 2024</b> (min="2024-08-05", max="2024-08-25").
            </p>
            <p>The popup shows the same limits: 01–04 and 26–31 struck through, both month buttons faded.</p>
          </li>
        </Steps>
        <Demo>
          <DatePicker value='2024-08-15' min='2024-08-05' max='2024-08-25' />
        </Demo>
      </Case>
    </>
  );
});
