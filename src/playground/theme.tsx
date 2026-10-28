import { $, component$, useSignal } from '@qwik.dev/core';
import { Calendar, type Theme } from '../lib';
import { Case, Demo, Probe, Steps, calendarOf, contrastRatio } from './ui';

const themeAndBackground = $((root: HTMLElement) => {
  const calendar = calendarOf(root);
  return calendar
    ? `${calendar.getAttribute('data-theme')} / ${getComputedStyle(calendar).backgroundColor}`
    : 'not found';
});

export const ThemeCases = component$(() => {
  const theme = useSignal<Theme>('light');

  return (
    <>
      <Case id='theme-default' title='Light by default' tests={['is light by default']}>
        <Steps>
          <li>
            <p>Look at the calendar, rendered without theme.</p>
            <p>
              Light: data-theme="light", a <b>white</b> background (rgb(255, 255, 255)).
            </p>
          </li>
        </Steps>
        <Demo>
          <Calendar value='2024-08-15' />
          <Probe label='data-theme / background' read$={themeAndBackground} />
        </Demo>
      </Case>

      <Case
        id='theme-dark'
        title='theme="dark"'
        tests={['theme="dark" uses the dark palette, with readable weekday names and week numbers']}
      >
        <Steps>
          <li>
            <p>Look at the calendar, rendered with theme="dark" and showWeekNumber on a black page.</p>
            <p>
              A <b>black</b> background (rgb(0, 0, 0)). The title, the weekday names and the week numbers are readable:
              contrast of at least <b>4.5:1</b>.
            </p>
          </li>
        </Steps>
        <Demo>
          <div class='pg-dark'>
            <Calendar value='2024-08-15' theme='dark' showWeekNumber />
          </div>
          <Probe label='data-theme / background' read$={themeAndBackground} />
          <Probe
            label='contrast of the title / weekday / week number'
            read$={(root) => {
              const calendar = calendarOf(root);
              return ['header > div', 'th', 'tbody td > span']
                .map((selector) => contrastRatio(calendar?.querySelector(selector) ?? null))
                .join(' / ');
            }}
          />
        </Demo>
      </Case>

      <Case id='theme-auto' title='theme="auto"' tests={['theme="auto" follows the operating system color scheme']}>
        <Steps>
          <li>
            <p>
              Switch the color scheme to dark. In Chrome: DevTools › ⋮ › More tools › <b>Rendering</b> › Emulate CSS
              media feature prefers-color-scheme: dark. In any browser on macOS: System Settings › Appearance › Dark.
            </p>
            <p>
              The calendar turns <b>black</b> (rgb(0, 0, 0)), no reload needed. data-theme stays "auto".
            </p>
          </li>
          <li>
            <p>Switch it back to light.</p>
            <p>
              <b>White</b> again (rgb(255, 255, 255)).
            </p>
          </li>
        </Steps>
        <Demo>
          <Calendar value='2024-08-15' theme='auto' />
          <Probe label='data-theme / background' read$={themeAndBackground} />
        </Demo>
      </Case>

      <Case id='theme-signal' title='A Signal as theme' tests={['accepts a Signal and follows its changes']}>
        <Steps>
          <li>
            <p>
              Click <b>dark</b>.
            </p>
            <p>
              The calendar turns <b>black</b> (rgb(0, 0, 0)).
            </p>
          </li>
          <li>
            <p>
              Click <b>light</b>.
            </p>
            <p>
              <b>White</b> again.
            </p>
          </li>
          <li>
            <p>
              Click <b>auto</b>.
            </p>
            <p>It follows the operating system's color scheme, as in the case above.</p>
          </li>
        </Steps>
        <Demo>
          <p class='pg-row'>
            {(['light', 'dark', 'auto'] as const).map((value) => (
              <button
                key={value}
                type='button'
                class='pg-button'
                aria-pressed={theme.value === value}
                onClick$={() => {
                  theme.value = value;
                }}
              >
                {value}
              </button>
            ))}
          </p>
          <Calendar value='2024-08-15' theme={theme} />
          <p class='pg-probe'>
            theme signal: <output>{theme.value}</output>
          </p>
          <Probe label='data-theme / background' read$={themeAndBackground} />
        </Demo>
      </Case>

      <Case
        id='theme-popover'
        title='A dark calendar popover'
        tests={['a calendar that is a popover follows the theme']}
      >
        <Steps>
          <li>
            <p>
              Click <b>Open</b>: the calendar is a native popover (containerProps.popover="auto") with theme="dark".
            </p>
            <p>
              The popup, in the top-left corner (nothing positions it here), is <b>black</b> (rgb(0, 0, 0)) and its
              title is readable: contrast of at least <b>4.5:1</b>.
            </p>
          </li>
        </Steps>
        <Demo>
          <button type='button' class='pg-button' popovertarget='pg-theme-popover'>
            Open
          </button>
          <Calendar value='2024-08-15' theme='dark' containerProps={{ id: 'pg-theme-popover', popover: 'auto' }} />
          <Probe
            label='popup background / contrast of the title'
            read$={(root) => {
              const popup = root.querySelector('[popover]');
              if (!popup?.matches(':popover-open')) return 'closed';
              return `${getComputedStyle(popup).backgroundColor} / ${contrastRatio(popup.querySelector('header > div'))}`;
            }}
          />
        </Demo>
      </Case>
    </>
  );
});
