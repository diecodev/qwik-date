import { component$ } from '@qwik.dev/core';
import { Calendar } from '../lib';
import { Case, Demo, Focus, Probe, Steps, calendarOf, day, preselected } from './ui';

export const RenderingCases = component$(() => (
  <>
    <Case
      id='rendering-month'
      title='The month of the given date'
      tests={['shows the month of the given date', 'labels every day with its full date']}
    >
      <Steps>
        <li>
          <p>Look at the calendar, rendered with date="2024-08-15".</p>
          <p>
            The title reads <b>August 2024</b>, the weekdays <b>Su Mo Tu We Th Fr Sa</b>. There are 31 days, the 1st
            under Th (the cells before it are empty), and <b>15</b> has a grey background: it's the preselected day.
          </p>
        </li>
        <li>
          <p>
            Click <b>Focus Aug 15</b>.
          </p>
          <p>
            The focus bar at the bottom reads <b>day 2024-08-15, "Thursday, August 15, 2024"</b>: every day button is
            labelled with its full date.
          </p>
        </li>
      </Steps>
      <Demo>
        <Focus on={day('2024-08-15')}>Focus Aug 15</Focus>
        <Calendar date='2024-08-15' />
        <Probe
          label='day buttons'
          read$={(root) => `${calendarOf(root)?.querySelectorAll('button[data-value]').length}`}
        />
        <Probe label='preselected' read$={preselected} />
      </Demo>
    </Case>

    <Case
      id='rendering-full-weeks'
      title='fullWeeks and showWeekNumber'
      tests={[
        'fullWeeks fills six rows with the adjacent days, disabled',
        'showWeekNumber numbers each row after its ISO week',
      ]}
    >
      <Steps>
        <li>
          <p>Look at the calendar, rendered with fullWeeks and showWeekNumber.</p>
          <p>
            Six rows, 42 days. The days of July (<b>28–31</b>) and September (<b>1–7</b>) are greyed out and can't be
            clicked: 11 disabled days.
          </p>
        </li>
        <li>
          <p>Read the first column.</p>
          <p>
            The ISO week numbers <b>31, 32, 33, 34, 35, 36</b>, one per row.
          </p>
        </li>
      </Steps>
      <Demo>
        <Calendar date='2024-08-15' fullWeeks showWeekNumber />
        <Probe
          label='rows / day buttons / disabled'
          read$={(root) => {
            const calendar = calendarOf(root);
            const rows = calendar?.querySelectorAll('tbody tr').length;
            const days = calendar?.querySelectorAll('button[data-value]').length;
            const disabled = calendar?.querySelectorAll('button[data-value]:disabled').length;
            return `${rows} / ${days} / ${disabled}`;
          }}
        />
      </Demo>
    </Case>

    <Case
      id='rendering-locale'
      title='locale="es"'
      tests={['locale "es" translates the title, the weekdays and the day labels']}
    >
      <Steps>
        <li>
          <p>Look at the calendar, rendered with locale="es".</p>
          <p>
            The title reads <b>Agosto 2024</b>, the weekdays <b>Do Lu Ma Mi Ju Vi Sa</b> (the week still starts on
            Sunday).
          </p>
        </li>
        <li>
          <p>
            Click <b>Focus Aug 15</b>.
          </p>
          <p>
            The focus bar reads <b>"jueves, 15 de agosto de 2024"</b>.
          </p>
        </li>
      </Steps>
      <Demo>
        <Focus on={day('2024-08-15')}>Focus Aug 15</Focus>
        <Calendar date='2024-08-15' locale='es' />
      </Demo>
    </Case>

    <Case
      id='rendering-no-weekdays'
      title='showDaysOfWeek={false}'
      tests={['showDaysOfWeek={false} hides the weekday row']}
    >
      <Steps>
        <li>
          <p>Look at the calendar, rendered with showDaysOfWeek=&#123;false&#125;.</p>
          <p>There's no weekday row: the days start right under the title.</p>
        </li>
      </Steps>
      <Demo>
        <Calendar date='2024-08-15' showDaysOfWeek={false} />
        <Probe
          label='weekday row (thead)'
          read$={(root) => (calendarOf(root)?.querySelector('thead') ? 'present' : 'none')}
        />
      </Demo>
    </Case>

    <Case id='rendering-load-focus' title='No focus on load' tests={['does not move the focus when the page loads']}>
      <Steps>
        <li>
          <p>Reload the page and wait a couple of seconds without touching anything.</p>
          <p>
            The focus bar reads <b>nothing (the page)</b> and the page doesn't jump to any calendar, although each
            calendar on this page, like the one here, has a preselected day it could focus.
          </p>
        </li>
      </Steps>
      <Demo>
        <Calendar date='2024-08-15' />
      </Demo>
    </Case>
  </>
));
