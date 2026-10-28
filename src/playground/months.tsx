import { $, component$ } from '@qwik.dev/core';
import { Calendar } from '../lib';
import { Calendar as Headless, useCalendar } from '../lib/headless';
import { Case, Demo, Focus, Probe, Steps } from './ui';

/** The names of the grids of the case, in order, and where Tab enters. */
const gridNames = $((root: HTMLElement) => {
  const grids = [...root.querySelectorAll('[role="grid"]')];
  const names = grids.map((grid) => document.getElementById(grid.getAttribute('aria-labelledby') ?? '')?.textContent);
  const tab = root.querySelectorAll('[data-value][tabindex="0"]');
  return `${names.join(' | ')} · Tab stops: ${tab.length} (${tab[0]?.getAttribute('data-value') ?? 'none'})`;
});

const layout = $((root: HTMLElement) => {
  const [first, second] = [...root.querySelectorAll('[role="grid"]')].map((grid) => grid.getBoundingClientRect());
  if (!first || !second) return 'one grid';
  return second.top > first.bottom ? 'stacked' : 'side by side';
});

const GridTitles = component$(() => {
  const calendar = useCalendar();
  return (
    <p class='pg-probe'>
      useCalendar().grids: <output>{calendar.grids.value.map((grid) => grid.title).join(' | ')}</output>
    </p>
  );
});

