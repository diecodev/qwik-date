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
and readouts for what the eye can't see (the focused element, attributes, the value `onDateChange$`
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
- Qwik loads each event handler lazily and doesn't order handlers of different elements: wait for one
  interaction to land before the next one.
- WebKit, like Safari, only tabs to elements with an explicit `tabindex`, so tab order differs from
  Chromium.
- The Qwik v2 dev server hangs on an error thrown while rendering, so cover invalid input with unit
  tests instead of fixture pages.

## Before opening a pull request

```sh
pnpm build.types && pnpm build.lib # typecheck + build the library
pnpm exec biome check              # lint and format (`pnpm lint` applies the fixes)
pnpm test
```

Commits follow [Conventional Commits](https://www.conventionalcommits.org/) with a gitmoji, like the
history: `fix(styled): 🐛 keep the focus on the month buttons after changing month`.
