import {
  $,
  Component,
  component$,
  Fragment,
  PropsOf,
  QRL,
  useOnWindow,
  useStyles$,
  useVisibleTask$,
} from "@builder.io/qwik";
import { DateFormat, formatDate, Separator } from "../core";
import * as HeadlessCalendar from "../headless";
import styles from "./style.css?inline";
import { getClientLocalDate } from "../core/utils/timezone-formatter";

type CalendarRootProps = PropsOf<typeof HeadlessCalendar.Root>;

interface QwikDateProps extends CalendarRootProps {
  showWeekNumbers?: boolean;
  showWeekdays?: boolean;
  onDateChange$?: QRL<(date: string) => any>;
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
    onDateChange$,
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
                locale: props.locale,
                separator,
              });

              onDateChange$?.(formattedDate);
            }}
          />
        </HeadlessCalendar.Grid>
      </HeadlessCalendar.Root>
    );
  }
);
