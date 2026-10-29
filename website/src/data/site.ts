// The pages of the docs: their titles, what search engines show of them, and their sections. The head of each
// page, "on this page", the search and the structured data read them.

export const SITE = 'https://qwik-date.dieco.dev'
export const VERSION = '2.0.0-beta.0'

export type Section = { id: string; label: string; sub?: boolean }

export type Page = {
  path: string
  /** in the sidebar, the search and the breadcrumb */
  title: string
  /** the `<title>`, when it isn't `${title} – qwik-date` */
  headTitle?: string
  description: string
  sections: Section[]
}

export const PAGES: Page[] = [
  {
    path: '/',
    title: 'Installation',
    headTitle: 'qwik-date – Calendar and date picker component for Qwik',
    description:
      'qwik-date is a calendar and date picker component for Qwik v2: install it, bind it to a signal, and pick a day, a range or several days.',
    sections: [
      { id: 'install', label: 'Install' },
      { id: 'usage', label: 'Usage' },
      { id: 'compatibility', label: 'Compatibility' },
      { id: 'next', label: 'Next' },
    ],
  },
  {
    path: '/calendar/',
    title: 'Calendar',
    headTitle: 'Calendar component for Qwik – qwik-date',
    description:
      'The qwik-date Calendar for Qwik: single dates, date ranges, multiple dates, two months, min and max dates, with every prop, data attribute and key.',
    sections: [
      { id: 'usage', label: 'Usage' },
      { id: 'examples', label: 'Examples' },
      { id: 'range', label: 'Range', sub: true },
      { id: 'multiple', label: 'Multiple', sub: true },
      { id: 'two-months', label: 'Two months', sub: true },
      { id: 'disabled', label: 'Disabled days', sub: true },
      { id: 'months-and-years', label: 'Months and years', sub: true },
      { id: 'display', label: 'Display options', sub: true },
      { id: 'api', label: 'API' },
      { id: 'props', label: 'Props', sub: true },
      { id: 'data-attributes', label: 'Data attributes', sub: true },
      { id: 'keyboard', label: 'Keyboard', sub: true },
      { id: 'types', label: 'Types', sub: true },
      { id: 'functions', label: 'Functions', sub: true },
    ],
  },
  {
    path: '/date-picker/',
    title: 'Date Picker',
    headTitle: 'Date picker for Qwik – qwik-date',
    description:
      'Build an accessible date picker in Qwik: the qwik-date Calendar in a native popover placed with CSS anchor positioning, or with floating-ui.',
    sections: [
      { id: 'native', label: 'Native popover' },
      { id: 'qwik-ui', label: 'Qwik UI' },
      { id: 'floating-ui', label: 'floating-ui' },
    ],
  },
  {
    path: '/headless/',
    title: 'Headless',
    headTitle: 'Headless calendar for Qwik – qwik-date',
    description:
      'A headless calendar for Qwik: qwik-date/headless gives the parts with the keyboard, the state and the accessibility, and useCalendar() for rows of your own.',
    sections: [
      { id: 'import', label: 'Import' },
      { id: 'anatomy', label: 'Anatomy' },
      { id: 'parts', label: 'Parts' },
      { id: 'styling', label: 'Styling' },
      { id: 'rows', label: 'Rows of your own' },
      { id: 'use-calendar', label: 'useCalendar()' },
    ],
  },
  {
    path: '/forms/',
    title: 'Forms',
    description:
      'Submit dates with Qwik forms: the qwik-date Calendar adds hidden inputs for a day, a range or several days, ready for a Qwik Router action.',
    sections: [
      { id: 'inputs', label: 'Hidden inputs' },
      { id: 'actions', label: 'Qwik Router actions' },
    ],
  },
  {
    path: '/localization/',
    title: 'Localization',
    description:
      'A Qwik calendar in any language: qwik-date takes the month and weekday names from Intl, with labels and the first day of the week.',
    sections: [
      { id: 'locale', label: 'Locale' },
      { id: 'labels', label: 'Labels' },
      { id: 'week', label: 'First day of the week' },
      { id: 'formatting', label: 'Formatting' },
    ],
  },
  {
    path: '/theming/',
    title: 'Theming',
    description:
      'Theme the qwik-date calendar for Qwik: light, dark or auto, your own CSS over the library styles, unstyled, and right to left.',
    sections: [
      { id: 'theme', label: 'Theme' },
      { id: 'your-styles', label: 'Your own styles' },
      { id: 'unstyled', label: 'Unstyled' },
      { id: 'rtl', label: 'Right to left' },
    ],
  },
  {
    path: '/animations/',
    title: 'Animations',
    description:
      'Animate the month changes of the qwik-date calendar with CSS: data-direction and new rows on every move, inside prefers-reduced-motion.',
    sections: [
      { id: 'moments', label: 'The moments' },
      { id: 'tailwind', label: 'Tailwind' },
      { id: 'popover', label: 'The popover' },
    ],
  },
  {
    path: '/accessibility/',
    title: 'Accessibility',
    description:
      'An accessible calendar for Qwik: keyboard navigation, screen reader names and announcements, focus management and contrast in qwik-date.',
    sections: [
      { id: 'names', label: 'Names and announcements' },
      { id: 'focus', label: 'Keyboard and focus' },
      { id: 'motion', label: 'Motion and contrast' },
      { id: 'yours', label: 'Your part' },
    ],
  },
  {
    path: '/changelog/',
    title: 'Changelog',
    description:
      'Release notes of qwik-date: 2.0.0-beta.0 for Qwik v2 and 1.0.0 for Qwik v1, with the breaking changes and the upgrade from 1.x.',
    sections: [
      { id: 'v2-0-0-beta-0', label: '2.0.0-beta.0' },
      { id: 'breaking', label: 'Breaking', sub: true },
      { id: 'new', label: 'New', sub: true },
      { id: 'fixes', label: 'Fixes', sub: true },
      { id: 'upgrading', label: 'Upgrading from 1.x', sub: true },
      { id: 'v1-0-0', label: '1.0.0' },
    ],
  },
  {
    path: '/v1/',
    title: 'qwik-date@1',
    headTitle: 'qwik-date 1.x for Qwik v1 – qwik-date',
    description:
      'The docs of qwik-date 1.x, the calendar and date picker for Qwik v1 (@builder.io/qwik): CalendarInline and DatePicker.',
    sections: [
      { id: 'install', label: 'Install' },
      { id: 'calendar-inline', label: 'CalendarInline' },
      { id: 'date-picker', label: 'DatePicker' },
    ],
  },
]

export const pageAt = (path: string) => {
  const page = PAGES.find((item) => item.path === path)
  if (!page) throw new Error(`No page at ${path}`)
  return page
}
