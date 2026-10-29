# qwik-date website

Demo and docs site for `qwik-date`, built with Qwik v2 + [Qwik Router](https://qwik.dev/docs/) and
deployed to [Vercel](https://vercel.com/docs) at <https://qwik-date.dieco.dev>.

It consumes the library through `workspace:*`, i.e. from the built `lib/` folder at the repo root,
so **build the library first** (`pnpm build.types && pnpm build.lib` from the root).

## Commands

```shell
pnpm dev            # dev server (SSR)
pnpm build.types    # typecheck
pnpm build.client   # client build -> dist/
pnpm build.server   # prerenders every route into dist/ (SSG)
pnpm preview        # production build served locally by Vite
```

From the repo root, `pnpm build.website` runs the whole chain (library + client + server/SSG).

## Deployment (Vercel)

The site is fully prerendered, so Vercel serves `dist/` as static files: no functions. Its GitHub
integration builds every push (production for `main`, a preview for the other branches); there is no
GitHub Actions workflow for it.

The build settings live in [`vercel.json`](../vercel.json) at the repo root:

| Setting          | Value                                                         |
| ---------------- | ------------------------------------------------------------- |
| Root directory   | repo root (the default): the build needs the library          |
| Framework preset | none (`"framework": null`)                                    |
| Install command  | the default: `pnpm install`                                   |
| Build command    | `pnpm build.website`                                          |
| Output directory | `website/dist`                                                |

Both run the pnpm of `package.json`'s `packageManager`: Vercel reads it and picks pnpm 12 (without it,
it would pick pnpm 10 for this lockfile), which then switches to that exact version.

`trailingSlash` matches the URLs of the pages (`/calendar/`), `404.html` answers the missing ones, and
`/build/` and `/assets/` (hashed file names) are cached for a year.

One-time setup in the dashboard: import the `diecodev/qwik-date` repo, keep the root directory as the
repo root, and add the custom domain `qwik-date.dieco.dev` (a `CNAME` to Vercel at the DNS provider).
