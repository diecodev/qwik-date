import { component$ } from '@qwik.dev/core';
import { Calendar, type Labels } from '../lib';
import { Case, Demo, Focus, Probe, Steps, calendarOf, day, prevButton, selectedCell } from './ui';

// the texts Intl can't give, required for a locale other than en and es
const FR: Labels = {
  calendar: 'Calendrier',
  previousMonth: 'Mois précédent',
  nextMonth: 'Mois suivant',
  previousYear: 'Année précédente',
  nextYear: 'Année suivante',
  previousYears: 'Années précédentes',
  nextYears: 'Années suivantes',
  selectedDate: 'date sélectionnée :',
  selectedRange: 'période sélectionnée :',
};

export const RenderingCases = component$(() => (
  <>
    <Case
      id='rendering-month'
      title='The month of the given date'
      tests={['shows the month of the given value, with that day selected', 'labels every day with its full date']}
    >
      <Steps>
        <li>
          <p>Look at the calendar, rendered with value="2024-08-15".</p>
          <p>
            The title reads <b>August 2024</b>, the weekdays <b>Su Mo Tu We Th Fr Sa</b>. There are 31 days, the 1st
            under Th (the cells before it are empty), and <b>15</b> is selected (black).
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
        <Calendar value='2024-08-15' />
        <Probe
          label='day buttons'
          read$={(root) => `${calendarOf(root)?.querySelectorAll('button[data-value]').length}`}
        />
        <Probe label='selected cell (aria-selected)' read$={selectedCell} />
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
        <Calendar value='2024-08-15' fullWeeks showWeekNumber />
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
        <Calendar value='2024-08-15' locale='es' />
      </Demo>
    </Case>

    <Case
      id='rendering-locale-intl'
      title='Another locale: locale="fr-FR" with labels'
      tests={['another locale takes its names from Intl, capitalized, and its texts from labels']}
    >
      <Steps>
        <li>
          <p>Look at the calendar, rendered with locale="fr-FR" and French labels.</p>
          <p>
            The month and weekday names come from Intl, with a capital letter: <b>Août 2024</b>,{' '}
            <b>Dim. Lun. Mar. Mer. Jeu. Ven. Sam.</b> The days keep two digits (01).
          </p>
        </li>
        <li>
          <p>
            Click <b>Focus Aug 15</b>, then <b>Focus ‹</b>.
          </p>
          <p>
            The focus bar reads <b>"jeudi 15 août 2024"</b>, then <b>"Mois précédent"</b>, from the labels. The
            calendar's name below includes <b>date sélectionnée :</b>.
          </p>
        </li>
      </Steps>
      <Demo>
        <p class='pg-row'>
          <Focus on={day('2024-08-15')}>Focus Aug 15</Focus>
          <Focus on={prevButton}>Focus ‹</Focus>
        </p>
        <Calendar value='2024-08-15' locale='fr-FR' labels={FR} />
        <Probe label='calendar name' read$={(root) => calendarOf(root)?.getAttribute('aria-label') ?? 'none'} />
      </Demo>
    </Case>

    <Case id='rendering-labels' title='labels with a built-in locale' tests={['labels override the built-in texts']}>
      <Steps>
        <li>
          <p>
            Look at the calendar name below: locale="es" with labels=&#123;&#123; calendar: 'Fecha de entrega'
            &#125;&#125;.
          </p>
          <p>
            <b>Fecha de entrega, fecha seleccionada: jueves, 15 de agosto de 2024</b>: the given text, the rest built
            in.
          </p>
        </li>
      </Steps>
      <Demo>
        <Calendar value='2024-08-15' locale='es' labels={{ calendar: 'Fecha de entrega' }} />
        <Probe label='calendar name' read$={(root) => calendarOf(root)?.getAttribute('aria-label') ?? 'none'} />
      </Demo>
    </Case>

    <Case
      id='rendering-week-start'
      title='weekStartsOn={1}'
      tests={['weekStartsOn starts the rows, the weekday names and the week numbers on that day']}
    >
      <Steps>
        <li>
          <p>Look at the calendar, rendered with weekStartsOn=&#123;1&#125; and showWeekNumber.</p>
          <p>
            The weeks start on Monday: <b>Mo Tu We Th Fr Sa Su</b>, the 1st under Th (fourth column), and the week
            numbers <b>31 to 35</b>, each row a whole ISO week.
          </p>
        </li>
      </Steps>
      <Demo>
        <Calendar value='2024-08-15' weekStartsOn={1} showWeekNumber />
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
        <Calendar value='2024-08-15' showDaysOfWeek={false} />
        <Probe
          label='weekday row (thead)'
          read$={(root) => (calendarOf(root)?.querySelector('thead') ? 'present' : 'none')}
        />
      </Demo>
    </Case>

    <Case id='rendering-load-focus' title='No focus on load' tests={['does not move the focus when the page loads']}>
      <Steps>
        <li>
          <p>
            Reload the page (without <code>?autofocus</code> in the URL) and wait a couple of seconds without touching
            anything.
          </p>
          <p>
            The focus bar reads <b>nothing (the page)</b> and the page doesn't jump to any calendar, although each
            calendar on this page, like the one here, has a selected day it could focus.
          </p>
        </li>
      </Steps>
      <Demo>
        <Calendar value='2024-08-15' />
      </Demo>
    </Case>
  </>
));
