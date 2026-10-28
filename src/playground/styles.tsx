import { component$, useSignal } from '@qwik.dev/core';
import { Calendar, DatePicker } from '../lib';
import { Case, Demo, Probe, Steps, calendarOf, contrastRatio, selectedCell } from './ui';

export const StylesCases = component$(() => {
  const unstyled = useSignal(true);

  return (
    <>
      <Case id='styles-font' title='The page font' tests={['the day numbers and the trigger use the page font']}>
        <Steps>
          <li>
            <p>Look at the calendar and the DatePicker trigger, inside a box with font-family: Georgia, serif.</p>
            <p>
              The title, the weekdays, the day numbers and the DatePicker trigger are all in <b>Georgia</b>
              (serif), unlike the rest of this page.
            </p>
          </li>
        </Steps>
        <Demo>
          <div class='pg-row' style={{ fontFamily: 'Georgia, serif' }}>
            <Calendar value='2024-08-06' />
            <DatePicker value='2024-08-06' />
          </div>
          <Probe
            label='font-family of the title / weekday / day / trigger'
            read$={(root) => {
              const calendar = calendarOf(root);
              return [
                calendar?.querySelector('header > div'),
                calendar?.querySelector('th'),
                calendar?.querySelector('button[data-value="2024-08-06"]'),
                root.querySelector('button[popovertarget]'),
              ]
                .map((el) => (el ? getComputedStyle(el).fontFamily : 'not found'))
                .join(' / ');
            }}
          />
        </Demo>
      </Case>

      <Case
        id='styles-contrast'
        title='Contrast of the weekdays and week numbers'
        tests={['the weekday names and week numbers meet WCAG AA contrast']}
      >
        <Steps>
          <li>
            <p>Look at the grey weekday names and week numbers.</p>
            <p>
              Both are readable: their contrast against the white background is at least <b>4.5:1</b> (WCAG AA). In
              Chrome you can also check it in DevTools: inspect "Su", then the color swatch in Styles.
            </p>
          </li>
        </Steps>
        <Demo>
          <Calendar value='2024-08-15' fullWeeks showWeekNumber />
          <Probe
            label='contrast of the weekday / week number'
            read$={(root) => {
              const calendar = calendarOf(root);
              return `${contrastRatio(calendar?.querySelector('th') ?? null)} / ${contrastRatio(
                calendar?.querySelector('tbody td > span') ?? null,
              )}`;
            }}
          />
        </Demo>
      </Case>

      <Case id='styles-rtl' title='Right-to-left chevrons' tests={['right-to-left layouts mirror the month chevrons']}>
        <Steps>
          <li>
            <p>Compare the headers of the two calendars: right-to-left (first) and left-to-right.</p>
            <p>
              Both headers look the same: chevrons pointing outwards. But in the right-to-left one "previous month" is
              the button on the <b>right</b>, its chevron rotated to point right, and "next month" is on the left; the
              chevrons of the left-to-right one aren't rotated.
            </p>
          </li>
          <li>
            <p>
              Click the <b>right</b> button of the right-to-left calendar.
            </p>
            <p>
              It goes back to <b>July 2024</b>.
            </p>
          </li>
        </Steps>
        <Demo>
          <div class='pg-row'>
            <Calendar value='2024-08-15' containerProps={{ dir: 'rtl' }} />
            <Calendar value='2024-08-15' />
          </div>
          <Probe
            label='transform of ‹ and › (rtl) / ‹ (ltr)'
            read$={(root) => {
              const [rtl, ltr] = root.querySelectorAll('[data-qwik-date]');
              const transforms = [...rtl.querySelectorAll('header button'), ltr.querySelector('header button')];
              return transforms
                .map((button) => (button ? getComputedStyle(button).transform : 'not found'))
                .join(' / ');
            }}
          />
        </Demo>
      </Case>

      <Case id='styles-unstyled-toggle' title='unstyled at runtime' tests={['unstyled can change at runtime']}>
        <Steps>
          <li>
            <p>Look at the calendar, rendered with unstyled=&#123;true&#125;.</p>
            <p>A plain table with browser buttons: no card, no shadow.</p>
          </li>
          <li>
            <p>
              Click <b>Toggle unstyled</b>.
            </p>
            <p>The library styles apply: a rounded card with a shadow.</p>
          </li>
          <li>
            <p>
              Click <b>20</b>.
            </p>
            <p>The 20 turns black and is the selected cell.</p>
          </li>
          <li>
            <p>
              Click <b>Toggle unstyled</b> again.
            </p>
            <p>
              Plain again. "Uncaught errors" in the focus bar stays at <b>0</b> all along.
            </p>
          </li>
        </Steps>
        <Demo>
          <button
            type='button'
            class='pg-button'
            onClick$={() => {
              unstyled.value = !unstyled.value;
            }}
          >
            Toggle unstyled
          </button>
          <Calendar value='2024-08-15' unstyled={unstyled.value} />
          <p class='pg-probe'>
            unstyled: <output>{String(unstyled.value)}</output>
          </p>
          <Probe
            label='box-shadow'
            read$={(root) => {
              const calendar = calendarOf(root);
              return calendar ? getComputedStyle(calendar).boxShadow : 'not found';
            }}
          />
          <Probe label='selected cell (aria-selected)' read$={selectedCell} />
        </Demo>
      </Case>
    </>
  );
});
