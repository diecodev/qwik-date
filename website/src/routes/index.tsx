import { component$, useSignal } from '@qwik.dev/core'
import type { DocumentHead } from '@qwik.dev/router'
import { Calendar, type LocalDate } from 'qwik-date'
import { ScriptCode } from '~/components/script'

import '@fontsource-variable/onest'
import { toast } from 'qwik-sonner'
import { Demo } from '~/components/demo'
import { Docs } from '~/components/docs'
import { Footer } from '~/components/footer'
import { Recipes } from '~/components/recipes'

export default component$(() => {
  const date = useSignal<LocalDate | null>(null)

  return (
    <>
      <main class="mx-auto flex max-w-screen-sm flex-col gap-12 px-4 pt-24 pb-8">
        <header>
          <h1 class="text-center font-bold text-5xl leading-snug dark:text-white">
            Qwik Date
          </h1>
          <p class="text-center text-lg dark:text-neutral-400">
            Qwik calendar, simple integration.
          </p>
        </header>
        <section class="flex justify-center gap-8">
          <Calendar
            bind:value={date}
            containerProps={{}}
            fullWeeks
            onChange$={(date) => {
              toast('Date selected successfully', {
                description: date,
              })
            }}
          />
        </section>
        <ScriptCode />
        <Demo />
        <Docs />
        <Recipes />
      </main>
      <Footer />
    </>
  )
})

export const head: DocumentHead = {
  title: 'Qwik Date',
  meta: [
    {
      name: 'description',
      content: 'An opinionated date picker component for Qwik.',
    },
    {
      name: 'og:description',
      content: 'An opinionated date picker component for Qwik.',
    },
    {
      name: 'og:title',
      content: 'Qwik Date',
    },
    {
      name: 'og:image',
      content: 'https://qwik-date.dieco.dev/og.png',
    },
    {
      name: 'og:url',
      content: 'https://qwik-date.dieco.dev',
    },
    {
      name: 'twitter:card',
      content: 'summary_large_image',
    },
    {
      name: 'twitter:title',
      content: 'Qwik Date',
    },
    {
      name: 'twitter:description',
      content: 'An opinionated date picker component for Qwik.',
    },
    {
      name: 'twitter:image',
      content: 'https://qwik-date.dieco.dev/og.png',
    },
    {
      name: 'twitter:url',
      content: 'https://qwik-date.dieco.dev',
    },
    {
      name: 'theme-color',
      content: '#ffffff',
    },
    {
      name: 'color-scheme',
      content: 'light dark',
    },
    {
      name: 'msapplication-TileColor',
      content: '#ffffff',
    },
  ],
}
