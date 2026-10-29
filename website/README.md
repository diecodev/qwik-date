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

The site is fully prerendered, so Vercel serves `dist/` as static files: no functions.

**Production** deploys from GitHub Actions ([`website.yml`](../.github/workflows/website.yml)), which
builds with the Vercel CLI (`vercel build --prod`, then `vercel deploy --prebuilt --prod`):

- after each release, once the new version is public on npm (`release.yml` calls it);
- on each push to `main` that changes `website/` or `vercel.json`;
- by hand (Actions → Website → Run workflow).

It needs three repository secrets: `VERCEL_TOKEN`, `VERCEL_ORG_ID` (the team's ID) and
`VERCEL_PROJECT_ID`.

**Previews** come from Vercel's Git integration, which builds nothing for `main`
(`git.deploymentEnabled`). Its Ignored Build Step, [`scripts/vercel-preview.sh`](./scripts/vercel-preview.sh),
skips every branch that doesn't change `website/` or `vercel.json` compared with `main`. The previews
are only seen in Vercel's dashboard: in the project's Git settings, the pull request and commit comments,
the `deployment_status` events and the commit statuses are off. A pull request from a fork waits for a
maintainer to authorize it there (Git Fork Protection, in the Security settings).

The build settings live in [`vercel.json`](../vercel.json) at the repo root:

| Setting          | Value                                                         |
| ---------------- | ------------------------------------------------------------- |
| Root directory   | repo root (the default): the build needs the library          |
| Framework preset | none (`"framework": null`)                                    |
| Install command  | the default: `pnpm install`                                   |
| Build command    | `pnpm build.website`                                          |
| Output directory | `website/dist`                                                |

pnpm is the one in `package.json`'s `packageManager`: the CI's setup installs it, and Vercel reads it
for the previews (without it, it would pick pnpm 10 for this lockfile).

`trailingSlash` matches the URLs of the pages (`/calendar/`), `404.html` answers the missing ones, and
`/build/` and `/assets/` (hashed file names) are cached for a year.
