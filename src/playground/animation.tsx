import { $, component$, useSignal, useStyles$, useVisibleTask$ } from '@qwik.dev/core';
import { Calendar } from '../lib';
import { Calendar as Headless, useCalendar } from '../lib/headless';
import { Case, Demo, Focus, Probe, Steps, calendarOf } from './ui';

// the animations of the docs (qwik-date.dieco.dev/animations), slowed down to 600ms so the eye can follow them, for the calendars inside .pg-animated
const ANIMATIONS = `
@media (prefers-reduced-motion: no-preference) {
  .pg-animated [data-qwik-date] table:not([data-period]) > tbody > tr[data-direction='next'] { animation: pg-month-next 600ms ease-out; }
  .pg-animated [data-qwik-date] table:not([data-period]) > tbody > tr[data-direction='prev'] { animation: pg-month-prev 600ms ease-out; }
  .pg-animated [data-qwik-date] table[data-period] { animation: pg-view-in 600ms ease-out; }
}
@keyframes pg-month-next { from { opacity: 0; translate: 2rem 0; } }
@keyframes pg-month-prev { from { opacity: 0; translate: -2rem 0; } }
@keyframes pg-view-in { from { opacity: 0; scale: 0.9; } }
`;

/** The CSS animations that started in the case, as "TAG: name", since the case was opened. */
const AnimationLog = component$(() => {
  const ref = useSignal<HTMLElement>();
  const log = useSignal<string[]>([]);

  useVisibleTask$(({ cleanup }) => {
    const root = ref.value?.closest('.pg-case');
    const onStart = (e: AnimationEvent) => {
      log.value = [...log.value, `${(e.target as Element).tagName.toLowerCase()}: ${e.animationName}`];
    };
    root?.addEventListener('animationstart', onStart as EventListener);
    cleanup(() => root?.removeEventListener('animationstart', onStart as EventListener));
  });

  // the rows of a month start the same animation together: "tr: pg-month-next ×5"
  const grouped = log.value.reduce<[string, number][]>((groups, entry) => {
    const last = groups.at(-1);
    if (last?.[0] === entry) last[1]++;
    else groups.push([entry, 1]);
    return groups;
  }, []);

  return (
    <p class='pg-probe' ref={ref}>
      animations started ({log.value.length}):{' '}
      <output>
        {grouped.map(([entry, count]) => (count > 1 ? `${entry} ×${count}` : entry)).join(', ') || 'none'}
      </output>
    </p>
  );
});

// shared by several probes: a QRL, the optimizer only wraps the functions written inline in a `$` prop
const direction = $((root: HTMLElement) => calendarOf(root)?.getAttribute('data-direction') ?? 'none');

const DirectionReadout = component$(() => {
  const calendar = useCalendar();
  return (
    <p class='pg-probe'>
      useCalendar().direction: <output>{calendar.direction.value ?? 'null'}</output>
    </p>
  );
});

