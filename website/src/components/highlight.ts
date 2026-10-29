export type Token = { kind: string; text: string }

/** The class suffix of each group of `TOKEN`, in order. */
const KINDS = ['c', 's', 'k', 'n', 't', 'f']

/**
 * A small highlighter for the TSX, TS and CSS snippets of the docs: comments, strings, keywords,
 * literals, components (`<Calendar`) and calls (`formatDate(`). Enough for short examples, no grammar.
 */
const TOKEN =
  /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|('(?:[^'\\\n]|\\.)*'|"(?:[^"\\\n]|\\.)*"|`(?:[^`\\]|\\.)*`)|(\b(?:import|export|default|from|const|let|return|type|interface|extends|as|if|new|await|async|function)\b)|(\b(?:null|undefined|true|false)\b|\b\d+(?:\.\d+)?\b)|(<\/?[A-Z][\w.]*)|([A-Za-z_$][\w$]*(?=\())/g

export const highlight = (code: string): Token[] => {
  const tokens: Token[] = []
  let last = 0
  for (const match of code.matchAll(TOKEN)) {
    const index = match.index ?? 0
    const text = match[0]
    if (index > last) tokens.push({ kind: '', text: code.slice(last, index) })
    const kind =
      KINDS[match.slice(1).findIndex((group) => group !== undefined)] ?? ''
    if (kind === 't') {
      // the bracket stays plain: only the component's name is colored
      const bracket = text.startsWith('</') ? '</' : '<'
      tokens.push(
        { kind: '', text: bracket },
        { kind: 't', text: text.slice(bracket.length) },
      )
    } else {
      tokens.push({ kind, text })
    }
    last = index + text.length
  }
  if (last < code.length) tokens.push({ kind: '', text: code.slice(last) })
  return tokens
}
