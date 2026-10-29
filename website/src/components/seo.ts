import type { DocumentHead } from '@qwik.dev/router'
import { SITE, VERSION, pageAt } from '~/data/site'

const AUTHOR = {
  '@type': 'Person',
  name: 'Diego Díaz',
  url: 'https://dieco.dev',
}

/**
 * The library and the site, as schema.org describes them, for search engines and agents: the same on every
 * page, with the page itself and its breadcrumb.
 */
const structuredData = (url: string, title: string, description: string) => ({
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${SITE}/#website`,
      url: `${SITE}/`,
      name: 'qwik-date',
      description:
        'Docs of qwik-date, the calendar and date picker component for Qwik.',
      inLanguage: 'en',
    },
    {
      '@type': 'SoftwareSourceCode',
      '@id': `${SITE}/#library`,
      name: 'qwik-date',
      description:
        'Calendar and date picker component for Qwik: a day, a range or several days, accessible, in any locale, with forms and headless parts. No runtime dependencies.',
      url: `${SITE}/`,
      codeRepository: 'https://github.com/diecodev/qwik-date',
      programmingLanguage: 'TypeScript',
      runtimePlatform: 'Qwik',
      softwareVersion: VERSION,
      softwareRequirements: '@qwik.dev/core 2.0.0-rc.4 or later',
      keywords: [
        'qwik',
        'qwik calendar',
        'qwik date picker',
        'date range picker',
        'headless calendar',
        'qwik component',
      ],
      author: AUTHOR,
    },
    {
      '@type': 'TechArticle',
      '@id': `${url}#article`,
      url,
      headline: title,
      description,
      inLanguage: 'en',
      isPartOf: { '@id': `${SITE}/#website` },
      about: { '@id': `${SITE}/#library` },
      author: AUTHOR,
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'qwik-date',
          item: `${SITE}/`,
        },
        ...(url === `${SITE}/`
          ? []
          : [{ '@type': 'ListItem', position: 2, name: title, item: url }]),
      ],
    },
  ],
})

/** The title, the description, the social cards and the structured data of a docs page. */
export const docHead = (path: string): DocumentHead => {
  const page = pageAt(path)
  const title = page.headTitle ?? `${page.title} – qwik-date`
  const url = `${SITE}${path}`

  return {
    title,
    meta: [
      { name: 'description', content: page.description },
      { property: 'og:type', content: path === '/' ? 'website' : 'article' },
      { property: 'og:site_name', content: 'qwik-date' },
      { property: 'og:title', content: title },
      { property: 'og:description', content: page.description },
      { property: 'og:image', content: `${SITE}/og.png` },
      { property: 'og:url', content: url },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: page.description },
      { name: 'twitter:image', content: `${SITE}/og.png` },
      { name: 'color-scheme', content: 'light dark' },
      {
        name: 'theme-color',
        content: '#ffffff',
        media: '(prefers-color-scheme: light)',
      },
      {
        name: 'theme-color',
        content: '#0a0a0a',
        media: '(prefers-color-scheme: dark)',
      },
    ],
    links: [
      // for agents: the whole docs as text
      {
        rel: 'alternate',
        type: 'text/plain',
        href: '/llms.txt',
        title: 'qwik-date docs for LLMs',
      },
    ],
    scripts: [
      {
        props: { type: 'application/ld+json' },
        script: JSON.stringify(
          structuredData(url, page.title, page.description),
        ),
      },
    ],
  }
}
