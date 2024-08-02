import { $, component$ } from '@builder.io/qwik'
import { toast } from 'qwik-sonner'

export const ScriptCode = component$(() => {
  const copyToClipboard = $((el: string) => {
    const $el = document.querySelector(el)
    if (!$el) return

    const data = $el.textContent
    if (!data) return

    navigator.clipboard.writeText(data)
    toast('Copied to clipboard')
  })

  return (
    <section class="space-y-10">
      <div class="space-y-3">
        <h3 class="text-center font-medium">
          {'> '}Installation{' <'}
        </h3>
        <pre
          class="relative cursor-copy rounded-lg bg-neutral-50 p-3 font-thin text-neutral-600 text-sm transition-all dark:bg-neutral-800 dark:text-neutral-200"
          onClick$={() => copyToClipboard('#installation')}
          id="installation"
        >
          <code class="pointer-events-none">npm install qwik-date</code>
          <button
            class="absolute top-2 right-2 rounded-md border border-neutral-300 p-1 transition-all dark:border-neutral-600 dark:text-neutral-200"
            onClick$={() => copyToClipboard('#installation')}
          >
            <span class="sr-only">copy to clipboard</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="size-4"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75"
              />
            </svg>
          </button>
        </pre>
      </div>
    </section>
  )
})
