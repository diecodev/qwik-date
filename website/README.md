# qwik-date website

Demo and docs site for `qwik-date`, built with Qwik v2 + [Qwik Router](https://qwik.dev/docs/) and
deployed to [Deno Deploy](https://docs.deno.com/deploy/) at <https://qwik-date.dieco.dev>.

It consumes the library through `workspace:*`, i.e. from the built `lib/` folder at the repo root,
so **build the library first** (`pnpm build.types && pnpm build.lib` from the root).

## Commands

```shell
pnpm dev            # dev server (SSR)
pnpm build.types    # typecheck
pnpm build.client   # client build -> dist/
pnpm build.server   # Deno server build -> server/, and prerenders every route into dist/ (SSG)
pnpm serve          # runs the production build locally with Deno (needs build.client + build.server)
```

From the repo root, `pnpm build.website` runs the whole chain (library + client + server/SSG).

## Deployment (Deno Deploy)

The site is fully prerendered, so it runs as a **static** app on the new Deno Deploy
(console.deno.com). There is no GitHub Actions workflow: Deno Deploy's GitHub integration builds
every push to `main` on its own servers.

The build settings live in [`deno.json`](../deno.json) at the repo root, under the `deploy` key.
When that key is present, Deno Deploy takes the configuration from the file and ignores the build
settings in the dashboard:

| Setting         | Value                                |
| --------------- | ------------------------------------ |
| App directory   | repo root (the default)              |
| Install command | `pnpm install --no-frozen-lockfile`  |
| Build command   | `pnpm build.website`                 |
| Runtime         | Static, directory `./website/dist`   |

One-time setup in the dashboard: create an app, link it to the `diecodev/qwik-date` GitHub repo,
leave the app directory as the repo root, and add the custom domain `qwik-date.dieco.dev`.

To use SSR instead of static files, change `deploy.runtime` in `deno.json` to
`{ "type": "dynamic", "entrypoint": "./website/server/entry.deno.js" }` (`src/entry.deno.ts` is
that server). Change it in the file, not in the dashboard: the file takes precedence.
