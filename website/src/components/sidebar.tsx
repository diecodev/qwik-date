import { component$ } from '@qwik.dev/core'
import { Link, useLocation } from '@qwik.dev/router'

type Section = { title: string; links: { label: string; href: string }[] }

const V2: Section[] = [
  {
    title: 'getting-started/',
    links: [
      { label: 'Installation', href: '/' },
      { label: 'Changelog', href: '/changelog/' },
    ],
  },
  {
    title: 'components/',
    links: [
      { label: 'Calendar', href: '/calendar/' },
      { label: 'Date Picker', href: '/date-picker/' },
      { label: 'Headless', href: '/headless/' },
    ],
  },
  {
    title: 'guides/',
    links: [
      { label: 'Forms', href: '/forms/' },
      { label: 'Localization', href: '/localization/' },
      { label: 'Theming', href: '/theming/' },
      { label: 'Animations', href: '/animations/' },
      { label: 'Accessibility', href: '/accessibility/' },
    ],
  },
]

const V1: Section[] = [
  {
    title: 'qwik-date@1/',
    links: [
      { label: 'Installation', href: '/v1/' },
      { label: 'CalendarInline', href: '/v1/#calendar-inline' },
      { label: 'DatePicker', href: '/v1/#date-picker' },
    ],
  },
  {
    title: 'upgrade/',
    links: [{ label: 'Upgrading to 2.x', href: '/changelog/#upgrading' }],
  },
]

/** The docs' navigation: in the sidebar, and in the menu of narrow screens (`sheet`). */
export const Sidebar = component$<{ sheet?: boolean }>((props) => {
  const loc = useLocation()
  const path = loc.url.pathname
  const sections = path.startsWith('/v1') ? V1 : V2

  return (
    <nav aria-label="Docs">
      {sections.map((section) => (
        <div key={section.title}>
          <p class="side-h">{section.title}</p>
          {section.links.map((link) =>
            link.href.startsWith('http') ? (
              <a key={link.href} class="side-a" href={link.href}>
                {link.label}
              </a>
            ) : (
              <Link
                key={link.href}
                class="side-a"
                href={link.href}
                aria-current={link.href === path ? 'page' : undefined}
                onClick$={() => {
                  if (props.sheet)
                    document.getElementById('mobile-nav')?.hidePopover()
                }}
              >
                {link.label}
              </Link>
            ),
          )}
        </div>
      ))}
    </nav>
  )
})
