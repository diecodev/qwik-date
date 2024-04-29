import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";

import { hello as Hello } from "qwik-calendar";

export default component$(() => {
  return (
    <>
      <h1>proof style modules</h1>
      <Hello />
    </>
  );
});

export const head: DocumentHead = {
  title: "Welcome to Qwik",
  meta: [
    {
      name: "description",
      content: "Qwik site description",
    },
  ],
};
