import { $, component$, useSignal } from '@qwik.dev/core';
import { Calendar, type DateRange, type LocalDate } from '../lib';
import { DatePicker, DateRangePicker } from '../recipes/popover';
import { Case, Demo, Probe, Steps, popupGap } from './ui';

/** What the trigger and the popup of a case announce. */
const announced = $((root: HTMLElement) => {
  const trigger = root.querySelector('button[popovertarget]');
  const popup = root.querySelector('[popover]');
  return `aria-haspopup=${trigger?.getAttribute('aria-haspopup')} · aria-expanded=${trigger?.getAttribute('aria-expanded')} · popup role=${popup?.getAttribute('role')}`;
});

/** The native recipe of the docs (src/recipes/popover.tsx, qwik-date.dieco.dev/date-picker): a native popover placed with CSS anchor positioning. */
export const PopoverCases = component$(() => {
  const opened = useSignal<LocalDate | null>('2024-08-06');
  const flipped = useSignal<LocalDate | null>('2024-08-06');
  const escaped = useSignal<LocalDate | null>('2024-08-06');
  const chosen = useSignal<LocalDate | null>('2024-08-06');
  const keyed = useSignal<LocalDate | null>('2024-08-06');
  const range = useSignal<DateRange | null>({ start: '2024-08-05', end: '2024-08-12' });
  const picked = useSignal<LocalDate | null>('2024-08-15');
  const submitted = useSignal('');

  return (
    <>
      <Case
        id='popover-open'
        title='Opening it'
        tests={['opens next to its trigger, as a dialog, with the focus on the selected day']}
      >
        <Steps>
          <li>
            <p>Read the readout under the trigger.</p>
            <p>
              <b>aria-haspopup=dialog · aria-expanded=false · popup role=dialog</b>.
            </p>
          </li>
          <li>
            <p>
              Click the trigger, <b>Aug 06, 2024</b>.
            </p>
            <p>
              The popup opens <b>8px below</b> the trigger, its left edge lined up with the trigger's, and the focus bar
              reads <b>day 2024-08-06 … in a popover</b> (autoFocus). aria-expanded turns <b>true</b>.
            </p>
          </li>
        </Steps>
        <Demo>
          <DatePicker bind:value={opened} />
          <Probe label='popup' read$={popupGap} />
          <Probe label='announced' read$={announced} />
        </Demo>
      </Case>

      <Case id='popover-flip' title='No room below' tests={['opens above the trigger when there is no room below']}>
        <Steps>
          <li>
            <p>
              Click <b>Scroll the trigger down</b>: the page scrolls until the trigger sits right above the focus bar,
              at the bottom of the window.
            </p>
            <p>There's no room for the popup below the trigger now.</p>
          </li>
          <li>
            <p>Click the trigger.</p>
            <p>
              The popup opens <b>8px above</b> the trigger instead.
            </p>
          </li>
        </Steps>
        <Demo>
          <button
            type='button'
            class='pg-button'
            onClick$={(_, button) => {
              const trigger = button.closest('.pg-case')?.querySelector('button[popovertarget]');
              const bar = document.querySelector('.pg-status')?.getBoundingClientRect().height ?? 0;
              if (trigger) scrollBy(0, trigger.getBoundingClientRect().bottom - (innerHeight - bar - 16));
            }}
          >
            Scroll the trigger down
          </button>
          <DatePicker bind:value={flipped} />
          <Probe label='popup' read$={popupGap} />
        </Demo>
      </Case>

      <Case id='popover-escape' title='Escape' tests={['Escape closes it and returns the focus to the trigger']}>
        <Steps>
          <li>
            <p>
              Click the trigger, <b>Aug 06, 2024</b>.
            </p>
            <p>The focus bar reads day 2024-08-06 … in a popover.</p>
          </li>
          <li>
            <p>
              Press <kbd>Escape</kbd>.
            </p>
            <p>
              The popup closes, the focus bar reads <b>button "Aug 06, 2024" (Escape)</b>, the trigger, and
              aria-expanded is false again. In WebKit/Safari too, where clicking the trigger didn't focus it.
            </p>
          </li>
        </Steps>
        <Demo>
          <DatePicker bind:value={escaped} />
          <Probe label='popup' read$={popupGap} />
          <Probe label='announced' read$={announced} />
        </Demo>
      </Case>

      <Case
        id='popover-choose'
        title='Choosing a day'
        tests={['choosing a day closes it and returns the focus to the trigger']}
      >
        <Steps>
          <li>
            <p>
              Click the trigger, <b>Aug 06, 2024</b>, then press <kbd>→</kbd> and <kbd>Enter</kbd>.
            </p>
            <p>
              The popup closes, the trigger reads <b>Aug 07, 2024</b> and has the focus.
            </p>
          </li>
          <li>
            <p>
              Click the trigger again, then click <b>20</b>.
            </p>
            <p>
              The popup closes, the trigger reads <b>Aug 20, 2024</b> and has the focus (in WebKit/Safari too).
            </p>
          </li>
        </Steps>
        <Demo>
          <DatePicker bind:value={chosen} />
          <p class='pg-probe'>
            value: <output>{chosen.value}</output>
          </p>
          <Probe label='popup' read$={popupGap} />
        </Demo>
      </Case>

      <Case
        id='popover-keyboard-month'
        title='Keyboard month changes stay in the popup'
        tests={['keyboard month changes keep the focus inside the popup']}
      >
        <Steps>
          <li>
            <p>
              Click the trigger, <b>Aug 06, 2024</b>.
            </p>
            <p>The focus bar reads day 2024-08-06 … in a popover.</p>
          </li>
          <li>
            <p>
              Press <kbd>Page Up</kbd>.
            </p>
            <p>
              The popup shows <b>July 2024</b>, the focus on Jul 6, in the popover.
            </p>
          </li>
          <li>
            <p>
              Press <kbd>Page Down</kbd>.
            </p>
            <p>
              The popup shows <b>August 2024</b> and the focus bar reads <b>day 2024-08-06 … in a popover</b>: the focus
              didn't jump to the Aug 6 of the inline calendar next to it, which shows August too. The popup stays open.
            </p>
          </li>
        </Steps>
        <Demo>
          <Calendar value='2024-08-06' />
          <DatePicker bind:value={keyed} />
        </Demo>
      </Case>

      <Case id='popover-range' title='A range' tests={['a range closes it once it has an end']}>
        <Steps>
          <li>
            <p>Read the trigger.</p>
            <p>
              <b>Aug 05, 2024 – Aug 12, 2024</b>.
            </p>
          </li>
          <li>
            <p>Click it, then click 20.</p>
            <p>
              The focus was on Aug 5, the start, when it opened. Now the popup stays open and the trigger reads{' '}
              <b>Aug 20, 2024 – …</b>.
            </p>
          </li>
          <li>
            <p>Click 22.</p>
            <p>
              The popup closes, the trigger reads <b>Aug 20, 2024 – Aug 22, 2024</b> and has the focus.
            </p>
          </li>
        </Steps>
        <Demo>
          <DateRangePicker bind:value={range} />
          <Probe label='popup' read$={popupGap} />
        </Demo>
      </Case>

      <Case id='popover-form' title='In a form' tests={['name submits the chosen day with the form around it']}>
        <Steps>
          <li>
            <p>
              Click <b>Submit</b>: the picker is rendered with name="picked" and Aug 15, 2024.
            </p>
            <p>
              <b>picked=2024-08-15</b>.
            </p>
          </li>
          <li>
            <p>
              Open it, click <b>20</b>, then click <b>Submit</b>.
            </p>
            <p>
              The popup closes on the click; then <b>picked=2024-08-20</b>.
            </p>
          </li>
        </Steps>
        <Demo>
          <form
            preventdefault:submit
            onSubmit$={(_, form) => {
              submitted.value = [...new FormData(form)].map(([key, value]) => `${key}=${value}`).join('&');
            }}
            class='pg-row'
          >
            <DatePicker bind:value={picked} name='picked' />
            <button type='submit' class='pg-button'>
              Submit
            </button>
          </form>
          <p class='pg-probe'>
            submitted: <output>{submitted.value || 'nothing yet'}</output>
          </p>
        </Demo>
      </Case>
    </>
  );
});
