import { component$ } from '@qwik.dev/core';
import { Calendar } from '../lib';
import { Case, Demo, Focus, Probe, Steps, calendarOf, prevButton, selectedCell } from './ui';

export const A11yCases = component$(() => (
  <>
    <Case
      id='a11y-names'
      title='The grid and the header buttons are named'
      tests={['the grid is named after the month it shows', 'the header buttons are labelled']}
    >
      <Steps>
        <li>
          <p>Read the names below (or inspect the table in DevTools › Elements › Accessibility).</p>
          <p>
            The grid is named <b>August 2024</b>, after the title. The header buttons are <b>go to previous month</b>{' '}
            and <b>go to next month</b>.
          </p>
        </li>
        <li>
          <p>
            Click <b>›</b>.
          </p>
          <p>
            The grid is now named <b>September 2024</b>.
          </p>
        </li>
        <li>
          <p>
            Click <b>Focus ‹</b>, press <kbd>Tab</kbd> (Chromium only: WebKit/Safari skips ›).
          </p>
          <p>The focus bar reads the button names, as a screen reader would.</p>
        </li>
      </Steps>
      <Demo>
        <Focus on={prevButton}>Focus ‹</Focus>
        <Calendar date='2024-08-15' />
        <Probe
          label='grid name'
          read$={(root) => {
            const id = calendarOf(root)?.querySelector('table')?.getAttribute('aria-labelledby');
            return (id && document.getElementById(id)?.textContent) || 'none';
          }}
        />
        <Probe
          label='header buttons'
          read$={(root) =>
            [...(calendarOf(root)?.querySelectorAll('header button') ?? [])]
              .map((button) => button.getAttribute('aria-label'))
              .join(' / ')
          }
        />
      </Demo>
    </Case>

    <Case
      id='a11y-group-label'
      title='The calendar is labelled with the selected date'
      tests={['the calendar group is labelled with the selected date']}
    >
      <Steps>
        <li>
          <p>Read the label below.</p>
          <p>
            The calendar is a group named <b>Calendar</b>.
          </p>
        </li>
        <li>
          <p>
            Click <b>20</b>.
          </p>
          <p>
            Its name becomes <b>Calendar, selected date: Tuesday, August 20, 2024</b>.
          </p>
        </li>
      </Steps>
      <Demo>
        <Calendar date='2024-08-15' />
        <Probe
          label='group (role / aria-label)'
          read$={(root) => {
            const calendar = calendarOf(root);
            return `${calendar?.getAttribute('role')} / ${calendar?.getAttribute('aria-label')}`;
          }}
        />
      </Demo>
    </Case>

    <Case
      id='a11y-selected-cell'
      title='The chosen day is a selected gridcell'
      tests={[
        'the chosen day is exposed as a selected gridcell',
        'the browser accessibility tree has gridcells and the selection',
      ]}
    >
      <Steps>
        <li>
          <p>
            Click <b>20</b>.
          </p>
          <p>
            The cell of the 20 is the only one with aria-selected="true" (the button only gets data-selected, for the
            styles).
          </p>
        </li>
        <li>
          <p>
            In Chrome, inspect the cell (<code>td</code>) of the 20 and open the Accessibility pane of the Elements
            panel.
          </p>
          <p>
            Role <b>gridcell</b>, name <b>Tuesday, August 20, 2024</b>, selected: <b>true</b>. The automated check of
            the accessibility tree only runs in Chromium.
          </p>
        </li>
      </Steps>
      <Demo>
        <Calendar date='2024-08-15' />
        <Probe label='selected cell (aria-selected)' read$={selectedCell} />
        <Probe
          label='buttons with data-selected'
          read$={(root) =>
            [...(calendarOf(root)?.querySelectorAll('button[data-selected]') ?? [])]
              .map((button) => button.textContent)
              .join(', ') || 'none'
          }
        />
      </Demo>
    </Case>
  </>
));
