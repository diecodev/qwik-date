import { component$, useSignal } from '@qwik.dev/core';
import { useLocation } from '@qwik.dev/router';
import { Calendar } from '../lib';
import { Case, Demo, Steps } from './ui';

export const AutoFocusCases = component$(() => {
  const location = useLocation();
  const mounted = useSignal(false);

  return (
    <>
      <Case
        id='auto-focus-open'
        title='Opening a popover'
        tests={[
          'opening the popover focuses the selected day',
          'closing and reopening it focuses the selected day again, the one chosen last',
        ]}
      >
        <Steps>
          <li>
            <p>
              Click <b>Open</b>: the calendar is a native popover (containerProps.popover="auto") with autoFocus and
              value="2024-08-15".
            </p>
            <p>
              The popup opens in the top-left corner (nothing positions it here) and the focus bar reads{' '}
              <b>day 2024-08-15 … in a popover</b>, without pressing Tab.
            </p>
          </li>
          <li>
            <p>
              Press <kbd>Escape</kbd>, then click <b>Open</b> again.
            </p>
            <p>The popup closes and reopens, with the focus on Aug 15 again.</p>
          </li>
          <li>
            <p>
              Click <b>20</b>, press <kbd>Escape</kbd> and click <b>Open</b>.
            </p>
            <p>
              20 is selected, and on reopening the focus is on <b>Aug 20</b>, the day chosen last.
            </p>
          </li>
        </Steps>
        <Demo>
          <button type='button' class='pg-button' popovertarget='pg-auto-focus-popover'>
            Open
          </button>
          <Calendar autoFocus value='2024-08-15' containerProps={{ id: 'pg-auto-focus-popover', popover: 'auto' }} />
        </Demo>
      </Case>

      <Case
        id='auto-focus-empty'
        title='Without a value'
        tests={['without a value it focuses the first day that can be chosen']}
      >
        <Steps>
          <li>
            <p>
              Click <b>Open</b>: the calendar has no value, min="2099-03-10" and that day in disabledDates.
            </p>
            <p>
              It opens on March 2099 with the focus on <b>Mar 11</b>: Mar 10 is struck through, so the first day that
              can be chosen takes the focus.
            </p>
          </li>
        </Steps>
        <Demo>
          <button type='button' class='pg-button' popovertarget='pg-auto-focus-empty'>
            Open
          </button>
          <Calendar
            autoFocus
            min='2099-03-10'
            disabledDates={['2099-03-10']}
            containerProps={{ id: 'pg-auto-focus-empty', popover: 'auto' }}
          />
        </Demo>
      </Case>

      <Case
        id='auto-focus-without'
        title='Without autoFocus'
        tests={['without autoFocus, opening the popover leaves the focus where it was']}
      >
        <Steps>
          <li>
            <p>
              Click <b>Open</b>: the same popover, without autoFocus.
            </p>
            <p>
              The popup opens and the focus stays where it was: on <b>Open</b> in Chromium, on nothing (the page) in
              WebKit/Safari, which doesn't focus buttons on click. No day takes it.
            </p>
          </li>
        </Steps>
        <Demo>
          <button type='button' class='pg-button' popovertarget='pg-auto-focus-without'>
            Open
          </button>
          <Calendar value='2024-08-15' containerProps={{ id: 'pg-auto-focus-without', popover: 'auto' }} />
        </Demo>
      </Case>

      <Case
        id='auto-focus-load'
        title='Visible on load'
        tests={['focuses the day on load when the calendar is already visible']}
      >
        <Steps>
          <li>
            <p>
              Click <b>Reload with an autoFocus calendar</b>: the page reloads with <code>?autofocus</code>, which
              renders an inline calendar with autoFocus and value="2024-08-15" here. Don't add a <code>#</code> to the
              URL: Chromium drops the focus on load when the URL points at an element, as with the HTML autofocus
              attribute.
            </p>
            <p>
              Right after the page loads, the focus bar reads <b>day 2024-08-15 … (Visible on load)</b> and the page
              shows this case.
            </p>
          </li>
          <li>
            <p>
              Click <b>Back to the plain page</b>.
            </p>
            <p>
              The calendar is gone and the URL has no <code>?autofocus</code>: the "No focus on load" case holds again.
            </p>
          </li>
        </Steps>
        <Demo>
          {location.url.searchParams.has('autofocus') ? (
            <>
              <a class='pg-button' href='/#auto-focus-load'>
                Back to the plain page
              </a>
              <Calendar autoFocus value='2024-08-15' />
            </>
          ) : (
            // no #fragment: Chromium drops the focus on load when the URL points at an element, as with `autofocus`
            <a class='pg-button' href='/?autofocus'>
              Reload with an autoFocus calendar
            </a>
          )}
        </Demo>
      </Case>

      <Case
        id='auto-focus-mount'
        title='Mounted on the client'
        tests={['focuses the day of a calendar mounted on the client']}
      >
        <Steps>
          <li>
            <p>
              Click <b>Mount a calendar</b>: it renders an inline calendar with autoFocus and value="2024-08-15", which
              wasn't rendered on the server.
            </p>
            <p>
              The calendar appears with the focus on <b>Aug 15</b>.
            </p>
          </li>
        </Steps>
        <Demo>
          <button
            type='button'
            class='pg-button'
            onClick$={() => {
              mounted.value = !mounted.value;
            }}
          >
            {mounted.value ? 'Unmount the calendar' : 'Mount a calendar'}
          </button>
          {mounted.value && <Calendar autoFocus value='2024-08-15' />}
        </Demo>
      </Case>
    </>
  );
});
