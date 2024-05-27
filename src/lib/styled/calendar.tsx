import {
  Component,
  component$,
  Fragment,
  isSignal,
  PropsOf,
  QRL,
  useStyles$,
} from "@builder.io/qwik";
import { DateFormat, formatDate, Separator } from "../core";
import * as HeadlessCalendar from "../headless";
import styles from "./style.css?inline";

type CalendarRootProps = PropsOf<typeof HeadlessCalendar.Root>;

interface QwikDateProps extends CalendarRootProps {
  showWeekNumbers?: boolean;
  showWeekdays?: boolean;
  onDateSelect$?: QRL<(date: string) => any>;
  prevButtonProps?: PropsOf<"button">;
  nextButtonProps?: PropsOf<"button">;
  headerProps?: PropsOf<"header">;
  dateButtonProps?: PropsOf<"button">;
  format?: DateFormat;
  separator?: Separator;
  mode?: "single";
  edgeArrows?: boolean;
  arrowLeftIcon?: Component;
  arrowRightIcon?: Component;
}

export const Calendar = component$<QwikDateProps>(
  ({
    mode = "single",
    headerProps,
    format = "yyyy-mm-dd",
    dateButtonProps,
    onDateSelect$,
    nextButtonProps,
    prevButtonProps,
    showWeekNumbers = false,
    showWeekdays = true,
    separator = "-",
    edgeArrows = false,
    arrowLeftIcon,
    arrowRightIcon,
    ...props
  }) => {
    useStyles$(styles);

    return (
      <HeadlessCalendar.Root {...props} data-mode={mode}>
        <HeadlessCalendar.Header>
          {edgeArrows ? (
            <Fragment>
              <HeadlessCalendar.Previous />
              <HeadlessCalendar.HeaderTitle />
              <HeadlessCalendar.Next />
            </Fragment>
          ) : (
            <Fragment>
              <HeadlessCalendar.HeaderTitle {...headerProps} />
              <div class="arrows-container">
                <HeadlessCalendar.Previous
                  icon={arrowLeftIcon}
                  {...prevButtonProps}
                />
                <HeadlessCalendar.Next
                  icon={arrowRightIcon}
                  {...nextButtonProps}
                />
              </div>
            </Fragment>
          )}
        </HeadlessCalendar.Header>
        <HeadlessCalendar.Grid>
          {showWeekdays && <HeadlessCalendar.GridWeekdays />}
          <HeadlessCalendar.GridDays
            onClick$={(_, target) => {
              const date = target.getAttribute("data-value")!;

              const formattedDate = formatDate({
                date,
                dateFormat: format,
                locale: isSignal(props.locale)
                  ? props.locale.value
                  : props.locale,
                separator,
              });

              onDateSelect$?.(formattedDate);
            }}
          />
        </HeadlessCalendar.Grid>
      </HeadlessCalendar.Root>
    );
  }
);
