import { $, component$, useSignal, useVisibleTask$ } from '@qwik.dev/core';
import { Calendar, DatePicker } from '../lib';
import { Case, Changes, Demo, Probe, Steps, popupGap } from './ui';

/**
 * Counts the live scroll/resize listeners of the page, as the floating-ui test does: autoUpdate adds some while a
 * DatePicker is mounted. It only counts the listeners added after it loaded: compare the number before and after.
 */
const LiveListeners = component$(() => {
  const count = useSignal(0);

  useVisibleTask$(
    () => {
      const live = new Set<unknown>();
      const add = EventTarget.prototype.addEventListener;
      const remove = EventTarget.prototype.removeEventListener;
      // a microtask: listeners can be added while Qwik renders
      const report = () =>
        queueMicrotask(() => {
          count.value = live.size;
        });
      EventTarget.prototype.addEventListener = function (type: string, listener: unknown, options?: unknown) {
        if (type === 'scroll' || type === 'resize') {
          live.add(listener);
          report();
        }
        return add.call(this, type, listener as EventListener, options as AddEventListenerOptions);
      };
      EventTarget.prototype.removeEventListener = function (type: string, listener: unknown, options?: unknown) {
        if (type === 'scroll' || type === 'resize') {
          live.delete(listener);
          report();
        }
        return remove.call(this, type, listener as EventListener, options as EventListenerOptions);
      };
    },
    { strategy: 'document-ready' },
  );

  return (
    <p class='pg-probe'>
      live scroll/resize listeners: <output>{count.value}</output>
    </p>
  );
});

