import { $, component$, sync$, useOnDocument, useSignal } from '@qwik.dev/core'
import { Link, useNavigate } from '@qwik.dev/router'
import { search } from '~/data/search'

const KIND_LABEL = {
  page: 'page',
  section: 'section',
  prop: 'prop',
  attribute: 'attribute',
  part: 'part',
  useCalendar: 'useCalendar()',
}

/** Opens the search. The dialog lives in the layout, once. */
export const SearchButton = component$(() => (
  <button
    type="button"
    class="search-btn"
    aria-label="Search the docs"
    aria-keyshortcuts="Meta+K Control+K"
    onClick$={() =>
      (
        document.getElementById('search') as HTMLDialogElement | null
      )?.showModal()
    }
  >
    <svg
      class="i"
      style="width: 14px; height: 14px"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
    <span class="search-btn-text">Search docs</span>
    <kbd class="kbd" aria-hidden="true">
      ⌘K
    </kbd>
  </button>
))

/**
 * ⌘K or Ctrl+K anywhere, and / outside a field. A native modal dialog: it keeps the focus inside and Escape
 * closes it; the input is a combobox over the list of results.
 */
export const SearchDialog = component$(() => {
  const query = useSignal('')
  const active = useSignal(0)
  const navigate = useNavigate()
  const results = search(query.value)

  // synchronous, so the browser's own Ctrl+K never runs
  useOnDocument(
    'keydown',
    sync$((event: KeyboardEvent) => {
      const typing = (event.target as Element | null)?.closest?.(
        'input, textarea, select, [contenteditable="true"]',
      )
      const shortcut =
        ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') ||
        (event.key === '/' && !typing)
      if (!shortcut) return
      const dialog = document.getElementById(
        'search',
      ) as HTMLDialogElement | null
      if (!dialog) return
      event.preventDefault()
      if (dialog.open) dialog.close()
      else dialog.showModal()
    }),
  )

  const go = $((href: string) => {
    ;(document.getElementById('search') as HTMLDialogElement | null)?.close()
    navigate(href)
  })

  return (
    <dialog
      id="search"
      class="search-dialog"
      aria-label="Search the docs"
      onClick$={(event, dialog) => {
        // a click on the backdrop: the dialog itself, not its content
        if (event.target === dialog) dialog.close()
      }}
      onClose$={() => {
        query.value = ''
        active.value = 0
      }}
    >
      <div class="search-box">
        <svg
          class="i"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <input
          type="text"
          autofocus
          role="combobox"
          aria-label="Search the docs"
          aria-expanded="true"
          aria-controls="search-results"
          aria-autocomplete="list"
          aria-activedescendant={
            results.length ? `search-${active.value}` : undefined
          }
          placeholder="Search props, pages, attributes…"
          autocomplete="off"
          spellcheck={false}
          bind:value={query}
          onInput$={() => {
            active.value = 0
          }}
          onKeyDown$={[
            sync$((event: KeyboardEvent) => {
              if (['ArrowDown', 'ArrowUp', 'Enter'].includes(event.key))
                event.preventDefault()
            }),
            $((event: KeyboardEvent) => {
              const found = search(query.value)
              if (event.key === 'ArrowDown')
                active.value = Math.min(active.value + 1, found.length - 1)
              if (event.key === 'ArrowUp')
                active.value = Math.max(active.value - 1, 0)
              if (event.key === 'Enter' && found[active.value])
                go(found[active.value].href)
            }),
          ]}
        />
        <kbd class="kbd" aria-hidden="true">
          esc
        </kbd>
      </div>
      <ul
        id="search-results"
        role="listbox"
        aria-label="Results"
        class="search-list"
      >
        {results.map((entry, i) => (
          <li
            key={`${entry.href}-${entry.title}`}
            id={`search-${i}`}
            role="option"
            aria-selected={i === active.value}
            onMouseEnter$={() => {
              active.value = i
            }}
          >
            <Link
              href={entry.href}
              tabIndex={-1}
              onClick$={() =>
                (
                  document.getElementById('search') as HTMLDialogElement | null
                )?.close()
              }
            >
              <span
                class={
                  entry.kind === 'page' || entry.kind === 'section'
                    ? ''
                    : 'mono'
                }
              >
                {entry.title}
              </span>
              <span class="search-meta">
                {entry.kind === 'page'
                  ? entry.text
                  : `${entry.page} · ${KIND_LABEL[entry.kind]}`}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      {!results.length && (
        <p class="search-empty">no results for "{query.value}"</p>
      )}
      <p class="search-foot mono" aria-hidden="true">
        <span>↑↓ move</span>
        <span>↵ open</span>
        <span>esc close</span>
      </p>
    </dialog>
  )
})