export const MonthsCases = component$(() => (
  <>
    <Case
      id='months-side'
      title='Two months side by side'
      tests={['shows the months side by side, each grid named after its month', 'the months stack on narrow screens']}
    >
      <Steps>
        <li>
          <p>Look at the calendar, rendered with months=&#123;2&#125; and value Aug 15, 2024.</p>
          <p>
            <b>August</b> and <b>September 2024</b> side by side, each grid named after its month; ‹ at the top left, ›
            at the top right. A single Tab stop, on the 15.
          </p>
        </li>
        <li>
          <p>Make the window narrower than the two months (or open the device toolbar at 420px).</p>
          <p>
            The months <b>stack</b>, September under August, with no horizontal scroll.
          </p>
        </li>
      </Steps>
      <Demo>
        <Calendar months={2} value='2024-08-15' />
        <Probe label='grids' read$={gridNames} />
        <Probe label='layout' read$={layout} />
      </Demo>
    </Case>

    <Case id='months-buttons' title='The buttons move one month' tests={['the buttons move one month']}>
      <Steps>
        <li>
          <p>
            Click <b>›</b>, then <b>‹</b>.
          </p>
          <p>
            <b>September | October 2024</b>, then <b>August | September 2024</b>.
          </p>
        </li>
      </Steps>
      <Demo>
        <Calendar months={2} value='2024-08-15' />
        <Probe label='grids' read$={gridNames} />
      </Demo>
    </Case>

    <Case
      id='months-keyboard'
      title='The keyboard across the grids'
      tests={[
        'the keyboard goes from one grid to the next without jumps',
        'with fullWeeks, the keyboard goes to the day of the next grid, not to its disabled copy',
      ]}
    >
      <Steps>
        <li>
          <p>
            Click <b>Focus Aug 31</b>, press <kbd>→</kbd>.
          </p>
          <p>
            The focus goes to <b>Sep 1</b>, in the second grid; the months don't move.
          </p>
        </li>
        <li>
          <p>
            Click <b>Focus Sep 26</b>, press <kbd>↓</kbd>.
          </p>
          <p>
            <b>Oct 3</b>: one month forward, <b>September | October 2024</b>.
          </p>
        </li>
        <li>
          <p>
            Press <kbd>PageUp</kbd> twice.
          </p>
          <p>
            <b>Sep 3</b> without a move, then <b>Aug 3</b>, one month back: <b>August | September 2024</b>. Still a
            single Tab stop.
          </p>
        </li>
        <li>
          <p>
            In the second calendar (fullWeeks), click <b>Focus Aug 31 (fullWeeks)</b>, press <kbd>→</kbd>.
          </p>
          <p>
            The focus goes to the <b>01</b> of the September grid, not to the greyed-out 01 under August.
          </p>
        </li>
      </Steps>
      <Demo>
        <p class='pg-row'>
          <Focus on='[data-qwik-date] button[data-value="2024-08-31"]'>Focus Aug 31</Focus>
          <Focus on='[data-qwik-date] button[data-value="2024-09-26"]'>Focus Sep 26</Focus>
          <Focus on='.pg-full [data-qwik-date] button[data-value="2024-08-31"]:not([disabled])'>
            Focus Aug 31 (fullWeeks)
          </Focus>
        </p>
        <Calendar months={2} value='2024-08-15' />
        <div class='pg-full'>
          <Calendar months={2} value='2024-08-15' fullWeeks />
        </div>
        <Probe label='grids' read$={gridNames} />
      </Demo>
    </Case>

    <Case
      id='months-range'
      title='A range across the months'
      tests={['a range and its preview show across the months']}
    >
      <Steps>
        <li>
          <p>Look at the calendar: mode="range" from Aug 28 to Sep 3, 2024.</p>
          <p>
            <b>29, 30, 31</b> in August and <b>01, 02</b> in September are in range.
          </p>
        </li>
        <li>
          <p>
            Click <b>25</b> in August, then hover <b>05</b> in September.
          </p>
          <p>
            <b>Aug 26 to Sep 5</b> are previewed, across both grids (11 days).
          </p>
        </li>
        <li>
          <p>Click the 05.</p>
          <p>The range ends on Sep 5.</p>
        </li>
      </Steps>
      <Demo>
        <Calendar months={2} mode='range' value={{ start: '2024-08-28', end: '2024-09-03' }} />
        <Probe
          label='in range / preview'
          read$={(root) =>
            `${root.querySelectorAll('[data-in-range]').length} days / ${root.querySelectorAll('[data-preview]').length} days`
          }
        />
      </Demo>
    </Case>

    <Case id='months-limits' title='max and the last month' tests={['next stops when the last month reaches max']}>
      <Steps>
        <li>
          <p>Look at the calendar: months=&#123;2&#125;, max="2024-09-20".</p>
          <p>› is faded: September, the last month on show, has max. ‹ isn't.</p>
        </li>
      </Steps>
      <Demo>
        <Calendar months={2} value='2024-08-15' max='2024-09-20' />
        <Probe
          label='buttons'
          read$={(root) =>
            [...root.querySelectorAll('[data-header-action]')]
              .map(
                (button) =>
                  `${button.getAttribute('aria-label')}: ${button.getAttribute('aria-disabled') ?? 'enabled'}`,
              )
              .join(' / ')
          }
        />
      </Demo>
    </Case>

    <Case id='months-views' title='The months and years views' tests={['the months and years views show one grid']}>
      <Steps>
        <li>
          <p>Click the title of the first month, August 2024.</p>
          <p>A single grid, the months of 2024; the second panel goes away.</p>
        </li>
        <li>
          <p>
            Click <b>Nov</b>.
          </p>
          <p>
            <b>November | December 2024</b>.
          </p>
        </li>
      </Steps>
      <Demo>
        <Calendar months={2} value='2024-08-15' />
        <Probe label='grids' read$={gridNames} />
      </Demo>
    </Case>

    <Case
      id='months-headless'
      title='Headless: Title and Grid with an offset'
      tests={['headless: Title and Grid take the offset of their month']}
    >
      <Steps>
        <li>
          <p>
            Look at the calendar: a Calendar.Root with months=&#123;2&#125;, and a Title and a Grid with
            offset=&#123;1&#125; for the second month.
          </p>
          <p>
            Two grids, <b>August 2024</b> and <b>September 2024</b>, and useCalendar().grids has both.
          </p>
        </li>
      </Steps>
      <Demo>
        <Headless.Root months={2} value='2024-08-15' class='pg-headless'>
          <Headless.Title />
          <Headless.Grid>
            <Headless.GridBody />
          </Headless.Grid>
          <Headless.Title offset={1} />
          <Headless.Grid offset={1}>
            <Headless.GridBody />
          </Headless.Grid>
          <GridTitles />
        </Headless.Root>
        <Probe label='grids' read$={gridNames} />
      </Demo>
    </Case>
  </>
));
