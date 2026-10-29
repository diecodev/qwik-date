import { component$, useSignal } from '@qwik.dev/core'
import { Link } from '@qwik.dev/router'
import type { DateRange, LocalDate } from 'qwik-date'
import { Code, Install } from '~/components/code'
import { DatePicker, DateRangePicker } from '~/components/date-picker'
import { H2, Preview } from '~/components/docs'
import { FLOATING, NATIVE, RANGE, USAGE } from '~/components/recipes'
import { docHead } from '~/components/seo'
import { Toc } from '~/components/toc'

export default component$(() => {
  const date = useSignal<LocalDate | null>(null)
  const range = useSignal<DateRange | null>(null)

  return (
    <div class="page">
      <article class="article">
        <h1 class="h1">date picker</h1>
        <p class="lead">
          There's no DatePicker component: put the Calendar in a popover, next
          to a trigger of your own.
        </p>
        <p class="p">
          As with shadcn/ui (Popover + Calendar), the trigger, its format, its
          placeholder and when the popup closes are yours, and qwik-date stays
          free of runtime dependencies. The recipes below do the same, with full
          accessibility:
        </p>
        <ul class="ul">
          <li>
            the trigger has <code class="c">aria-haspopup="dialog"</code> and{' '}
            <code class="c">aria-expanded</code>, and the popup is a dialog
            named after the calendar;
          </li>
          <li>
            opening it focuses the selected day, or the first one that can be
            chosen (<code class="c">autoFocus</code>);
          </li>
          <li>Escape closes it, and so does a click outside;</li>
          <li>
            choosing a day closes it (a range, once it has an end) and the focus
            goes back to the trigger, as it does after Escape;
          </li>
          <li>
            the trigger shows the value with <code class="c">formatDate</code> /{' '}
            <code class="c">formatDateRange</code>.
          </li>
        </ul>
        <div class="callout">
          <span class="label">note</span>
          <code class="c">onToggle$</code> goes inside{' '}
          <code class="c">containerProps</code>, an object: the optimizer only
          turns <code class="c">$</code> props of JSX attributes into QRLs, so
          wrap it in <code class="c">$()</code>.
        </div>

        <H2 id="native">native popover</H2>
        <p class="p">
          No dependencies and no positioning JavaScript. The calendar is itself
          the popover (<code class="c">containerProps.popover</code>), the
          browser closes it on Escape and on clicks outside, and CSS anchor
          positioning keeps it under the trigger, or above it when there's no
          room below. Anchor positioning is Baseline since January 2026: Chrome
          and Edge 125, Safari 26, Firefox 147.
        </p>
        <Preview code={NATIVE} file="date-picker.tsx">
          <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 16px">
            <DatePicker bind:value={date} />
            <DateRangePicker bind:value={range} />
          </div>
          <p class="cap">
            open one: Escape, a click outside or a choice closes it
          </p>
        </Preview>
        <Code code={USAGE} />
        <p class="p">
          For a range, <code class="c">mode="range"</code>,{' '}
          <code class="c">formatDateRange</code> and close it once the range has
          an end:
        </p>
        <Code code={RANGE} />

        <H2 id="qwik-ui">qwik ui</H2>
        <p class="p">
          Not yet: Qwik UI doesn't run on Qwik v2. Its latest release,{' '}
          <code class="c">@qwik-ui/headless</code> 0.7.7, is built for Qwik v1 (
          <code class="c">@builder.io/qwik</code>). Tried with{' '}
          <code class="c">@qwik.dev/core</code> 2.0.0-rc.4, its Popover renders
          nothing in a production build (neither the trigger nor the panel, only
          its children), its components don't typecheck as Qwik v2 components,
          and in dev the first opening shows an invisible panel. Until Qwik UI
          supports Qwik v2, use the native popover, or floating-ui: Qwik UI's
          Popover is a native popover placed by floating-ui too.
        </p>

        <H2 id="floating-ui">floating-ui</H2>
        <p class="p">
          For the browsers without CSS anchor positioning (Safari before 26,
          Firefox before 147), or for floating-ui's middleware: the same native
          popover, placed by floating-ui while it's open.
        </p>
        <Install pkg="@floating-ui/dom" flags="" />
        <Code code={FLOATING} file="date-picker.tsx" />

        <div class="pager">
          <Link class="pn" href="/calendar/">
            <small>← previous</small>Calendar
          </Link>
          <Link class="pn" href="/headless/" style="text-align: right">
            <small>next →</small>Headless
          </Link>
        </div>
      </article>

      <Toc
        items={[
          { id: 'native', label: 'Native popover' },
          { id: 'qwik-ui', label: 'Qwik UI' },
          { id: 'floating-ui', label: 'floating-ui' },
        ]}
      />
    </div>
  )
})

export const head = docHead(
  'Date Picker',
  'A date picker with qwik-date: the Calendar in a native popover, next to a trigger of your own.',
  '/date-picker/',
)
