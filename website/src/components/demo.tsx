import { component$ } from '@builder.io/qwik'

export const Demo = component$(() => {
  return (
    <section class="space-y-10">
      <div class="space-y-3">
        <h3 class="text-center font-medium">
          {'> '}Usage{' <'}
        </h3>
        <pre class="relative flex cursor-copy flex-col gap-3 rounded-lg bg-neutral-50 p-3 font-thin text-neutral-600 text-sm transition-all dark:bg-neutral-800 dark:text-neutral-200">
          <code class="pointer-events-none">
            {"import { CalendarInline } from 'qwik-date/inline'"}{' '}
            <span class="text-neutral-400 text-sm">{'//-> inline mode'}</span>
          </code>
          <code class="pointer-events-none">
            {"import { Calendar } from 'qwik-date'"}{' '}
            <span class="text-neutral-400 text-sm">{'//-> inline mode'}</span>
          </code>
          <code class="pointer-events-none">
            {"import { DatePicker } from 'qwik-date'"}{' '}
            <span class="text-neutral-400 text-sm">{'//-> popup mode'}</span>
          </code>
          <code class="pointer-events-none">
            {"import { DatePicker } from 'qwik-date/picker'"}{' '}
            <span class="text-neutral-400 text-sm">{'//-> popup mode'}</span>
          </code>
        </pre>
      </div>
    </section>
  )
})
