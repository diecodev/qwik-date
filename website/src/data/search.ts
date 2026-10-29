import { ATTRIBUTES, PROPS, propAnchor } from './api'
import { PARTS, STATE } from './headless'
import { PAGES } from './site'

export type Kind =
  | 'page'
  | 'section'
  | 'prop'
  | 'attribute'
  | 'part'
  | 'useCalendar'

export type Entry = {
  title: string
  kind: Kind
  /** the page it's on */
  page: string
  href: string
  /** what else matches: the description, the type… */
  text: string
}

const plain = (text: string) => text.replaceAll('`', '')

/** Every page, every section, and the reference: props, data attributes, headless parts and `useCalendar()`. */
const ENTRIES: Entry[] = [
  ...PAGES.flatMap((page): Entry[] => [
    {
      title: page.title,
      kind: 'page',
      page: page.title,
      href: page.path,
      text: page.description,
    },
    ...page.sections.map(
      (section): Entry => ({
        title: section.label,
        kind: 'section',
        page: page.title,
        href: `${page.path}#${section.id}`,
        text: '',
      }),
    ),
  ]),
  ...PROPS.map(
    (prop): Entry => ({
      title: prop.name,
      kind: 'prop',
      page: 'Calendar',
      href: `/calendar/#${propAnchor(prop.name)}`,
      text: `${prop.type} ${plain(prop.description)}`,
    }),
  ),
  ...ATTRIBUTES.map(
    ([name, on, when]): Entry => ({
      title: name,
      kind: 'attribute',
      page: 'Calendar',
      href: '/calendar/#data-attributes',
      text: `${on} ${when}`,
    }),
  ),
  ...PARTS.map(
    ([name, , does]): Entry => ({
      title: name,
      kind: 'part',
      page: 'Headless',
      href: '/headless/#parts',
      text: plain(does),
    }),
  ),
  ...STATE.map(
    ([name, what]): Entry => ({
      title: name,
      kind: 'useCalendar',
      page: 'Headless',
      href: '/headless/#use-calendar',
      text: plain(what),
    }),
  ),
]

const KIND_ORDER: Record<Kind, number> = {
  page: 0,
  prop: 1,
  section: 2,
  attribute: 3,
  part: 4,
  useCalendar: 5,
}

/**
 * The entries with every word of the query, the best first: the title itself, a title that starts with it,
 * one that has it, then the rest. Without a query, the pages.
 */
export const search = (query: string, limit = 12): Entry[] => {
  const q = query.trim().toLowerCase()
  if (!q) return ENTRIES.filter((entry) => entry.kind === 'page')

  const words = q.split(/\s+/)
  return ENTRIES.flatMap((entry) => {
    const title = entry.title.toLowerCase()
    // the kind too: "usecalendar direction", "prop range"
    const haystack = `${title} ${entry.kind.toLowerCase()} ${entry.page.toLowerCase()} ${entry.text.toLowerCase()}`
    if (!words.every((word) => haystack.includes(word))) return []
    const rank =
      title === q ? 0 : title.startsWith(q) ? 1 : title.includes(q) ? 2 : 3
    return [{ entry, rank }]
  })
    .sort(
      (a, b) =>
        a.rank - b.rank || KIND_ORDER[a.entry.kind] - KIND_ORDER[b.entry.kind],
    )
    .slice(0, limit)
    .map(({ entry }) => entry)
}
