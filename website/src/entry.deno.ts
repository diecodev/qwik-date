/*
 * WHAT IS THIS FILE?
 *
 * It's the entry point for the Deno HTTP server when building for production.
 *
 * Deno Deploy serves the prerendered `dist/` folder as a static app (see
 * `deno.json` at the repo root), so this server is only needed to run the
 * production build locally (`pnpm serve`) or to switch the app to the
 * "Dynamic" runtime in the Deno Deploy dashboard.
 *
 * Learn more about the Deno integration here:
 * - https://qwik.dev/docs/deployments/deno/
 * - https://docs.deno.com/runtime/tutorials/http_server
 *
 */
import { createQwikRouter } from "@qwik.dev/router/middleware/deno";
import render from "./entry.ssr";

// Create the Qwik Router Deno middleware
const { router, staticFile } = createQwikRouter({
  render,
  static: {
    cacheControl: "public, max-age=31536000, immutable",
  },
});

// Allow for dynamic port
const port = Number(Deno.env.get("PORT") ?? 3009);

/* eslint-disable */
console.log(`Server starter: http://localhost:${port}/`);

Deno.serve({ port }, async (request: Request, info: any) => {
  const staticResponse = await staticFile(request);
  if (staticResponse) {
    return staticResponse;
  }

  // Server-side render this request with Qwik Router
  return (await router(request, info))!;
});

declare const Deno: any;
