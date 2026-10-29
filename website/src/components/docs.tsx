import { Slot, component$, useSignal } from '@qwik.dev/core'
import { Code } from './code'

export const H2 = component$<{ id: string }>((props) => (
  <h2 class="h2" id={props.id}>
    <span class="hash" aria-hidden="true">
      ##
    </span>
    <Slot />
  </h2>
))

export const H3 = component$<{ id: string }>((props) => (
  <h3 class="h3" id={props.id}>
    <span class="hash" aria-hidden="true">
      ###
    </span>
    <Slot />
  </h3>
))

/** The live example and its code, in two tabs. The example stays mounted while the code shows. */
export const Preview = component$<{ code: string; file?: string }>((props) => {
  const tab = useSignal<'preview' | 'code'>('preview')

  return (
    <div class="pv">
      <div class="pv-h">
        <button
          type="button"
          class="pt"
          aria-pressed={tab.value === 'preview'}
          onClick$={() => {
            tab.value = 'preview'
          }}
        >
          preview
        </button>
        <button
          type="button"
          class="pt"
          aria-pressed={tab.value === 'code'}
          onClick$={() => {
            tab.value = 'code'
          }}
        >
          code
        </button>
        {props.file && (
          <span
            class="mono"
            style="margin-left: auto; font-size: 12px; color: var(--muted)"
          >
            {props.file}
          </span>
        )}
      </div>
      <div class="pv-b" hidden={tab.value !== 'preview'}>
        <Slot />
      </div>
      {tab.value === 'code' && <Code code={props.code} />}
    </div>
  )
})

/** Text with `inline code` between backticks. */
export const md = (text: string) =>
  text.split('`').map((part, i) =>
    i % 2 ? (
      <code key={i} class="c">
        {part}
      </code>
    ) : (
      part
    ),
  )
