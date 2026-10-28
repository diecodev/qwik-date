import { component$, useStyles$ } from '@qwik.dev/core';
import { A11yCases } from '../playground/a11y';
import { AutoFocusCases } from '../playground/auto-focus';
import { AvailabilityCases } from '../playground/availability';
import { FormCases } from '../playground/form';
import { HeadlessCases } from '../playground/headless';
import { KeyboardCases } from '../playground/keyboard';
import { MultipleCases } from '../playground/multiple';
import { NavigationCases } from '../playground/navigation';
import styles from '../playground/playground.css?inline';
import { PopoverCases } from '../playground/popover';
import { RangeCases } from '../playground/range';
import { RenderingCases } from '../playground/rendering';
import { SelectionCases } from '../playground/selection';
import { StylesCases } from '../playground/styles';
import { ThemeCases } from '../playground/theme';
import { TimezoneCases } from '../playground/timezone';
import { Section, StatusBar } from '../playground/ui';
import { ViewsCases } from '../playground/views';

// Qwik Router finds actions in the route's module: the Multiple area submits a form to this one
export { usePlaygroundEcho } from '../playground/multiple';

// one section per spec file of tests/e2e, in the same order as the areas of the suite
const AREAS = [
  { id: 'rendering', title: 'Rendering', spec: 'rendering.spec.ts', Cases: RenderingCases },
  { id: 'selection', title: 'Selection', spec: 'selection.spec.ts', Cases: SelectionCases },
  { id: 'range', title: 'Range', spec: 'range.spec.ts', Cases: RangeCases },
  { id: 'multiple', title: 'Multiple', spec: 'multiple.spec.ts', Cases: MultipleCases },
  { id: 'availability', title: 'Availability', spec: 'availability.spec.ts', Cases: AvailabilityCases },
  { id: 'form', title: 'Forms', spec: 'form.spec.ts', Cases: FormCases },
  { id: 'navigation', title: 'Navigation', spec: 'navigation.spec.ts', Cases: NavigationCases },
  { id: 'views', title: 'Months and years', spec: 'views.spec.ts', Cases: ViewsCases },
  { id: 'keyboard', title: 'Keyboard', spec: 'keyboard.spec.ts', Cases: KeyboardCases },
  { id: 'auto-focus', title: 'autoFocus', spec: 'auto-focus.spec.ts', Cases: AutoFocusCases },
  { id: 'timezone', title: 'Timezone', spec: 'timezone.spec.ts', Cases: TimezoneCases },
  { id: 'popover', title: 'Popover recipe', spec: 'popover.spec.ts', Cases: PopoverCases },
  { id: 'styles', title: 'Styles', spec: 'styles.spec.ts', Cases: StylesCases },
  { id: 'a11y', title: 'Accessibility', spec: 'a11y.spec.ts', Cases: A11yCases },
  { id: 'theme', title: 'Theme', spec: 'theme.spec.ts', Cases: ThemeCases },
  { id: 'headless', title: 'Headless', spec: 'headless.spec.ts', Cases: HeadlessCases },
];

/** The `pnpm dev` playground: a catalog of manual checks, one case per test of the e2e suite. */
export default component$(() => {
  useStyles$(styles);

  return (
    <main class='pg-page'>
      <h1>qwik-date: manual test catalog</h1>
      <div class='pg-intro'>
        <p>
          Every case below renders its own components straight from <code>src/lib</code> and says what to try and what
          should happen. Each one has its automated test in <code>tests/e2e/&lt;file&gt;</code>: the file is next to
          each section title, and the test names under each case title.
        </p>
        <ul>
          <li>
            The bar at the bottom shows the focused element, the page scroll and the uncaught errors (hover the count to
            read them). The orange outline marks the focus too; it's the playground's, not the library's.
          </li>
          <li>
            The <b>Focus …</b> buttons focus a day or a button the way the tests do. Clicking a day would also choose
            it, and WebKit/Safari doesn't focus buttons on click.
          </li>
          <li>
            WebKit/Safari only tabs to elements with an explicit tabindex: it skips the month buttons of the calendars
            and most playground buttons, so some Tab counts differ from Chromium.
          </li>
          <li>Reload the page to start over.</li>
        </ul>
      </div>

      <nav class='pg-toc' aria-label='Areas'>
        <h2>Areas</h2>
        <ol>
          {AREAS.map(({ id, title, spec }) => (
            <li key={id}>
              <a href={`#${id}`}>{title}</a> <code>{spec}</code>
            </li>
          ))}
        </ol>
      </nav>

      {AREAS.map(({ id, title, spec, Cases }) => (
        <Section key={id} id={id} title={title} spec={spec}>
          <Cases />
        </Section>
      ))}

      <StatusBar />
    </main>
  );
});
