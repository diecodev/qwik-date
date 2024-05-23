import type { Signal } from "@builder.io/qwik";
import { createContextId } from "@builder.io/qwik";

export const QwikDateCtxId = createContextId<QwikDateCtx>("Qwik-Date");

export type CalendarState = "open" | "closed";

export type QwikDateCtx = {
  triggerRef: Signal<HTMLButtonElement | undefined>;
  contentId: string;
  completeWeeks: boolean;
  minDate: Readonly<Signal<Date>>;
  maxDate: Readonly<Signal<Date>>;
  activeDate: Signal<Date>;
  dateToRender: Signal<Date>;
  locale: "en" | "es";
  theme: "light" | "dark" | "system";
};
