import { component$, useSignal } from '@qwik.dev/core'
import { highlight } from './highlight'

/** The tokens of a snippet, colored by the `tk-*` classes. */
export const Tokens = component$<{ code: string }>((props) => (
  <>
    {highlight(props.code).map((token, i) =>
      token.kind ? (
        <span key={i} class={`tk-${token.kind}`}>
          {token.text}
        </span>
      ) : (
        token.text
      ),
    )}
  </>
))

export const CopyButton = component$<{ text: string; class?: string }>(
  (props) => {
    const copied = useSignal(false)

    return (
      <button
        type="button"
        class={['tcopy', props.class]}
        onClick$={async () => {
          await navigator.clipboard.writeText(props.text)
          copied.value = true
          setTimeout(() => {
            copied.value = false
          }, 1500)
        }}
      >
        {copied.value ? 'copied' : 'copy'}
      </button>
    )
  },
)

/** A snippet in a dark block, with a copy button and the file's name if it has one. */
export const Code = component$<{ code: string; file?: string }>((props) => (
  <div class="term">
    {props.file ? (
      <div class="term-h">
        <span class="term-file">{props.file}</span>
        <CopyButton text={props.code} />
      </div>
    ) : (
      <CopyButton text={props.code} class="tcopy-float" />
    )}
    <pre class="tpre">
      <code>
        <Tokens code={props.code} />
      </code>
    </pre>
  </div>
))

const MANAGERS = {
  pnpm: 'pnpm add',
  npm: 'npm install',
  yarn: 'yarn add',
  bun: 'bun add',
}

type Manager = keyof typeof MANAGERS

/** The install command for each package manager. */
export const Install = component$<{ pkg: string; flags?: string }>((props) => {
  const manager = useSignal<Manager>('pnpm')
  const flags = props.flags ?? '-D -E'
  const base = `${MANAGERS[manager.value]}${flags ? ` ${flags}` : ''}`

  return (
    <div class="term">
      <div class="term-h" role="group" aria-label="Package manager">
        {(Object.keys(MANAGERS) as Manager[]).map((id) => (
          <button
            key={id}
            type="button"
            class="tt"
            aria-pressed={manager.value === id}
            onClick$={() => {
              manager.value = id
            }}
          >
            {id}
          </button>
        ))}
        <CopyButton text={`${base} ${props.pkg}`} />
      </div>
      <pre class="tpre">
        <code>
          <span class="pr">$ </span>
          {base} <span class="tk-n">{props.pkg}</span>
        </code>
      </pre>
    </div>
  )
})
