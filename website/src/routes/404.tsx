import { component$, useSignal, useVisibleTask$ } from '@qwik.dev/core'
import { type DocumentHead, Link } from '@qwik.dev/router'

const PAGES = [
  { label: 'Installation', href: '/' },
  { label: 'Calendar', href: '/calendar/' },
  { label: 'Date Picker', href: '/date-picker/' },
  { label: 'Headless', href: '/headless/' },
  { label: 'Changelog', href: '/changelog/' },
  { label: 'qwik-date@1, for Qwik v1', href: '/v1/' },
]

export default component$(() => {
  // the static 404.html is served for any missing address: the browser knows which one
  const path = useSignal('')

  useVisibleTask$(
    () => {
      path.value = location.pathname
    },
    { strategy: 'document-ready' },
  )

  return (
    <div class="page">
      <article class="article">
        <h1 class="h1">page not found</h1>
        <p class="lead">
          There's nothing at this address. Some pages moved when the docs were
          rebuilt for 2.x.
        </p>
        <div class="term">
          <pre class="tpre">
            <code>
              <span class="pr">$ </span>cd{' '}
              <span class="tk-n">{path.value || '…'}</span>
              {'\n'}
              <span class="tk-c">cd: no such file or directory (404)</span>
            </code>
          </pre>
        </div>
        <p class="p">
          <button
            type="button"
            class="link"
            onClick$={() =>
              (
                document.getElementById('search') as HTMLDialogElement | null
              )?.showModal()
            }
          >
            Search the docs
          </button>{' '}
          (<kbd class="mono">⌘K</kbd>), or start from one of these:
        </p>
        <ul class="ul">
          {PAGES.map((page) => (
            <li key={page.href}>
              <Link href={page.href}>{page.label}</Link>
            </li>
          ))}
        </ul>
      </article>
    </div>
  )
})

export const head: DocumentHead = {
  title: 'Page not found – qwik-date',
  meta: [{ name: 'robots', content: 'noindex' }],
}
