import {
  $,
  component$,
  Slot,
  sync$,
  useComputed$,
  useContextProvider,
  useId,
  useOnWindow,
  useSignal,
} from "@builder.io/qwik";
import { QwikDateCtx, QwikDateCtxId } from "./context";

interface RootProps {
  completeWeeks?: boolean;
  activeDate?: Date;
  minDate?: Date;
  maxDate?: Date;
  locale?: "en" | "es";
  theme?: "light" | "dark" | "system";
  dir?: "ltr" | "rtl" | "auto";
}

const generateMinDate = (activeDate: Date) => {
  const minDateYear = activeDate.getFullYear() - 100;
  return new Date(minDateYear, 0, 1);
};

const generateMaxDate = (activeDate: Date) => {
  const maxDateYear = activeDate.getFullYear() + 100;
  return new Date(maxDateYear, 11, 31);
};

export const CalendarRoot = component$<RootProps>(
  ({
    completeWeeks = false,
    activeDate: activeDateProp,
    dir = "auto",
    maxDate: maxDateProp,
    locale = "en",
    minDate: minDateProp,
    theme = "system",
  }) => {
    if (
      minDateProp &&
      maxDateProp &&
      minDateProp?.toString() === maxDateProp?.toString()
    ) {
      throw new Error(
        "minDate and maxDate cannot be the same date, please provide a valid range of dates"
      );
    }

    if (minDateProp && maxDateProp && minDateProp > maxDateProp) {
      throw new Error(
        "minimum date cannot be greater than maximum date, please provide a valid range of dates"
      );
    }

    // signals and constants
    const activeDate = useSignal<Date>(activeDateProp ?? new Date());
    const dateToRender = useSignal<Date>(activeDate.value);

    // computed values
    const minDate = useComputed$<Date>(
      () => minDateProp ?? generateMinDate(activeDate.value)
    );
    const maxDate = useComputed$<Date>(
      () => maxDateProp ?? generateMaxDate(activeDate.value)
    );

    // refs
    const triggerRef = useSignal<HTMLButtonElement>();

    // context stuffs
    const localId = useId();
    const contentId = `${localId}-content`;
    const ctx: QwikDateCtx = {
      triggerRef,
      contentId,
      minDate,
      maxDate,
      activeDate,
      dateToRender,
      locale,
      theme,
      completeWeeks,
    };

    useContextProvider(QwikDateCtxId, ctx);

    const updateDefaultDateIfNeeded = $(() => {
      if (activeDateProp) return;

      activeDate.value = new Date();
    });

    useOnWindow(
      "DOMContentLoaded",
      sync$(() => {
        const contentEl = document.querySelector("[data-qwik-date]");
        if (!contentEl) {
          throw new Error("Content ref not found");
        }

        function onMountThemeHandler() {
          const selectedTheme = contentEl?.getAttribute("data-theme");

          if (selectedTheme !== "system") return;

          const themeFromLocalStorage = localStorage.getItem("theme");
          const themeFromMediaQuery =
            window.matchMedia &&
            window.matchMedia("(prefers-color-scheme: dark)").matches
              ? "dark"
              : "light";

          contentEl?.setAttribute(
            "data-theme",
            themeFromLocalStorage ?? themeFromMediaQuery
          );

          localStorage.setItem(
            "theme",
            themeFromLocalStorage ?? themeFromMediaQuery
          );
        }

        function onMountDirHandler() {
          const dir = contentEl?.getAttribute("dir")!;

          if (dir && dir !== "auto") return;

          const newDir = window.getComputedStyle(
            document.documentElement
          ).direction;
          contentEl?.setAttribute("dir", newDir);

          const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
              if (
                mutation.type === "attributes" &&
                mutation.attributeName === "dir"
              ) {
                const value = (mutation.target as HTMLElement).getAttribute(
                  "dir"
                );
                if (value === "auto" || !value) {
                  return contentEl?.setAttribute("dir", newDir);
                }
                contentEl?.setAttribute("dir", value);
              }
            });
          });

          observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["dir"],
          });
        }

        onMountThemeHandler();
        onMountDirHandler();

        // grab the user's timezone preference
      })
    );

    useOnWindow("DOMContentLoaded", updateDefaultDateIfNeeded);

    return (
      <div data-theme={theme} dir={dir} data-qwik-date>
        <Slot />
      </div>
    );
  }
);
