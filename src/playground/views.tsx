import { $, component$, useSignal } from '@qwik.dev/core';
import { Calendar, type Labels, type LocalDate } from '../lib';
import { Calendar as Headless, useCalendar } from '../lib/headless';
import { DatePicker } from '../recipes/popover';
import { Case, Changes, Demo, Focus, Probe, Steps, calendarOf } from './ui';

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
  selectedDates: 'dates sélectionnées :',
};

const titleButton = '[data-qwik-date]:not([popover]) header > div > button';

/** The title, the name of the grid on show, and the labels of the previous and next buttons. */
const viewState = $((root: HTMLElement) => {
  const calendar = root.querySelector<HTMLElement>('[data-qwik-date]');
  const grid = calendar?.querySelector('[role="grid"]');
  const name = grid && document.getElementById(grid.getAttribute('aria-labelledby') ?? '')?.textContent;
  const buttons = [...(calendar?.querySelectorAll('header > button') ?? [])]
    .map((button) => `${button.getAttribute('aria-label')}${button.getAttribute('aria-disabled') ? ' (disabled)' : ''}`)
    .join(' / ');
  return `grid "${name ?? 'none'}" · ${buttons}`;
});

const cells = $((root: HTMLElement) => {
  const buttons = [...(calendarOf(root)?.querySelectorAll('[data-month], [data-year]') ?? [])] as HTMLButtonElement[];
  if (!buttons.length) return 'the days';
  return buttons.map((button) => `${button.textContent}${button.disabled ? ' (off)' : ''}`).join(', ');
});

const ViewReadout = component$(() => {
  const calendar = useCalendar();

  return (
    <div class='pg-demo'>
      <p class='pg-probe'>
        view / title:{' '}
        <output>
          {calendar.view.value} / {calendar.title.value}
        </output>
      </p>
      <p class='pg-row'>
        <button type='button' class='pg-button' onClick$={() => calendar.setView$('years')}>
          setView$('years')
        </button>
        <button type='button' class='pg-button' onClick$={() => calendar.chooseMonth$(2025, '02')}>
          chooseMonth$(2025, '02')
        </button>
      </p>
    </div>
  );
});

