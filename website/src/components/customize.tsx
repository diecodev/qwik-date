import { $, component$, type Signal } from "@builder.io/qwik";
import { Button } from "./button";
import { toast } from "qwik-sonner";

interface Props {
  theme: Signal<"light" | "dark">;
  locale: Signal<"en" | "es">;
  edgeArrows: Signal<boolean>;
  onDateSelectSig: Signal<boolean>;
  completeWeeks: Signal<boolean>;
  format: Signal<any>;
  separator: Signal<any>;
  dir: Signal<"ltr" | "rtl">;
}

export const Customize = component$<Props>(
  ({
    completeWeeks,
    dir,
    edgeArrows,
    format,
    locale,
    onDateSelectSig,
    separator,
    theme,
  }) => {
    return (
      <div class="mx-auto flex max-w-sm flex-wrap justify-center gap-4">
        <Button
          onClick$={() => {
            //change the html tag theme attribute
            const html = document.querySelector("html");
            if (html) {
              html.classList.toggle("dark");
            }
            theme.value = theme.value === "dark" ? "light" : "dark";
            toast("Change applied", {
              description: `Theme changed to ${theme.value}`,
            });
          }}
          active={theme.value === "dark"}
        >
          theme
        </Button>
        <Button
          onClick$={() => {
            locale.value = locale.value === "es" ? "en" : "es";
            toast("Change applied", {
              description: `Locale changed to ${locale.value}`,
            });
          }}
          active={locale.value === "es"}
        >
          locale
        </Button>
        <Button
          onClick$={$(() => {
            onDateSelectSig.value = !onDateSelectSig.value;
            toast("Change applied", {
              description: `onDateSelect$ is ${
                onDateSelectSig.value ? "enabled" : "disabled"
              }`,
            });
          })}
          active={onDateSelectSig.value}
        >
          onDateSelect$
        </Button>
        <Button
          onClick$={() => {
            edgeArrows.value = !edgeArrows.value;
            toast("Change applied", {
              description: `edgeArrows is ${
                edgeArrows.value ? "enabled" : "disabled"
              }`,
            });
          }}
          active={edgeArrows.value}
        >
          edgeArrows
        </Button>
        <Button
          onClick$={() => {
            completeWeeks.value = !completeWeeks.value;
            toast("Change applied", {
              description: `completeWeeks is ${
                completeWeeks.value ? "enabled" : "disabled"
              }`,
            });
          }}
          active={completeWeeks.value}
        >
          completeWeeks
        </Button>
        <Button
          onClick$={$(() => {
            separator.value = separator.value === "-" ? "." : "-";
            toast("Change applied", {
              description: `separator changed to ${separator.value}`,
            });
          })}
          active={separator.value === "."}
        >
          separator
        </Button>
        <Button
          onClick$={$(() => {
            format.value =
              format.value === "yyyy-mm-dd" ? "dd/mm/yyyy" : "yyyy-mm-dd";
            toast("Change applied", {
              description: `the new format is ${format.value}`,
            });
          })}
          active={format.value === "dd/mm/yyyy"}
        >
          format
        </Button>
        <Button
          onClick$={$(() => {
            dir.value = dir.value === "rtl" ? "ltr" : "rtl";
            toast("Change applied", {
              description: `dir changed to ${dir.value}`,
            });
          })}
          active={dir.value === "rtl"}
        >
          dir
        </Button>
      </div>
    );
  },
);
