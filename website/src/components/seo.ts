import type { DocumentHead } from '@qwik.dev/router'

const SITE = 'https://qwik-date.dieco.dev'

/** The title and the social cards of a docs page. */
export const docHead = (
  title: string,
  description: string,
  path: string,
): DocumentHead => {
  const fullTitle = `${title} – qwik-date`
  return {
    title: fullTitle,
    meta: [
      { name: 'description', content: description },
      { property: 'og:title', content: fullTitle },
      { property: 'og:description', content: description },
      { property: 'og:image', content: `${SITE}/og.png` },
      { property: 'og:url', content: `${SITE}${path}` },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: fullTitle },
      { name: 'twitter:description', content: description },
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
  }
}
