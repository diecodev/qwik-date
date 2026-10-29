import { component$ } from '@qwik.dev/core'
import { Link, useLocation } from '@qwik.dev/router'
import { Sidebar } from './sidebar'

const VERSIONS = [
  { spec: 'qwik-date@beta', name: '2.0.0-beta.0', qwik: 'qwik v2', href: '/' },
  { spec: 'qwik-date@1', name: '1.0.0', qwik: 'qwik v1', href: '/v1/' },
]

const Check = () => (
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
    <path d="M20 6 9 17l-5-5" />
  </svg>
)

export const Header = component$(() => {
  const loc = useLocation()
  const path = loc.url.pathname
  const v1 = path.startsWith('/v1')
  const version = v1 ? VERSIONS[1] : VERSIONS[0]
  const section = path.startsWith('/changelog')
    ? 'changelog'
    : path.startsWith('/calendar') ||
        path.startsWith('/date-picker') ||
        path.startsWith('/headless')
      ? 'components'
      : 'docs'

  return (
    <header class="header">
      <div class="header-in">
        <div style="display: flex; align-items: center">
          <Link class="logo" href={version.href}>
            <span class="mark" aria-hidden="true" />
            qwik-date
          </Link>
          <button
            type="button"
            class="spec"
            popovertarget="version-menu"
            aria-label={`Version: ${version.name}`}
          >
            {v1 ? '@1' : '@beta'}
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
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
          <div id="version-menu" popover="auto" class="menu">
            {VERSIONS.map((item) => (
              <Link
                key={item.spec}
                class="mi"
                href={item.href}
                aria-current={item === version ? 'page' : undefined}
                onClick$={() =>
                  document.getElementById('version-menu')?.hidePopover()
                }
              >
                <span style="display: inline-flex; color: var(--blue)">
                  {item === version && <Check />}
                </span>
                <span style="display: flex; flex-direction: column; min-width: 0">
                  <span class="mono" style="font-size: 13px">
                    {item.spec}
                  </span>
                  <span style="font-size: 12px; color: var(--muted)">
                    {item.name}
                  </span>
                </span>
                <span class="mono" style="font-size: 12px; color: var(--muted)">
                  {item.qwik}
                </span>
              </Link>
            ))}
            <div class="sep" />
            <Link
              class="mi"
              href="/changelog/"
              onClick$={() =>
                document.getElementById('version-menu')?.hidePopover()
              }
            >
              <span />
              <span class="mono" style="font-size: 13px">
                changelog
              </span>
              <span aria-hidden="true" style="color: var(--muted)">
                →
              </span>
            </Link>
          </div>
        </div>

        <nav aria-label="Main" style="display: flex; gap: 20px">
          <Link
            class="nav"
            href={version.href}
            aria-current={section === 'docs' ? 'page' : undefined}
          >
            Docs
          </Link>
          <Link
            class="nav"
            href="/calendar/"
            aria-current={section === 'components' ? 'page' : undefined}
          >
            Components
          </Link>
          <Link
            class="nav"
            href="/changelog/"
            aria-current={section === 'changelog' ? 'page' : undefined}
          >
            Changelog
          </Link>
        </nav>

        <div style="flex: 1" />

        <div style="display: flex; gap: 2px">
          <a
            class="ghost"
            href="https://github.com/diecodev/qwik-date"
            aria-label="GitHub"
          >
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
              <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
              <path d="M9 18c-4.51 2-5-2-7-2" />
            </svg>
          </a>
          <button
            type="button"
            class="ghost"
            aria-label="Switch the theme"
            onClick$={() => {
              const root = document.documentElement
              const system = matchMedia('(prefers-color-scheme: dark)').matches
                ? 'dark'
                : 'light'
              const next =
                (root.dataset.theme ?? system) === 'dark' ? 'light' : 'dark'
              // back on the system's theme, nothing is stored: the site follows the system again
              if (next === system) {
                delete root.dataset.theme
                localStorage.removeItem('theme')
              } else {
                root.dataset.theme = next
                localStorage.setItem('theme', next)
              }
            }}
          >
            <svg
              class="i icon-moon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
            </svg>
            <svg
              class="i icon-sun"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
            </svg>
          </button>
          <button
            type="button"
            class="ghost mobile"
            popovertarget="mobile-nav"
            aria-label="Open the menu"
          >
            <svg
              class="i"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              aria-hidden="true"
            >
              <path d="M4 8h16M4 16h16" />
            </svg>
          </button>
        </div>
      </div>
      <div id="mobile-nav" popover="auto" class="sheet">
        <Sidebar sheet />
      </div>
    </header>
  )
})
