import { Slot, component$ } from '@builder.io/qwik'
import { routeLoader$ } from '@builder.io/qwik-city'
import type { RequestHandler } from '@builder.io/qwik-city'
import { Toaster } from 'qwik-sonner'

export const onGet: RequestHandler = async ({ cacheControl, redirect, url }) => {
  const {host} = url;
  // redirect to custom domain
  if (host === 'qwik-date.deno.dev') {
    throw redirect(301, "https://qwik-date.dieco.dev");
  }

  // Control caching for this request for best performance and to reduce hosting costs:
  // https://qwik.dev/docs/caching/
  cacheControl({
    // Always serve a cached response by default, up to a week stale
    staleWhileRevalidate: 60 * 60 * 24 * 7,
    // Max once every 5 seconds, revalidate on the server to get a fresh version of this page
    maxAge: 5,
  })
}

export const useServerTimeLoader = routeLoader$(() => {
  return {
    date: new Date().toISOString(),
  }
})

export default component$(() => {
  return (
    <>
      <main>
        <Toaster />
        <Slot />
      </main>
    </>
  )
})
