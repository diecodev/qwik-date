# Contributing to qwik-date

Thanks for helping! This repo is a pnpm workspace: the library lives at the root (`src/lib`) and the
docs site in `website/`.

## Setup

```sh
pnpm install
pnpm exec playwright install --with-deps chromium webkit # browsers for the e2e suite (first time only)
```

## Develop

```sh
pnpm dev # playground at http://localhost:5173, rendering the library straight from src/lib
```

The playground is a catalog of manual checks, one case per e2e test: what to try, what should happen,
and readouts for what the eye can't see (the focused element, attributes, the value `onChange$`
received). The page is `src/routes/index.tsx`; the cases live in `src/playground/<area>.tsx`, one file
per spec in `tests/e2e`.

## Tests

| Command         | What it runs                                                                                 |
| --------------- | -------------------------------------------------------------------------------------------- |
| `pnpm test`     | everything below                                                                             |
| `pnpm test.unit`| Vitest: the date helpers of `src/lib/core`, in several timezones (`tests/unit`)               |
| `pnpm test.e2e` | Playwright: the components in Chromium and WebKit (`tests/e2e`)                              |

The e2e suite starts its own dev server on port 5180 and opens the fixture pages in
`src/routes/e2e/` (you can open them at `http://localhost:5173/e2e/...` while `pnpm dev` runs).
To run part of it: `pnpm exec playwright test --project=chromium tests/e2e/keyboard.spec.ts`, or add
`--ui` for Playwright's UI mode.

When you change behavior, add or update a test: a section in a fixture page plus a spec, and its case in
the playground catalog (`src/playground/<area>.tsx`, with the test name in `tests`). A few things that
bite in this repo:

- Prefer auto-waiting assertions (`toBeFocused`, `toHaveText`, `expect.poll`) over fixed timeouts.
- Qwik loads each event handler lazily and doesn't order handlers of different elements, nor, while it
  loads them and resumes the page, those of consecutive events: wait for one interaction to land before
  the next one. The calendar's keys don't need it: their `sync$` handlers queue them for `keys$`.
- WebKit on macOS, like Safari, only tabs to elements with an explicit `tabindex`, so tab order differs
  from Chromium (and from WebKit on Linux, where the CI runs it): don't count Tab presses per browser.
- The Qwik v2 dev server hangs on an error thrown while rendering, so cover invalid input with unit
  tests instead of fixture pages.

## Docs site

The docs live in `website/` (Qwik Router, built as static pages): `pnpm -C website dev` runs it, and
`pnpm build.website` builds the library and the site as Deno Deploy does. The props, data attributes,
headless parts and `useCalendar()` fields are data in `website/src/data/`: the pages, the search and
`llms-full.txt` read them. After changing them, or the use cases in `website/scripts/llms-full.md`,
run `pnpm -C website llms` to write `website/public/llms-full.txt` again.

## Before opening a pull request

```sh
pnpm build.types && pnpm build.lib # typecheck + build the library
pnpm exec biome check              # lint and format (`pnpm lint` applies the fixes)
pnpm test
```

The CI (`.github/workflows/ci.yml`) runs the same on every pull request, whatever its base (in a stack,
each one targets the branch below), and builds the website too. It runs on Linux and in UTC.

Commits follow [Conventional Commits](https://www.conventionalcommits.org/) with a gitmoji, like the
history: `fix(styled): 🐛 keep the focus on the month buttons after changing month`.

## Releases

Maintainers only. On an up-to-date `main`, `pnpm release` asks for the new version (`2.0.0-beta.1`…),
commits it, tags it and pushes. The tag runs `.github/workflows/release.yml`: the CI, then it stages the
package on npm through Trusted Publishing (a prerelease under its identifier, like `beta`; a plain
version under `latest`) and drafts a GitHub release with the changelog. Nothing is public until a
maintainer approves the staged version with 2FA (npm 11.15 or later):

```sh
npm stage list qwik-date
npm stage approve <stage-id> # asks for the one-time password
```

Then publish the draft release on GitHub. To drop a staged version, `npm stage reject <stage-id>`.
