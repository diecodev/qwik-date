import {
  $,
  component$,
  PropsOf,
  Slot,
  sync$,
  useComputed$,
  useContextProvider,
  useId,
  useOnWindow,
  useSignal,
} from "@builder.io/qwik";
import { QwikDateCtx, QwikDateCtxId } from "./context";
import { generateMaxDate, generateMinDate } from "../core";

interface RootProps extends PropsOf<"div"> {
  completeWeeks?: boolean;
  defaultDate?: string;
  minDate?: Date;
  maxDate?: Date;
  locale?: "en" | "es";
  theme?: "light" | "dark" | "system";
  dir?: "ltr" | "rtl" | "auto";
}

export const CalendarRoot = component$<RootProps>(
  ({
    completeWeeks = false,
    defaultDate,
    dir = "auto",
    maxDate: maxDateProp,
    locale = "en",
    minDate: minDateProp,
    theme = "system",
    ...props
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

    const defaultDateParsed = defaultDate ? new Date(defaultDate) : new Date();

    // signals and constants
    const activeDate = useSignal<Date | null>(null);
    const dateToRender = useSignal<Date>(defaultDateParsed);

    // computed values
    const minDate = useComputed$<Date>(
      () => minDateProp ?? generateMinDate(defaultDateParsed)
    );
    const maxDate = useComputed$<Date>(
      () => maxDateProp ?? generateMaxDate(defaultDateParsed)
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
      defaultDate,
      dateToRender,
      locale,
      theme,
      completeWeeks,
      activeDate,
    };

    useContextProvider(QwikDateCtxId, ctx);

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

        function onMountPreSelectionHandler() {
          const dayEl = document.querySelectorAll("button[data-qwik-date-day]");

          if (!dayEl) return;

          dayEl.forEach((el) => {
            const contentDay = contentEl?.getAttribute("data-default-date");
            const btnDay = el.getAttribute("data-value");

            if (!btnDay) return;

            if (contentDay === btnDay) {
              el.setAttribute("data-pre-selected", "true");
            }
          });
        }

        onMountThemeHandler();
        onMountDirHandler();
        onMountPreSelectionHandler();
      })
    );

    return (
      <div
        {...props}
        data-theme={theme}
        dir={dir}
        data-default-date={defaultDate}
        data-qwik-date
      >
        <Slot />
      </div>
    );
  }
);