export const ViewsCases = component$(() => {
  const changes = useSignal<string[]>([]);
  const picked = useSignal<LocalDate | null>('2024-08-15');

  return (
    <>
      <Case
        id='views-months'
        title='The title shows the months of the year'
        tests={['the title shows the months of the year, and a month shows its days']}
      >
        <Steps>
          <li>
            <p>
              Click the title, <b>August 2024</b>.
            </p>
            <p>
              The title becomes <b>2024</b> (announced: it's a polite live region) and a grid named 2024 shows{' '}
              <b>Jan to Dec</b> in rows of three, <b>Aug</b> selected. The buttons are <b>go to previous year</b> and{' '}
              <b>go to next year</b>.
            </p>
          </li>
          <li>
            <p>
              Click <b>›</b>, then <b>‹</b>.
            </p>
            <p>
              <b>2025</b>, then <b>2024</b> again.
            </p>
          </li>
          <li>
            <p>
              Click <b>Oct</b>.
            </p>
            <p>
              The days of <b>October 2024</b>, with the month buttons again. onChange$ isn't called: showing a month
              chooses nothing.
            </p>
          </li>
        </Steps>
        <Demo>
          <Calendar
            value='2024-08-15'
            onChange$={$((date: LocalDate) => {
              changes.value = [...changes.value, date];
            })}
          />
          <Probe label='on show' read$={viewState} />
          <Probe label='cells' read$={cells} />
          <Changes values={changes.value} />
        </Demo>
      </Case>

      <Case
        id='views-years'
        title='Twice: twelve years'
        tests={['the title again shows twelve years, and a year shows the days of the same month in it']}
      >
        <Steps>
          <li>
            <p>Click the title twice.</p>
            <p>
              <b>2016 – 2027</b>: twelve years, and the buttons are <b>go to previous years</b> and{' '}
              <b>go to next years</b>.
            </p>
          </li>
          <li>
            <p>
              Click <b>›</b>, then <b>‹</b> twice, then <b>›</b>.
            </p>
            <p>
              <b>2028 – 2039</b>, <b>2004 – 2015</b>, and back to <b>2016 – 2027</b>.
            </p>
          </li>
          <li>
            <p>
              Click <b>2026</b>.
            </p>
            <p>
              The days of <b>August 2026</b>: the same month, in that year.
            </p>
          </li>
          <li>
            <p>Click the title three times.</p>
            <p>
              <b>2026</b>, <b>2016 – 2027</b>, and the days of <b>August 2026</b> again.
            </p>
          </li>
        </Steps>
        <Demo>
          <Calendar value='2024-08-15' />
          <Probe label='on show' read$={viewState} />
        </Demo>
      </Case>

      <Case
        id='views-keyboard'
        title='The months and years with the keyboard'
        tests={['the keyboard: arrows and Enter choose, Escape goes back to the days']}
      >
        <Steps>
          <li>
            <p>
              Click <b>Focus the title</b>, press <kbd>Enter</kbd>.
            </p>
            <p>
              The months of 2024, with the focus on <b>Aug</b>.
            </p>
          </li>
          <li>
            <p>
              Press <kbd>→</kbd>, <kbd>↓</kbd>, then <kbd>→</kbd>.
            </p>
            <p>
              The focus goes to <b>Sep</b>, <b>Dec</b>, then <b>Jan</b> of <b>2025</b> (the title changes).
            </p>
          </li>
          <li>
            <p>
              Press <kbd>Enter</kbd>.
            </p>
            <p>
              The days of <b>January 2025</b>, with the focus on the <b>15</b>: the same day as before.
            </p>
          </li>
          <li>
            <p>
              Click <b>Focus the title</b>, press <kbd>Enter</kbd>, then <kbd>Escape</kbd>.
            </p>
            <p>
              The months, then the days of <b>January 2025</b> again, with the focus on the title.
            </p>
          </li>
          <li>
            <p>
              Press <kbd>Enter</kbd>, click <b>Focus the title</b>, press <kbd>Enter</kbd>, <kbd>←</kbd> and{' '}
              <kbd>Space</kbd>.
            </p>
            <p>
              The months, the years with the focus on <b>2025</b>, then <b>2024</b>, and the days of <b>January 2024</b>{' '}
              with the focus on the <b>15</b>.
            </p>
          </li>
        </Steps>
        <Demo>
          <Focus on={titleButton}>Focus the title</Focus>
          <Calendar value='2024-08-15' />
          <Probe label='on show' read$={viewState} />
        </Demo>
      </Case>

      <Case
        id='views-limits'
        title='min and max in the months and years'
        tests={['min and max disable the months and years past them']}
      >
        <Steps>
          <li>
            <p>Click the title. The calendar is rendered with min="2024-03-10" and max="2025-10-05".</p>
            <p>
              <b>Jan</b> and <b>Feb</b> are greyed out and struck through, and ‹ is faded.
            </p>
          </li>
          <li>
            <p>
              Click <b>Focus Mar</b>, press <kbd>←</kbd> and <kbd>↑</kbd>.
            </p>
            <p>
              The focus stays on <b>Mar</b>.
            </p>
          </li>
          <li>
            <p>
              Click <b>Dec</b>.
            </p>
            <p>
              The days of <b>December 2024</b>.
            </p>
          </li>
          <li>
            <p>Click the title twice.</p>
            <p>
              Only <b>2024</b> and <b>2025</b> can be clicked, and both buttons are faded.
            </p>
          </li>
          <li>
            <p>
              Click <b>2025</b>.
            </p>
            <p>
              The days of <b>October 2025</b>: December 2025 is past max, so the year shows max's month.
            </p>
          </li>
        </Steps>
        <Demo>
          <Focus on='[data-qwik-date] [data-month="2024-03"]'>Focus Mar</Focus>
          <Calendar value='2024-08-15' min='2024-03-10' max='2025-10-05' />
          <Probe label='on show' read$={viewState} />
          <Probe label='cells' read$={cells} />
        </Demo>
      </Case>

      <Case
        id='views-locale'
        title='The months in other languages'
        tests={['the month names and the buttons follow the locale, the names with a capital letter']}
      >
        <Steps>
          <li>
            <p>Click the title of the first calendar (locale="es"), then click it again.</p>
            <p>
              Months from <b>Ene</b> to <b>Dic</b>, with a capital letter, and <b>Ir al año anterior</b> on ‹; then the
              years, with <b>Ir a los siguientes años</b> on ›.
            </p>
          </li>
          <li>
            <p>Click the title of the second one (locale="fr-FR" with labels).</p>
            <p>
              <b>Janv.</b> to <b>Déc.</b>, Janvier's name <b>Janvier 2024</b>, and <b>Année précédente</b> on ‹.
            </p>
          </li>
        </Steps>
        <Demo>
          <div class='pg-row'>
            <Calendar value='2024-08-15' locale='es' />
            <Calendar value='2024-08-15' locale='fr-FR' labels={FR} />
          </div>
          <Probe label='first calendar' read$={viewState} />
          <Probe label='first calendar cells' read$={cells} />
        </Demo>
      </Case>

      <Case
        id='views-popover'
        title='Escape in a popover'
        tests={['Escape in the months of a popover goes back to the days, and keeps it open']}
      >
        <Steps>
          <li>
            <p>
              Click <b>Aug 15, 2024</b> (the trigger), then the title of the calendar.
            </p>
            <p>The months, with the focus on Aug.</p>
          </li>
          <li>
            <p>
              Press <kbd>Escape</kbd>.
            </p>
            <p>
              The popover stays open, on the days of <b>August 2024</b>, with the focus on the title.
            </p>
          </li>
          <li>
            <p>
              Press <kbd>Escape</kbd> again.
            </p>
            <p>The popover closes and the focus goes back to the trigger.</p>
          </li>
        </Steps>
        <Demo>
          <DatePicker bind:value={picked} />
        </Demo>
      </Case>

      <Case
        id='views-headless'
        title='Headless: MonthGrid, YearGrid and the views in useCalendar()'
        tests={['headless: MonthGrid, YearGrid, and the views in useCalendar()']}
      >
        <Steps>
          <li>
            <p>Look at the readout, from a component inside the root that calls useCalendar().</p>
            <p>
              <b>days / August 2024</b>.
            </p>
          </li>
          <li>
            <p>Click the title.</p>
            <p>
              <b>months / 2024</b>, with the twelve months of Calendar.MonthGrid.
            </p>
          </li>
          <li>
            <p>
              Click <b>setView$('years')</b>, then <b>chooseMonth$(2025, '02')</b>.
            </p>
            <p>
              <b>years / 2016 – 2027</b> with Calendar.YearGrid, then <b>days / February 2025</b>.
            </p>
          </li>
        </Steps>
        <Demo>
          <Headless.Root value='2024-08-15' class='pg-headless'>
            <Headless.Title />
            <Headless.Grid>
              <Headless.GridBody />
            </Headless.Grid>
            <Headless.MonthGrid />
            <Headless.YearGrid />
            <ViewReadout />
          </Headless.Root>
        </Demo>
      </Case>
    </>
  );
});