export const AnimationCases = component$(() => {
  useStyles$(ANIMATIONS);

  return (
    <>
      <p class='pg-note'>
        The library doesn't animate: it exposes data-direction, and new rows of days for each month, and the calendars
        of this area take the CSS of the docs (slowed down to 600ms). With your OS set to reduce motion, nothing moves.
      </p>

      <Case
        id='animation-direction'
        title='data-direction after each move'
        tests={['no direction on load, then next or prev after each move']}
      >
        <Steps>
          <li>
            <p>Look at the calendar.</p>
            <p>No data-direction: nothing moved yet, and nothing animates on load.</p>
          </li>
          <li>
            <p>
              Click <b>›</b>, then <b>‹</b>.
            </p>
            <p>
              <b>next</b>: September slides in from the right. Then <b>prev</b>: August slides in from the left.
            </p>
          </li>
          <li>
            <p>
              Click <b>Focus Aug 31</b>, press <kbd>→</kbd>.
            </p>
            <p>
              <b>next</b>, and September slides in from the right.
            </p>
          </li>
          <li>
            <p>
              Click the title, then <b>Mar</b>.
            </p>
            <p>
              Still <b>next</b> when the months open (opening a view isn't a move), then <b>prev</b>: March comes from
              the left.
            </p>
          </li>
        </Steps>
        <Demo>
          <Focus on='[data-qwik-date] button[data-value="2024-08-31"]'>Focus Aug 31</Focus>
          <div class='pg-animated'>
            <Calendar value='2024-08-15' />
          </div>
          <Probe label='data-direction' read$={direction} />
          <AnimationLog />
        </Demo>
      </Case>

      <Case
        id='animation-rows'
        title='New rows for each month'
        tests={[
          'the rows of each month are new, so a CSS animation on them plays, in its direction',
          'with several months, every grid animates',
        ]}
      >
        <Steps>
          <li>
            <p>
              Click <b>›</b> in the first calendar, then <b>‹</b>.
            </p>
            <p>
              The log shows <b>tr: pg-month-next ×5</b>, then <b>tr: pg-month-prev ×5</b>: the five rows of the month
              are new elements each time, so their animation plays again.
            </p>
          </li>
          <li>
            <p>
              Click <b>›</b> in the second calendar (months=&#123;2&#125;).
            </p>
            <p>
              Both grids slide in: <b>tr: pg-month-next ×10</b>, the rows of September and of October.
            </p>
          </li>
        </Steps>
        <Demo>
          <div class='pg-animated pg-row'>
            <Calendar value='2024-08-15' />
            <Calendar value='2024-08-15' months={2} />
          </div>
          <AnimationLog />
        </Demo>
      </Case>

      <Case
        id='animation-views'
        title='The months and years grids'
        tests={['the months and years grids animate when they open, and with each year']}
      >
        <Steps>
          <li>
            <p>Click the title.</p>
            <p>
              The months grow in: <b>table: pg-view-in</b>.
            </p>
          </li>
          <li>
            <p>
              Click <b>›</b>.
            </p>
            <p>
              <b>2025</b>, data-direction <b>next</b>, and new rows for the months of 2025.
            </p>
          </li>
        </Steps>
        <Demo>
          <div class='pg-animated'>
            <Calendar value='2024-08-15' />
          </div>
          <Probe label='data-direction' read$={direction} />
          <AnimationLog />
        </Demo>
      </Case>

      <Case
        id='animation-reduced'
        title='Reduced motion, and the theme'
        tests={[
          'with reduced motion, the same CSS moves nothing',
          'the theme only fades colors in 150 ms: no movement of its own',
        ]}
      >
        <Steps>
          <li>
            <p>
              Click <b>›</b> in the second calendar, which doesn't take the CSS of the docs.
            </p>
            <p>
              The month changes without moving: the theme only fades the colors of the days (150ms), and the log stays
              at <b>none</b>.
            </p>
          </li>
          <li>
            <p>
              Turn on "reduce motion" in your OS (or emulate prefers-reduced-motion: reduce in the devtools), then click{' '}
              <b>›</b> in the first one.
            </p>
            <p>Nothing moves nor fades, and the log stays at none.</p>
          </li>
        </Steps>
        <Demo>
          <div class='pg-row'>
            <div class='pg-animated'>
              <Calendar value='2024-08-15' />
            </div>
            <Calendar value='2024-08-15' />
          </div>
          <AnimationLog />
        </Demo>
      </Case>

      <Case
        id='animation-headless'
        title='Headless: useCalendar().direction'
        tests={['headless: useCalendar().direction']}
      >
        <Steps>
          <li>
            <p>
              Click <b>›</b>, then <b>‹</b>.
            </p>
            <p>
              The readout says <b>next</b>, then <b>prev</b>, as the root's data-direction.
            </p>
          </li>
        </Steps>
        <Demo>
          <Headless.Root value='2024-08-15' class='pg-headless'>
            <header>
              <Headless.PrevButton>‹</Headless.PrevButton>
              <Headless.Title />
              <Headless.NextButton>›</Headless.NextButton>
            </header>
            <Headless.Grid>
              <Headless.GridBody />
            </Headless.Grid>
            <DirectionReadout />
          </Headless.Root>
          <Probe
            label='data-direction'
            read$={(root) => root.querySelector('.pg-headless')?.getAttribute('data-direction') ?? 'none'}
          />
        </Demo>
      </Case>
    </>
  );
});
