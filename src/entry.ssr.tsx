/**
 * WHAT IS THIS FILE?
 *
 * SSR renderer for the local playground (`pnpm dev`), used by Qwik Router.
 * It is not part of the published library.
 */
import { createRenderer } from "@qwik.dev/router";
import Root from "./root";

export default createRenderer((opts) => {
  return {
    jsx: <Root />,
    options: opts,
  };
});
