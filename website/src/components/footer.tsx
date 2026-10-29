import { component$ } from '@qwik.dev/core'

export const Footer = component$(() => (
  <footer class="footer">
    <div class="footer-in">
      <span>
        made by <a href="https://dieco.dev">@diecodev</a>
      </span>
      <a href="https://github.com/diecodev/qwik-date">github</a>
      <a href="https://www.npmjs.com/package/qwik-date">npm</a>
      <a href="https://qwik-sonner.dieco.dev">qwik-sonner</a>
      <a href="/llms.txt">llms.txt</a>
    </div>
  </footer>
))
