export {
  CalendarNext as Next,
  CalendarPrevious as Previous,
} from "./calendar-arrows";
export {
  CalendarHeader as Header,
  CalendarHeaderTitle as HeaderTitle,
} from "./calendar-header";
export { CalendarRoot as Root } from "./calendar-root";
export {
  CalendarDays as GridDays,
  CalendarGrid as Grid,
  CalendarWeekdays as GridWeekdays,
} from "./calendar-grid";

// interface CalendarContentProps {
//   state: CalendarState;
//   showArrows?: boolean;
//   showWeekNumbers?: boolean;
//   showWeekdays?: boolean;
//   showMonth?: boolean;
//   showYear?: boolean;
//   onMonthChange$?: QRL<(month: number) => any>;
//   onYearChange$?: QRL<(year: number) => any>;
//   onDateChange$?: QRL<(date: string) => any>;
//   arrowLeftProps?: PropsOf<"button">;
//   arrowRightProps?: PropsOf<"button">;
//   headerProps?: PropsOf<"header">;
//   monthProps?: PropsOf<"button">;
//   yearProps?: PropsOf<"button">;
//   dateProps?: PropsOf<"button">;
//   completeWeeks?: boolean;
//   defaultDate?: Date;
//   startAt?: Date;
//   endAt?: Date;
//   format?: DateFormat;
//   separator?: Separator;
//   locale?: "en" | "es";
//   theme?: "light" | "dark" | "system";
//   dir?: "ltr" | "rtl";
// mode: Signal<"range" | "single">;
// }
