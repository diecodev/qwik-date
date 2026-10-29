// What npm knows of qwik-date: its dist-tags and the day each version came out. The site reads it when it builds
// (vite.config.ts, scripts/llms.ts), so the menu, the install commands and the changelog show what's published.
// Plain functions, no Vite: the llms script runs them in Node.

export interface Npm {
  /** the library's version in the repo: the one being released, before npm has it */
  version: string
  /** the dist-tags: `{ latest: '1.0.0', beta: '2.0.0-beta.1' }` */
  tags: Record<string, string>
  /** the day each published version came out, `YYYY-MM-DD` (UTC) */
  dates: Record<string, string>
}

const REGISTRY = 'https://registry.npmjs.org/qwik-date'

/**
 * Reads the registry. Offline, a local build goes on with the repo's version as unreleased; in the CI (`CI` is set
 * there and on Vercel) it fails, so a deploy never shows versions that aren't the published ones.
 */
export const readNpm = async (version: string): Promise<Npm> => {
  try {
    const response = await fetch(REGISTRY, {
      signal: AbortSignal.timeout(10_000),
    })
    if (!response.ok)
      throw new Error(`${response.status} ${response.statusText}`)
    const data = (await response.json()) as {
      'dist-tags': Record<string, string>
      time: Record<string, string>
    }
    const dates = Object.fromEntries(
      Object.entries(data.time)
        .filter(([key]) => key !== 'created' && key !== 'modified')
        .map(([key, time]) => [key, time.slice(0, 10)]),
    )
    return { version, tags: data['dist-tags'], dates }
  } catch (error) {
    if (process.env.CI) throw new Error(`couldn't read ${REGISTRY}: ${error}`)
    console.warn(
      `couldn't read ${REGISTRY} (${error}): the site shows ${version} as unreleased`,
    )
    return { version, tags: {}, dates: {} }
  }
}

/** A major of qwik-date, as the site names it. */
export interface Line {
  major: number
  /** the label of the version menu: the dist-tag while only prereleases are out (`@beta`), `@2` once stable */
  label: string
  /** what to install: `qwik-date` once `latest` is the newest major, `qwik-date@beta` or `qwik-date@1` otherwise */
  spec: string
  /** the newest version of the major on npm, or the repo's own while it isn't published */
  version: string
  /** the dist-tag of `version`: `beta`, `latest`… */
  tag: string | null
  /** the day `version` came out, `null` while it isn't on npm */
  date: string | null
  /** no stable version yet: only alphas, betas, release candidates */
  prerelease: boolean
}

const parts = (version: string) => {
  const dash = version.indexOf('-')
  return {
    core: (dash < 0 ? version : version.slice(0, dash)).split('.').map(Number),
    pre: dash < 0 ? [] : version.slice(dash + 1).split('.'),
  }
}

export const majorOf = (version: string) => parts(version).core[0]

/** Semver order, newest first: `2.0.0` > `2.0.0-rc.1` > `2.0.0-beta.10` > `2.0.0-beta.2` > `1.0.0`. */
export const newestFirst = (a: string, b: string) => {
  const x = parts(a)
  const y = parts(b)
  for (let i = 0; i < 3; i++)
    if (x.core[i] !== y.core[i]) return y.core[i] - x.core[i]
  // a release comes after its prereleases
  if (!x.pre.length || !y.pre.length) return x.pre.length - y.pre.length
  for (let i = 0; i < Math.max(x.pre.length, y.pre.length); i++) {
    const [p, q] = [x.pre[i], y.pre[i]]
    if (p === undefined || q === undefined) return p === undefined ? 1 : -1
    if (p === q) continue
    const numeric = /^\d+$/.test(p) && /^\d+$/.test(q)
    return numeric ? Number(q) - Number(p) : q < p ? -1 : 1
  }
  return 0
}

export const lineOf = (npm: Npm, major: number): Line => {
  const published = Object.keys(npm.dates)
    .filter((version) => majorOf(version) === major)
    .sort(newestFirst)
  const tagOf = (version: string) =>
    Object.entries(npm.tags).find(([, tagged]) => tagged === version)?.[0] ??
    null
  const stable = published.find((version) => !version.includes('-'))
  // an older major npm didn't answer for (offline): stable, by its number
  if (!published.length && majorOf(npm.version) !== major) {
    const version = `${major}.0.0`
    return {
      major,
      version,
      tag: null,
      date: null,
      label: `@${major}`,
      spec: `qwik-date@${major}`,
      prerelease: false,
    }
  }
  // before its first publish, the repo's version stands for its major
  const version = stable ?? published[0] ?? npm.version
  const tag = tagOf(version)
  const base = { major, version, tag, date: npm.dates[version] ?? null }

  if (stable) {
    // the plain package name installs `latest`: only for the newest major
    const plain =
      npm.tags.latest !== undefined &&
      majorOf(npm.tags.latest) === major &&
      majorOf(npm.version) === major
    return {
      ...base,
      label: `@${major}`,
      spec: plain ? 'qwik-date' : `qwik-date@${major}`,
      prerelease: false,
    }
  }
  // only prereleases: their dist-tag, or the identifier of the version (`beta` in 2.0.0-beta.1) before it's tagged
  const name = tag ?? parts(version).pre[0] ?? 'next'
  return {
    ...base,
    label: `@${name}`,
    spec: `qwik-date@${name}`,
    prerelease: true,
  }
}

/** A section of the changelog: a `major.minor` series and its versions on npm. */
export interface Series {
  /** the newest version of the series on npm, or `major.minor.0` (the repo's, if it's in the series) before any */
  version: string
  /** its dist-tag, if it has one */
  tag: string | null
  /** the day it came out, `null` while it isn't on npm */
  date: string | null
  /** the other versions of the series, newest first */
  earlier: { version: string; date: string }[]
}

export const seriesOf = (npm: Npm, major: number, minor: number): Series => {
  const inSeries = (version: string) => {
    const [x, y] = parts(version).core
    return x === major && y === minor
  }
  const published = Object.keys(npm.dates).filter(inSeries).sort(newestFirst)
  const version =
    published[0] ??
    (inSeries(npm.version) ? npm.version : `${major}.${minor}.0`)
  return {
    version,
    tag:
      Object.entries(npm.tags).find(([, tagged]) => tagged === version)?.[0] ??
      null,
    date: npm.dates[version] ?? null,
    earlier: published
      .slice(1)
      .map((other) => ({ version: other, date: npm.dates[other] })),
  }
}
