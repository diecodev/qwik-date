import { $, component$ } from "@builder.io/qwik";
import * as Calendar from "./lib/headless";

export default component$(() => {
  const onDateSelect$ = $((date: string | null) => {
    return console.log({ date });
  });
  return (
    <>
      <head>
        <meta charSet="utf-8" />
        <title>Qwik Blank App</title>
      </head>
      <body>
        <Calendar.Root completeWeeks locale="es" theme="light">
          <Calendar.Header>
            <Calendar.HeaderTitle />
            <Calendar.Previous />
            <Calendar.Next />
          </Calendar.Header>
          <Calendar.Grid>
            <Calendar.GridWeekdays />
            <Calendar.GridDays
              onClick$={(_, target) => {
                const date = target.getAttribute("data-value");
                onDateSelect$(date);
              }}
            />
          </Calendar.Grid>
        </Calendar.Root>
      </body>
    </>
  );
});
