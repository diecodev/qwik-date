import { type Npm, lineOf, majorOf, seriesOf } from './npm'

// The versions the site shows: vite.config.ts reads npm when the site builds and defines `__NPM__` with it, so they
// reach the server and the browser as constants.

export { majorOf, type Line, type Series } from './npm'

declare const __NPM__: Npm

export const NPM: Npm = __NPM__
/** the major these docs are for: the repo's */
export const CURRENT = lineOf(NPM, majorOf(NPM.version))
/** the 1.x line, for Qwik v1 */
export const V1 = lineOf(NPM, 1)
/** the series the changelog has notes for */
export const SERIES_2_0 = seriesOf(NPM, 2, 0)
export const SERIES_1_0 = seriesOf(NPM, 1, 0)
