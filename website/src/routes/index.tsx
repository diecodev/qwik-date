import { $, component$, useSignal } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { Calendar } from "qwik-date";
import { toast, Toaster } from "qwik-sonner";
import { Customize } from "~/components/customize";

import "@fontsource-variable/onest";
import { ScriptCode } from "~/components/script";
import { Docs } from "~/components/docs";
import { Footer } from "~/components/footer";

export default component$(() => {
  const theme = useSignal<"light" | "dark">("light");
  const locale = useSignal<"en" | "es">("en");
  const edgeArrows = useSignal<boolean>(false);
  const onDateSelectSig = useSignal<boolean>(false);
  const completeWeeks = useSignal<boolean>(false);
  const format = useSignal<any>("yyyy-mm-dd");
  const separator = useSignal<any>("-");
  const dir = useSignal<"ltr" | "rtl">("ltr");
  const id = useSignal<string>("date-id");

  const onDateSelect$ = $((date: string) => {
    toast("Date selected", {
      description: `The selected date is ${date}`,
      id: id.value,
    });
  });

  return (
    <>
      <Toaster theme={theme.value} />
      <main class="mx-auto flex max-w-screen-sm flex-col gap-12 px-4 pb-8 pt-24">
        <header>
          <h1 class="text-center text-5xl font-bold leading-snug dark:text-white">
            Qwik Date
          </h1>
          <p class="text-center text-lg dark:text-neutral-400">
            Qwik calendar, simple integration.
          </p>
        </header>
        <section class="flex justify-center">
          <Calendar
            theme={theme.value}
            defaultDate={new Date().toISOString()}
            onDateSelect$={onDateSelectSig.value ? onDateSelect$ : undefined}
            completeWeeks={completeWeeks}
            edgeArrows={edgeArrows.value}
            locale={locale}
            format={format.value}
            separator={separator.value}
            dir={dir.value}
          />
        </section>
        <section>
          <Customize
            theme={theme}
            locale={locale}
            edgeArrows={edgeArrows}
            onDateSelectSig={onDateSelectSig}
            completeWeeks={completeWeeks}
            format={format}
            separator={separator}
            dir={dir}
          />
        </section>
        <ScriptCode />
        <Docs />
      </main>
      <Footer />
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
