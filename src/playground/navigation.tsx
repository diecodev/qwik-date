import { component$ } from '@qwik.dev/core';
import { Calendar } from '../lib';
import { Case, Demo, Focus, Probe, Steps, calendarOf, prevButton, selectedCell } from './ui';

export const NavigationCases = component$(() => (
  <>
    <Case
      id='navigation-header'
      title='The header buttons'
      tests={['the header buttons change the month, across years', 'the month title is a polite live region']}
    >
      <Steps>
        <li>
          <p>
            Click <b>‹</b> 8 times.
          </p>
          <p>
            The title goes back one month per click, from August 2024 to <b>December 2023</b>.
          </p>
        </li>
        <li>
          <p>
            Click <b>›</b> once.
          </p>
          <p>
            <b>January 2024</b>.
          </p>
        </li>
        <li>
          <p>With a screen reader on (VoiceOver: ⌘F5), click ›.</p>
          <p>It announces the new month: the title is a polite live region (aria-live="polite").</p>
        </li>
      </Steps>
      <Demo>
        <Calendar date='2024-08-15' />
        <Probe
          label='title aria-live'
          read$={(root) => calendarOf(root)?.querySelector('header > div')?.getAttribute('aria-live') ?? 'none'}
        />
      </Demo>
    </Case>

    <Case
      id='navigation-header-focus'
      title='The header buttons keep the focus'
      tests={['the header buttons keep the focus, so they can be pressed repeatedly']}
    >
      <Steps>
        <li>
          <p>
            Click <b>Focus ‹</b>, then press <kbd>Enter</kbd> three times.
          </p>
          <p>
            <b>July 2024</b>, <b>June 2024</b>, <b>May 2024</b>. The focus bar keeps reading{' '}
            <b>button "go to previous month"</b> and no day gets selected.
          </p>
        </li>
      </Steps>
      <Demo>
        <Focus on={prevButton}>Focus ‹</Focus>
        <Calendar date='2024-08-15' />
        <Probe label='selected cell (aria-selected)' read$={selectedCell} />
      </Demo>
    </Case>

    <Case
      id='navigation-tab-first'
      title='After changing month, Tab enters the grid on the 1st'
      tests={['after changing month, Tab enters the grid on the 1st']}
    >
      <Steps>
        <li>
          <p>
            Click <b>Focus ‹</b>, press <kbd>Enter</kbd>.
          </p>
          <p>
            <b>July 2024</b>.
          </p>
        </li>
        <li>
          <p>
            Press <kbd>Tab</kbd>: twice in Chromium (the first one stops on ›), once in WebKit/Safari (it only tabs to
            elements with an explicit tabindex, so it skips ›).
          </p>
          <p>
            The focus is on <b>Jul 1</b>, not on the 15.
          </p>
        </li>
      </Steps>
      <Demo>
        <Focus on={prevButton}>Focus ‹</Focus>
        <Calendar date='2024-08-15' />
      </Demo>
    </Case>
  </>
));
