import { component$ } from '@qwik.dev/core'
import {
  RouterOutlet,
  ServiceWorkerRegister,
  useQwikRouter,
} from '@qwik.dev/router'
import { RouterHead } from './components/router-head/router-head'

import './global.css'

export default component$(() => {
  /**
   * The root of a Qwik Router site always starts with `useQwikRouter()`,
   * followed by the document's <head> and <body>.
   *
   * Don't remove the `<head>` and `<body>` elements.
   */
  useQwikRouter()

  return (
    <>
      <head>
        <meta charset="utf-8" />
        <link rel="manifest" href="/manifest.json" />
        <RouterHead />
        {/* the theme chosen with the header's toggle, before the first paint: without one, the system's */}
        <script
          dangerouslySetInnerHTML={
            "try{var t=localStorage.getItem('theme');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t}catch(e){}"
          }
        />
        {/* Qwik v2 has no service worker: this only unregisters the one installed by the v1 site. */}
        <ServiceWorkerRegister />
      </head>
      <body lang="en">
        <RouterOutlet />
      </body>
    </>
  )
})
