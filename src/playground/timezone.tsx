import { component$, useSignal, useVisibleTask$ } from '@qwik.dev/core';
import { Calendar } from '../lib';
import { Case, Demo, Focus, Steps, day } from './ui';

const BrowserTimezone = component$(() => {
  const timezone = useSignal('');

  useVisibleTask$(() => {
    timezone.value = Intl.DateTimeFormat().resolvedOptions().timeZone;
  });

  return (
    <p class='pg-probe'>
      browser timezone: <output>{timezone.value}</output>
    </p>
  );
});

export const TimezoneCases = component$(() => (
  <>
    <p class='pg-note'>
      Keyboard date math runs in the browser, in its timezone: moving across a daylight saving change must not lose or
      repeat a day. To reproduce it, give the browser the timezone of the case. In Chrome: DevTools › ⋮ › More tools ›{' '}
      <b>Sensors</b> › Location › Other…, and type the Timezone ID. Keep DevTools open, reload, and check "browser
      timezone" under the calendar. Safari has no override: change the macOS time zone (System Settings › General › Date
      &amp; Time) and restart Safari. In a timezone without daylight saving time the steps pass too, but they don't test
      anything.
    </p>

    <Case
      id='timezone-madrid'
      title='Europe/Madrid (DST starts on March 31, 2024)'
      tests={[
        'in Europe/Madrid: PageDown from 2024-03-15 goes to 2024-04-15',
        'in Europe/Madrid: ArrowDown from 2024-03-30 goes to 2024-04-06',
      ]}
    >
      <Steps>
        <li>
          <p>
            Set the timezone to <code>Europe/Madrid</code> (the Berlin preset has the same DST dates) and reload.
          </p>
          <p>"browser timezone" reads Europe/Madrid (or Europe/Berlin).</p>
        </li>
        <li>
          <p>
            Click <b>Focus Mar 15</b>, press <kbd>PageDown</kbd>.
          </p>
          <p>
            <b>April 2024</b>, focus on <b>Apr 15</b>. Press <kbd>PageUp</kbd> to come back.
          </p>
        </li>
        <li>
          <p>
            Click <b>Focus Mar 30</b>, press <kbd>↓</kbd>.
          </p>
          <p>
            <b>April 2024</b>, focus on <b>Apr 6</b>, a week later (not Apr 5).
          </p>
        </li>
      </Steps>
      <Demo>
        <p class='pg-row'>
          <Focus on={day('2024-03-15')}>Focus Mar 15</Focus>
          <Focus on={day('2024-03-30')}>Focus Mar 30</Focus>
        </p>
        <Calendar date='2024-03-15' />
        <BrowserTimezone />
      </Demo>
    </Case>

    <Case
      id='timezone-new-york'
      title='America/New_York (DST starts on March 10, 2024)'
      tests={['in America/New_York: PageDown from 2024-02-15 goes to 2024-03-15']}
    >
      <Steps>
        <li>
          <p>
            Set the timezone to <code>America/New_York</code> (the San Francisco preset has the same DST dates) and
            reload.
          </p>
          <p>"browser timezone" reads America/New_York (or America/Los_Angeles).</p>
        </li>
        <li>
          <p>
            Click <b>Focus Feb 15</b>, press <kbd>PageDown</kbd>.
          </p>
          <p>
            <b>March 2024</b>, focus on <b>Mar 15</b>.
          </p>
        </li>
      </Steps>
      <Demo>
        <Focus on={day('2024-02-15')}>Focus Feb 15</Focus>
        <Calendar date='2024-02-15' />
        <BrowserTimezone />
      </Demo>
    </Case>
  </>
));
