import { component$, useSignal, useVisibleTask$ } from '@qwik.dev/core'

export type TocItem = { id: string; label: string; sub?: boolean }

/** "On this page", with the section on screen marked. */
export const Toc = component$<{ items: TocItem[] }>((props) => {
  const active = useSignal(props.items[0]?.id)

  // only the scroll needs the browser: the list itself is rendered on the server
  useVisibleTask$(
    ({ cleanup }) => {
      const observer = new IntersectionObserver(
        (entries) => {
          const visible = entries.find((entry) => entry.isIntersecting)
          if (visible) active.value = visible.target.id
        },
        { rootMargin: '-72px 0px -70% 0px' },
      )
      for (const item of props.items) {
        const heading = document.getElementById(item.id)
        if (heading) observer.observe(heading)
      }
      cleanup(() => observer.disconnect())
    },
    { strategy: 'document-idle' },
  )

  return (
    <aside class="toc" aria-label="On this page">
      <p class="toc-h">on this page</p>
      {props.items.map((item) => (
        <a
          key={item.id}
          class="toc-a"
          href={`#${item.id}`}
          aria-current={active.value === item.id ? 'true' : undefined}
          style={item.sub ? 'padding-left: 12px' : undefined}
        >
          {item.label}
        </a>
      ))}
    </aside>
  )
})
