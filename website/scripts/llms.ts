// Writes public/llms.txt and public/llms-full.txt: the key facts, and the docs in one Markdown file, for LLMs and
// agents. The prose comes from llms.md and llms-full.md; the reference tables, from the same data as the site's
// pages, so they can't drift; the versions and install commands, from npm, as the site's. `pnpm build.website` runs
// it before the site builds (Node 24 runs the TypeScript as is); `pnpm llms` alone writes them for `pnpm dev`.

import { readFileSync, writeFileSync } from 'node:fs'
import library from '../../package.json' with { type: 'json' }
import { ATTRIBUTES, PROPS } from '../src/data/api.ts'
import { PARTS, STATE } from '../src/data/headless.ts'
import { lineOf, majorOf, readNpm } from '../src/data/npm.ts'

const pad = (n: number) => String(n).padStart(2, '0')
const localDate = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
const addDays = (day: string, days: number) => {
  const [year, month, date] = day.split('-').map(Number)
  return localDate(new Date(year, month - 1, date + days))
}
const nextOf = (day: string, monthDay: string) => {
  const year = Number(day.slice(0, 4))
  return `${year}-${monthDay}` >= day ? `${year}-${monthDay}` : `${year + 1}-${monthDay}`
}

/** As qwik-date's formatDate: a two-digit day and a capitalized short month, through Intl. */
const formatDate = (day: string, locale = 'en') => {
  const [year, month, date] = day.split('-').map(Number)
  return new Intl.DateTimeFormat(locale, { day: '2-digit', month: 'short', year: 'numeric' })
    .formatToParts(new Date(year, month - 1, date))
    .map((part) =>
      part.type === 'month' ? part.value.charAt(0).toLocaleUpperCase(locale) + part.value.slice(1) : part.value,
    )
    .join('')
}

const today = localDate(new Date())
const week = addDays(today, 7)

const npm = await readNpm(library.version)
const current = lineOf(npm, majorOf(npm.version))
const latest = npm.tags.latest
// while the docs' major is only in prerelease, a plain install gives an older one
const older =
  current.spec !== 'qwik-date' && latest ? `${latest}${majorOf(latest) === 1 ? ', which is for Qwik v1' : ''}` : null

const tokens: Record<string, string> = {
  '%spec%': current.spec,
  '%v1-spec%': lineOf(npm, 1).spec,
  '%line%': `${current.major}.x${current.prerelease ? ` (${current.label.slice(1)})` : ''}`,
  '%keep%': older
    ? ` Until ${current.major}.0 is stable, installing \`qwik-date\` without a tag gives ${older}: keep \`${current.label}\`.`
    : '',
  '%keep-short%': older ? ` (until ${current.major}.0 is stable, \`qwik-date\` without a tag installs ${older})` : '',
  '%keep-gotcha%': older ? `: plain \`qwik-date\` is ${latest} until ${current.major}.0 is stable` : '',
  '%today%': today,
  '%week%': week,
  '%max%': addDays(today, 90),
  '%christmas%': nextOf(today, '12-25'),
  '%new-year%': nextOf(today, '01-01'),
  '%month%': today.slice(0, 7),
  '%fmt-today%': formatDate(today),
  '%fmt-today-es%': formatDate(today, 'es'),
  '%fmt-range%': `${formatDate(today)} – ${formatDate(week)}`,
  '%fmt-open%': `${formatDate(today)} – …`,
}
const fill = (text: string) => Object.entries(tokens).reduce((out, [token, value]) => out.replaceAll(token, value), text)

/** A Markdown table: the pipes of the TypeScript unions escaped, so they don't split the cells. */
const table = (head: string[], rows: string[][]) =>
  [head, head.map(() => '---'), ...rows]
    .map((row) => `| ${row.map((cell) => cell.replaceAll('|', '\\|').replaceAll('\n', ' ')).join(' | ')} |`)
    .join('\n')

const code = (text: string) => `\`${text}\``

const sections: Record<string, string> = {
  '<!-- props -->': table(
    ['Prop', 'Type', 'Default', 'Description', 'Example'],
    PROPS.map((prop) => [
      code(prop.name),
      code(prop.type),
      prop.default === '–' ? '' : code(prop.default),
      prop.description + (prop.was ? ` (1.x: ${code(prop.was)})` : ''),
      code(prop.example.replaceAll('\n', ' ')),
    ]),
  ),
  '<!-- attributes -->': table(
    ['Attribute', 'On', 'When'],
    ATTRIBUTES.map(([name, on, when]) => [code(name), on, when]),
  ),
  '<!-- parts -->': table(
    ['Part', 'Renders', 'What it does'],
    PARTS.map(([name, renders, does]) => [code(name), code(renders), does]),
  ),
  '<!-- use-calendar -->': table(
    ['Field', 'What it is'],
    STATE.map(([name, what]) => [code(name), what]),
  ),
}

const template = readFileSync(new URL('./llms-full.md', import.meta.url), 'utf8')
// a function, not a string: `$` in the content (`onChange$`) would be read as a replacement pattern
const output = fill(
  Object.entries(sections).reduce((out, [marker, content]) => out.replace(marker, () => content), template),
)
writeFileSync(new URL('../public/llms-full.txt', import.meta.url), output)
writeFileSync(new URL('../public/llms.txt', import.meta.url), fill(readFileSync(new URL('./llms.md', import.meta.url), 'utf8')))
console.log(`public/llms.txt and llms-full.txt: ${current.spec} (${current.version}), dates from ${today}`)
