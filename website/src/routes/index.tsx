import { component$, useSignal } from '@qwik.dev/core'
import { Link } from '@qwik.dev/router'
import { Calendar, type LocalDate } from 'qwik-date'
import { Install } from '~/components/code'
import { H2, Preview } from '~/components/docs'
import { docHead } from '~/components/seo'
import { Toc } from '~/components/toc'
import { pageAt } from '~/data/site'

const USAGE = `import { component$, useSignal } from '@qwik.dev/core';
import { Calendar, type LocalDate } from 'qwik-date';

export default component$(() => {
  const date = useSignal<LocalDate | null>(null);

  return <Calendar bind:value={date} />;
});`

export default component$(() => {
  const date = useSignal<LocalDate | null>(null)

  return (
    <div class="page">
      <article class="article">
        <h1 class="h1">installation</h1>
        <p class="lead">
          A calendar and date picker component for Qwik. Install it, import it,
          bind it to a signal: that's the whole setup.
        </p>

        <H2 id="install">install</H2>
        <p class="p">
          qwik-date 2 is in beta and works with Qwik v2 (
          <code class="c">@qwik.dev/core</code>).
        </p>
        <Install pkg="qwik-date@beta" />
        <p class="small">
          Keep <code class="c">@beta</code>. Until 2.0 is stable, a plain{' '}
          <code class="c">qwik-date</code> resolves to 1.0.0, which is for Qwik
          v1.
        </p>
        <div class="callout">
          <span class="label">note</span>On Qwik v1? Install{' '}
          <code class="c">qwik-date@1</code> and{' '}
          <Link href="/v1/">read the 1.x docs</Link>.
        </div>

        <H2 id="usage">usage</H2>
        <p class="p">
          Import the <code class="c">Calendar</code> and bind it to a signal.
        </p>
        <Preview code={USAGE} file="src/routes/index.tsx">
          <Calendar bind:value={date} theme="auto" />
          <p class="cap">value → {date.value ? `'${date.value}'` : 'null'}</p>
        </Preview>
        <p class="p">
          The value is a <code class="c">YYYY-MM-DD</code> string, or{' '}
          <code class="c">null</code> when no day is selected.
        </p>

        <H2 id="compatibility">compatibility</H2>
        <p class="p">
          Match the Qwik in your <code class="c">package.json</code>.
        </p>
        <div class="scroll">
          <table class="tbl">
            <thead>
              <tr>
                <th>qwik-date</th>
                <th>qwik</th>
                <th>install</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  2.x{' '}
                  <span
                    class="mono"
                    style="font-size: 12px; color: var(--blue)"
                  >
                    beta
                  </span>
                </td>
                <td>
                  v2, <code class="c">@qwik.dev/core</code>
                </td>
                <td>
                  <code class="c">qwik-date@beta</code>
                </td>
              </tr>
              <tr>
                <td>1.x</td>
                <td>
                  v1, <code class="c">@builder.io/qwik</code>
                </td>
                <td>
                  <code class="c">qwik-date@1</code>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="p">
          2.x is ESM only, needs Node 20.19+ or 22.12+, and has zero runtime
          dependencies.
        </p>

        <H2 id="next">next</H2>
        <ul class="ul">
          <li>
            <Link href="/calendar/">Calendar</Link>: the props, and examples
            with ranges, several days and two months.
          </li>
          <li>
            <Link href="/date-picker/">Date Picker</Link>: the calendar in a
            popover, with a trigger of your own.
          </li>
          <li>
            <Link href="/headless/">Headless</Link>: the same calendar in parts,
            styled by you.
          </li>
        </ul>

        <div class="pager">
          <span />
          <Link class="pn" href="/calendar/" style="text-align: right">
            <small>next →</small>Calendar
          </Link>
        </div>
      </article>

      <Toc items={pageAt('/').sections} />
    </div>
  )
})

export const head = docHead('/')
