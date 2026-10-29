import { component$ } from '@qwik.dev/core';
import { RouterOutlet, useQwikRouter } from '@qwik.dev/router';

export default component$(() => {
  useQwikRouter();

  return (
    <>
      <head>
        <meta charset='utf-8' />
        <title>Qwik Blank App</title>
        <meta name='viewport' content='width=device-width, initial-scale=1' />
      </head>
      <body lang='en'>
        <RouterOutlet />
      </body>
    </>
  );
});