export const PickerCases = component$(() => {
  const picked = useSignal<string[]>([]);
  const keyed = useSignal<string[]>([]);
  const mounted = useSignal(false);

  return (
    <>
      <Case
        id='picker-open'
        title='Opening it and choosing a day'
        tests={['opens next to its trigger, reports the chosen date and closes']}
      >
        <Steps>
          <li>
            <p>
              Click the trigger, <b>Aug 06, 2024</b>.
            </p>
            <p>
              The popup opens right under the trigger, <b>8px below</b> (above it, if there's no room below), not in the
              middle of the window.
            </p>
          </li>
          <li>
            <p>
              Click <b>20</b>.
            </p>
            <p>
              onChange$ is called with <b>2024-08-20</b>, the popup closes and the trigger reads <b>Aug 20, 2024</b>.
            </p>
          </li>
        </Steps>
        <Demo>
          <DatePicker
            value='2024-08-06'
            onChange$={$((date) => {
              picked.value = [...picked.value, date];
            })}
          />
          <Probe label='popup' read$={popupGap} />
          <Changes values={picked.value} />
        </Demo>
      </Case>

      <Case
        id='picker-trigger'
        title='What the trigger shows'
        tests={['shows the value in the trigger, or a placeholder without one']}
      >
        <Steps>
          <li>
            <p>Read the five triggers.</p>
            <p>
              <b>Aug 06, 2024</b> (value="2024-08-06"), <b>Select a date</b> (no value), <b>Pick a date</b> (no value,
              placeholder="Pick a date"), <b>01 Ago 2024</b> (value="2024-08-01" with locale="es": two-digit day,
              capitalized month) and <b>Choisir une date</b> (locale="fr-FR" without value: the placeholder of its
              labels).
            </p>
          </li>
        </Steps>
        <Demo>
          <DatePicker value='2024-08-06' />
          <DatePicker />
          <DatePicker placeholder='Pick a date' />
          <DatePicker value='2024-08-01' locale='es' />
          <DatePicker
            locale='fr-FR'
            labels={{
              calendar: 'Calendrier',
              previousMonth: 'Mois précédent',
              nextMonth: 'Mois suivant',
              selectedDate: 'date sélectionnée :',
              selectedRange: 'période sélectionnée :',
              placeholder: 'Choisir une date',
            }}
          />
        </Demo>
      </Case>

      <Case
        id='picker-keyboard-choose'
        title='Choosing with the keyboard'
        tests={['choosing with the keyboard closes it and returns the focus to the trigger']}
      >
        <Steps>
          <li>
            <p>
              Click the trigger, <b>Aug 06, 2024</b>, then press <kbd>Tab</kbd> until the focus is on Aug 6: 3 times in
              Chromium, once in WebKit/Safari.
            </p>
            <p>The focus bar reads day 2024-08-06 in the DatePicker popup.</p>
          </li>
          <li>
            <p>
              Press <kbd>→</kbd>, then <kbd>Enter</kbd>.
            </p>
            <p>
              onChange$ receives <b>2024-08-07</b>, the popup closes and the focus is back on the trigger, which reads{' '}
              <b>Aug 07, 2024</b>.
            </p>
          </li>
        </Steps>
        <Demo>
          <DatePicker
            value='2024-08-06'
            onChange$={$((date) => {
              keyed.value = [...keyed.value, date];
            })}
          />
          <Changes values={keyed.value} />
        </Demo>
      </Case>

      <Case id='picker-keep-open' title='closeOnSelect={false}' tests={['closeOnSelect={false} keeps it open']}>
        <Steps>
          <li>
            <p>
              Click the trigger, <b>Aug 15, 2024</b>, then <b>20</b>.
            </p>
            <p>
              The trigger reads <b>Aug 20, 2024</b> and the popup stays open.
            </p>
          </li>
        </Steps>
        <Demo>
          <DatePicker value='2024-08-15' closeOnSelect={false} />
          <Probe label='popup' read$={popupGap} />
        </Demo>
      </Case>

      <Case id='picker-escape' title='Escape closes it' tests={['Escape closes it while a day is focused']}>
        <Steps>
          <li>
            <p>
              Click the trigger, <b>Aug 06, 2024</b>, then press <kbd>Tab</kbd> until the focus bar shows a day "in the
              DatePicker popup": 3 times in Chromium (‹, ›, the day), once in WebKit/Safari.
            </p>
            <p>
              The focus is on <b>Aug 6</b>, in the popup.
            </p>
          </li>
          <li>
            <p>
              Press <kbd>Escape</kbd>.
            </p>
            <p>The popup closes.</p>
          </li>
        </Steps>
        <Demo>
          <DatePicker value='2024-08-06' />
          <Probe label='popup' read$={popupGap} />
        </Demo>
      </Case>

      <Case
        id='picker-keyboard-month'
        title='Keyboard month changes stay in the popup'
        tests={['keyboard month changes keep the focus inside the popup']}
      >
        <Steps>
          <li>
            <p>
              Click the trigger, <b>Aug 06, 2024</b>, then <b>‹</b> in the popup.
            </p>
            <p>The popup shows July 2024.</p>
          </li>
          <li>
            <p>
              Press <kbd>Tab</kbd> until the focus is on <b>Jul 1</b> (twice in Chromium, once in WebKit/Safari). Then
              press <kbd>↓</kbd> four times and <kbd>End</kbd>.
            </p>
            <p>
              The focus is on <b>Jul 31</b>.
            </p>
          </li>
          <li>
            <p>
              Press <kbd>→</kbd>.
            </p>
            <p>
              The popup shows <b>August 2024</b> and the focus bar reads{' '}
              <b>day 2024-08-01, "…" in the DatePicker popup</b>: the focus didn't jump to the Aug 1 of the inline
              calendar next to it, which shows August too.
            </p>
          </li>
        </Steps>
        <Demo>
          <Calendar value='2024-08-06' />
          <DatePicker value='2024-08-06' />
        </Demo>
      </Case>

      <Case id='picker-custom-id' title='A custom containerProps.id' tests={['works with a custom containerProps.id']}>
        <Steps>
          <li>
            <p>Look at the ids below.</p>
            <p>
              The popup keeps the id <b>my-picker</b> and the trigger points at it (popovertarget="my-picker").
            </p>
          </li>
          <li>
            <p>
              Click the trigger, <b>Aug 15, 2024</b>.
            </p>
            <p>The popup opens 8px under the trigger (above it, if there's no room below).</p>
          </li>
        </Steps>
        <Demo>
          <DatePicker value='2024-08-15' containerProps={{ id: 'my-picker' }} />
          <Probe
            label='popup id / trigger popovertarget'
            read$={(root) =>
              `${root.querySelector('[popover]')?.id} / ${root.querySelector('button[popovertarget]')?.getAttribute('popovertarget')}`
            }
          />
          <Probe label='popup' read$={popupGap} />
        </Demo>
      </Case>

      <Case
        id='picker-unstyled'
        title='unstyled'
        tests={['unstyled gets none of the library styles and is still positioned']}
      >
        <Steps>
          <li>
            <p>Look at the trigger.</p>
            <p>
              A plain browser button with a calendar icon the size of its text: none of the library styles reach it,
              although the styled calendars on this page load the stylesheet.
            </p>
          </li>
          <li>
            <p>
              Click the trigger, <b>Aug 15, 2024</b>.
            </p>
            <p>
              An unstyled popup (the browser's default popover border, a plain table) opens <b>8px under</b> the trigger
              (above it, if there's no room below), not in the middle of the window.
            </p>
          </li>
        </Steps>
        <Demo>
          <DatePicker value='2024-08-15' unstyled />
          <Probe
            label='box-shadow of the trigger / popup'
            read$={(root) => {
              const shadow = (selector: string) => {
                const el = root.querySelector(selector);
                return el ? getComputedStyle(el).boxShadow : 'not found';
              };
              return `${shadow('button[popovertarget]')} / ${shadow('[popover]')}`;
            }}
          />
          <Probe label='popup' read$={popupGap} />
        </Demo>
      </Case>

      <Case
        id='picker-client'
        title='A DatePicker mounted on the client'
        tests={['positions a DatePicker mounted on the client', 'stops watching when the DatePicker unmounts']}
      >
        <Steps>
          <li>
            <p>
              Note "live scroll/resize listeners", then click <b>Mount a DatePicker</b>.
            </p>
            <p>A DatePicker appears and the number goes up: floating-ui watches the page to place its popup.</p>
          </li>
          <li>
            <p>
              Click its trigger, <b>Aug 15, 2024</b>.
            </p>
            <p>
              The popup opens 8px under the trigger (or above it), although the DatePicker wasn't rendered on the
              server.
            </p>
          </li>
          <li>
            <p>
              Click <b>Unmount the DatePicker</b>.
            </p>
            <p>The number goes back to what it was before mounting: floating-ui stopped watching.</p>
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
            {mounted.value ? 'Unmount the DatePicker' : 'Mount a DatePicker'}
          </button>
          {mounted.value && <DatePicker value='2024-08-15' />}
          <LiveListeners />
          <Probe label='popup' read$={popupGap} />
        </Demo>
      </Case>
    </>
  );
});
